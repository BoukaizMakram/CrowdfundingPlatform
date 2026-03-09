'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  getAllCampaigns, getAllDonations, updateCampaignStatus, deleteCampaign,
  getDonationsByCampaign, getAllPayoutRequests, updatePayoutRequestStatus,
  getCampaignsByCreator, getDonationsByDonor, getPayoutRequestsByUser
} from '@/lib/supabase-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Campaign, Donation, PayoutRequest, PayoutRequestStatus } from '@/types'

type AdminUser = {
  id: string
  email: string
  full_name: string
  phone?: string | null
  payout_method?: string | null
  payout_email?: string | null
  created_at: string
}

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
const ADMIN_PIN = '9637'

type AdminState = 'checking' | 'unauthorized' | 'pin' | 'verified'
type Tab = 'campaigns' | 'donations' | 'payouts' | 'users'
type CampaignFilter = 'all' | 'pending' | 'approved' | 'rejected'

export default function AdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [adminState, setAdminState] = useState<AdminState>('checking')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  const [activeTab, setActiveTab] = useState<Tab>('campaigns')
  const [campaignFilter, setCampaignFilter] = useState<CampaignFilter>('pending')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donations, setDonations] = useState<(Donation & { campaign?: Campaign })[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Expanded user details
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [userDetails, setUserDetails] = useState<{
    campaigns: Campaign[]
    donations: (Donation & { campaign?: Campaign })[]
    payouts: PayoutRequest[]
  } | null>(null)
  const [userDetailsLoading, setUserDetailsLoading] = useState(false)

  // Payout admin notes
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({})

  // Check admin access
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login'); return }
    if (user.email !== ADMIN_EMAIL) { setAdminState('unauthorized'); return }

    const verified = sessionStorage.getItem('admin_verified')
    const verifiedAt = sessionStorage.getItem('admin_verified_at')
    if (verified === 'true' && verifiedAt) {
      const elapsed = Date.now() - parseInt(verifiedAt)
      if (elapsed < 30 * 60 * 1000) { setAdminState('verified'); return }
      sessionStorage.removeItem('admin_verified')
      sessionStorage.removeItem('admin_verified_at')
    }
    setAdminState('pin')
  }, [authLoading, user, router])

  const verifyPin = () => {
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem('admin_verified', 'true')
      sessionStorage.setItem('admin_verified_at', Date.now().toString())
      setAdminState('verified')
    } else {
      setPinError('Incorrect PIN')
      setPin('')
    }
  }

  // Fetch data when verified
  useEffect(() => {
    if (adminState !== 'verified') return
    async function fetchData() {
      const [campaignsData, donationsData, payoutsData, usersRes] = await Promise.all([
        getAllCampaigns(),
        getAllDonations(),
        getAllPayoutRequests(),
        fetch('/api/admin/users').then(r => r.json()),
      ])
      setCampaigns(campaignsData)
      setDonations(donationsData)
      setPayoutRequests(payoutsData)
      setUsers(usersRes.users || [])
      setDataLoading(false)
    }
    fetchData()
  }, [adminState])

  // Load user details when expanded
  const toggleUserExpand = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null)
      setUserDetails(null)
      return
    }
    setExpandedUserId(userId)
    setUserDetailsLoading(true)
    const [uCampaigns, uDonations, uPayouts] = await Promise.all([
      getCampaignsByCreator(userId),
      getDonationsByDonor(userId),
      getPayoutRequestsByUser(userId),
    ])
    setUserDetails({ campaigns: uCampaigns, donations: uDonations, payouts: uPayouts })
    setUserDetailsLoading(false)
  }

  const filteredCampaigns = campaignFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === campaignFilter)

  const handleCampaignAction = async (campaignId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'approved' : 'rejected'
    const success = await updateCampaignStatus(campaignId, status)
    if (success) {
      setCampaigns(prev => prev.map(c => c.id === campaignId ? { ...c, status } as Campaign : c))
    }
  }

  const handleDelete = async (campaign: Campaign) => {
    setDeleting(true)
    const campaignDonations = await getDonationsByCampaign(campaign.id)
    const backup = {
      exported_at: new Date().toISOString(),
      campaign: { ...campaign },
      donations: campaignDonations,
      summary: { total_donations: campaignDonations.length, total_raised: campaign.raised_amount, goal: campaign.goal_amount },
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-backup-${campaign.id}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    const success = await deleteCampaign(campaign.id)
    if (success) {
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id))
      setDonations(prev => prev.filter(d => d.campaign_id !== campaign.id))
    }
    setDeleteTarget(null)
    setDeleting(false)
  }

  const handlePayoutAction = async (id: string, status: PayoutRequestStatus) => {
    const note = noteInputs[id] || undefined
    const success = await updatePayoutRequestStatus(id, status, note)
    if (success) {
      setPayoutRequests(prev => prev.map(r => r.id === id ? { ...r, status, admin_note: note || r.admin_note, updated_at: new Date().toISOString() } : r))
    }
  }

  const stats = {
    totalCampaigns: campaigns.length,
    pendingCampaigns: campaigns.filter(c => c.status === 'pending').length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.raised_amount, 0),
    totalDonations: donations.length,
    pendingPayouts: payoutRequests.filter(r => r.status === 'pending').length,
    totalUsers: users.length,
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
  }

  // ── Loading ──
  if (authLoading || adminState === 'checking') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  // ── Unauthorized ──
  if (adminState === 'unauthorized') {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8">You do not have admin privileges.</p>
        <Link href="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    )
  }

  // ── PIN Entry ──
  if (adminState === 'pin') {
    return (
      <div className="max-w-md mx-auto px-4 pt-32 text-center">
        <div className="w-16 h-16 bg-[#274a34] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin PIN</h1>
        <p className="text-gray-500 mb-8">Enter your 4-digit PIN to continue</p>
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="****"
            value={pin}
            onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 4); setPin(val); setPinError('') }}
            onKeyDown={(e) => { if (e.key === 'Enter' && pin.length === 4) verifyPin() }}
            error={pinError}
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />
          <Button onClick={verifyPin} disabled={pin.length !== 4} className="w-full">Unlock</Button>
        </div>
      </div>
    )
  }

  // ── Verified Admin Dashboard ──
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Verified</span>
          </div>
          <p className="text-gray-600">Manage campaigns, users, payouts, and donations</p>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem('admin_verified'); sessionStorage.removeItem('admin_verified_at'); router.push('/') }}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >Lock Admin</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Pending Review</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pendingCampaigns}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Raised</p>
          <p className="text-2xl font-bold text-emerald-500">{formatCurrency(stats.totalRaised)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Donations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Pending Payouts</p>
          <p className="text-2xl font-bold text-amber-500">{stats.pendingPayouts}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Users</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {([
            { key: 'campaigns', label: 'Campaigns' },
            { key: 'donations', label: 'Donations' },
            { key: 'payouts', label: 'Payouts', badge: stats.pendingPayouts },
            { key: 'users', label: 'Users' },
          ] as { key: Tab; label: string; badge?: number }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'border-b-2 border-[#274a34] text-[#274a34]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.badge ? (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">{tab.badge}</span>
              ) : null}
            </button>
          ))}
        </nav>
      </div>

      {dataLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* ═══ Campaigns Tab ═══ */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as CampaignFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCampaignFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      campaignFilter === filter ? 'bg-[#274a34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'pending' && stats.pendingCampaigns > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">{stats.pendingCampaigns}</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div key={campaign.id} className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-32 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0">
                        <img src={campaign.cover_image_url} alt={campaign.title} className="absolute inset-0 w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link href={`/campaign/${campaign.id}`} className="text-lg font-semibold text-gray-900 hover:text-[#274a34]">{campaign.title}</Link>
                            <p className="text-sm text-gray-500 mt-1">by {campaign.creator_name} · {formatDate(campaign.created_at)}</p>
                            <p className="text-sm text-gray-600 mt-2">Goal: {formatCurrency(campaign.goal_amount)} · Raised: {formatCurrency(campaign.raised_amount)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[campaign.status]}`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>
                        <div className="mt-4 flex gap-3">
                          {campaign.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleCampaignAction(campaign.id, 'approve')}>Approve</Button>
                              <Button variant="outline" size="sm" onClick={() => handleCampaignAction(campaign.id, 'reject')} className="text-red-500 border-red-500 hover:bg-red-50">Reject</Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(campaign)} className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-auto">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredCampaigns.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500">No campaigns found.</p></div>
                )}
              </div>
            </div>
          )}

          {/* ═══ Donations Tab ═══ */}
          {activeTab === 'donations' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Breakdown</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 font-medium text-sm">{donation.is_anonymous ? '?' : donation.donor_name[0]}</span>
                            </div>
                            <span className="text-gray-900">{donation.is_anonymous ? 'Anonymous' : donation.donor_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/campaign/${donation.campaign_id}`} className="text-gray-900 hover:text-[#274a34] truncate block max-w-[200px]">
                            {donation.campaign?.title || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-emerald-600">{formatCurrency(donation.amount)}</div>
                          <div className="text-xs text-gray-400">Paid: {formatCurrency(donation.donor_total_paid || donation.amount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-xs space-y-0.5">
                            <div className="text-gray-600">Platform: <span className="font-medium">{formatCurrency(donation.platform_fee || 0)}</span>{donation.cover_platform_fee && <span className="text-emerald-600 ml-1">(covered)</span>}</div>
                            <div className="text-gray-600">Stripe: <span className="font-medium">{formatCurrency(donation.stripe_fee || 0)}</span></div>
                            <div className="text-[#274a34] font-medium">Net: {formatCurrency(donation.net_to_campaign || donation.amount)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[donation.payment_status || 'pending']}`}>
                            {(donation.payment_status || 'pending').charAt(0).toUpperCase() + (donation.payment_status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatDate(donation.created_at)}</td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No donations yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══ Payouts Tab ═══ */}
          {activeTab === 'payouts' && (
            <div className="space-y-4">
              {payoutRequests.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500">No payout requests.</p></div>
              ) : payoutRequests.map(req => {
                const reqUser = users.find(u => u.id === req.user_id)
                return (
                  <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-[#274a34] rounded-full flex items-center justify-center shrink-0">
                            <span className="text-white text-sm font-bold">{reqUser?.full_name?.[0]?.toUpperCase() || '?'}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{reqUser?.full_name || 'Unknown User'}</p>
                            <p className="text-xs text-gray-500 truncate">{reqUser?.email || req.user_id}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-3">
                          <div>
                            <span className="text-gray-400">Amount</span>
                            <p className="font-semibold text-gray-900">{formatCurrency(req.amount)}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Method</span>
                            <p className="font-semibold text-gray-900 capitalize">{req.payout_method}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Payout Email</span>
                            <p className="font-semibold text-gray-900 truncate">{req.payout_email}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Requested</span>
                            <p className="font-semibold text-gray-900">{formatDate(req.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="sm:text-right shrink-0">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${statusColors[req.status]}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                        {req.status === 'pending' && (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handlePayoutAction(req.id, 'approved')}>Approve</Button>
                              <Button variant="outline" size="sm" onClick={() => handlePayoutAction(req.id, 'rejected')} className="text-red-500 border-red-500 hover:bg-red-50">Reject</Button>
                            </div>
                            <input
                              type="text"
                              placeholder="Admin note..."
                              value={noteInputs[req.id] || ''}
                              onChange={(e) => setNoteInputs(prev => ({ ...prev, [req.id]: e.target.value }))}
                              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#274a34]"
                            />
                          </div>
                        )}
                        {req.status === 'approved' && (
                          <div>
                            <Button size="sm" onClick={() => handlePayoutAction(req.id, 'completed')}>Mark Completed</Button>
                          </div>
                        )}
                      </div>
                    </div>
                    {req.admin_note && (
                      <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100 italic">Note: {req.admin_note}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ═══ Users Tab ═══ */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              {users.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-500">No users found.</p></div>
              ) : users.map(u => (
                <div key={u.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* User Row */}
                  <button
                    onClick={() => toggleUserExpand(u.id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#274a34] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{u.full_name?.[0]?.toUpperCase() || '?'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{u.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                      <span>Joined {formatDate(u.created_at)}</span>
                      {u.payout_method && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">{u.payout_method}</span>
                      )}
                    </div>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedUserId === u.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded Details */}
                  {expandedUserId === u.id && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      {userDetailsLoading ? (
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-1/3" />
                          <div className="h-20 bg-gray-200 rounded" />
                        </div>
                      ) : userDetails ? (
                        <div className="space-y-5">
                          {/* User's Campaigns */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Campaigns ({userDetails.campaigns.length})</h4>
                            {userDetails.campaigns.length === 0 ? (
                              <p className="text-xs text-gray-400">No campaigns</p>
                            ) : (
                              <div className="space-y-2">
                                {userDetails.campaigns.map(c => (
                                  <div key={c.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                                    <img src={c.cover_image_url} alt="" className="w-8 h-8 rounded object-cover" />
                                    <div className="flex-1 min-w-0">
                                      <Link href={`/campaign/${c.id}`} className="text-xs font-medium text-gray-900 hover:text-[#274a34] truncate block">{c.title}</Link>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[c.status]}`}>{c.status}</span>
                                    <span className="text-xs text-gray-500">{formatCurrency(c.raised_amount)} / {formatCurrency(c.goal_amount)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* User's Donations */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Donations Made ({userDetails.donations.length})</h4>
                            {userDetails.donations.length === 0 ? (
                              <p className="text-xs text-gray-400">No donations</p>
                            ) : (
                              <div className="space-y-1">
                                {userDetails.donations.slice(0, 10).map(d => {
                                  const dc = d as Donation & { campaign?: Campaign }
                                  return (
                                    <div key={d.id} className="flex items-center gap-3 bg-white rounded-lg p-2 text-xs">
                                      <span className="font-medium text-gray-900">{formatCurrency(d.amount)}</span>
                                      <span className="text-gray-400">to</span>
                                      <span className="text-gray-700 truncate flex-1">{dc.campaign?.title || 'Unknown'}</span>
                                      <span className="text-gray-400">{formatDate(d.created_at)}</span>
                                    </div>
                                  )
                                })}
                                {userDetails.donations.length > 10 && (
                                  <p className="text-xs text-gray-400 px-2">+{userDetails.donations.length - 10} more</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* User's Payout Requests */}
                          <div>
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payout Requests ({userDetails.payouts.length})</h4>
                            {userDetails.payouts.length === 0 ? (
                              <p className="text-xs text-gray-400">No payout requests</p>
                            ) : (
                              <div className="space-y-1">
                                {userDetails.payouts.map(p => (
                                  <div key={p.id} className="flex items-center gap-3 bg-white rounded-lg p-2 text-xs">
                                    <span className="font-medium text-gray-900">{formatCurrency(p.amount)}</span>
                                    <span className="text-gray-400 capitalize">{p.payout_method}</span>
                                    <span className={`px-2 py-0.5 rounded-full ${statusColors[p.status]}`}>{p.status}</span>
                                    <span className="text-gray-400 ml-auto">{formatDate(p.created_at)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete Campaign</h3>
            <p className="text-sm text-gray-500 text-center mb-2">
              Are you sure you want to delete <strong>&quot;{deleteTarget.title}&quot;</strong>?
            </p>
            <p className="text-xs text-gray-400 text-center mb-6">A backup JSON file will be downloaded before deletion.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Download Backup & Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
