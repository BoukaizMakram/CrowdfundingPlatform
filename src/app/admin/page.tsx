'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { getAllCampaigns, getAllDonations, updateCampaignStatus, deleteCampaign, getDonationsByCampaign } from '@/lib/supabase-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Campaign, Donation } from '@/types'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || ''
const ADMIN_PIN = '9637'

type AdminState = 'checking' | 'unauthorized' | 'pin' | 'verified'
type Tab = 'campaigns' | 'donations'
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
  const [dataLoading, setDataLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Check admin access
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/auth/login')
      return
    }

    if (user.email !== ADMIN_EMAIL) {
      setAdminState('unauthorized')
      return
    }

    // Check if already verified this session (expires after 30 min)
    const verified = sessionStorage.getItem('admin_verified')
    const verifiedAt = sessionStorage.getItem('admin_verified_at')

    if (verified === 'true' && verifiedAt) {
      const elapsed = Date.now() - parseInt(verifiedAt)
      if (elapsed < 30 * 60 * 1000) {
        setAdminState('verified')
        return
      }
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
      const [campaignsData, donationsData] = await Promise.all([
        getAllCampaigns(),
        getAllDonations(),
      ])
      setCampaigns(campaignsData)
      setDonations(donationsData)
      setDataLoading(false)
    }
    fetchData()
  }, [adminState])

  const filteredCampaigns = campaignFilter === 'all'
    ? campaigns
    : campaigns.filter(c => c.status === campaignFilter)

  const handleCampaignAction = async (campaignId: string, action: 'approve' | 'reject') => {
    const status = action === 'approve' ? 'approved' : 'rejected'
    const success = await updateCampaignStatus(campaignId, status)
    if (success) {
      setCampaigns(prev =>
        prev.map(c =>
          c.id === campaignId ? { ...c, status } as Campaign : c
        )
      )
    }
  }

  const handleDelete = async (campaign: Campaign) => {
    setDeleting(true)

    // Fetch donations for this campaign for the backup
    const campaignDonations = await getDonationsByCampaign(campaign.id)

    // Build backup JSON
    const backup = {
      exported_at: new Date().toISOString(),
      campaign: { ...campaign },
      donations: campaignDonations,
      summary: {
        total_donations: campaignDonations.length,
        total_raised: campaign.raised_amount,
        goal: campaign.goal_amount,
      },
    }

    // Download backup file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `campaign-backup-${campaign.id}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Delete from DB
    const success = await deleteCampaign(campaign.id)
    if (success) {
      setCampaigns(prev => prev.filter(c => c.id !== campaign.id))
      setDonations(prev => prev.filter(d => d.campaign_id !== campaign.id))
    }

    setDeleteTarget(null)
    setDeleting(false)
  }

  const stats = {
    totalCampaigns: campaigns.length,
    pendingCampaigns: campaigns.filter(c => c.status === 'pending').length,
    totalRaised: campaigns.reduce((sum, c) => sum + c.raised_amount, 0),
    totalDonations: donations.length,
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
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
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
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 4)
              setPin(val)
              setPinError('')
            }}
            onKeyDown={(e) => { if (e.key === 'Enter' && pin.length === 4) verifyPin() }}
            error={pinError}
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />
          <Button
            onClick={verifyPin}
            disabled={pin.length !== 4}
            className="w-full"
          >
            Unlock
          </Button>
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
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
              Verified
            </span>
          </div>
          <p className="text-gray-600">Manage campaigns and donations</p>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_verified')
            sessionStorage.removeItem('admin_verified_at')
            router.push('/')
          }}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          Lock Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-500">Total Campaigns</p>
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
          <p className="text-sm text-gray-500">Total Donations</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === 'campaigns'
                ? 'border-b-2 border-[#274a34] text-[#274a34]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Campaigns
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`pb-4 text-sm font-medium transition-colors ${
              activeTab === 'donations'
                ? 'border-b-2 border-[#274a34] text-[#274a34]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Donations
          </button>
        </nav>
      </div>

      {dataLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <div>
              <div className="flex gap-2 mb-6">
                {(['all', 'pending', 'approved', 'rejected'] as CampaignFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setCampaignFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      campaignFilter === filter
                        ? 'bg-[#274a34] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'pending' && stats.pendingCampaigns > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                        {stats.pendingCampaigns}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative w-full sm:w-32 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={campaign.cover_image_url}
                          alt={campaign.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Link
                              href={`/campaign/${campaign.id}`}
                              className="text-lg font-semibold text-gray-900 hover:text-[#274a34]"
                            >
                              {campaign.title}
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              by {campaign.creator_name} · {formatDate(campaign.created_at)}
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                              Goal: {formatCurrency(campaign.goal_amount)} · Raised: {formatCurrency(campaign.raised_amount)}
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                            campaign.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : campaign.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                          </span>
                        </div>

                        <div className="mt-4 flex gap-3">
                          {campaign.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'approve')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCampaignAction(campaign.id, 'reject')}
                                className="text-red-500 border-red-500 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTarget(campaign)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-auto"
                          >
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-500">No campaigns found.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
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
                              <span className="text-emerald-600 font-medium text-sm">
                                {donation.is_anonymous ? '?' : donation.donor_name[0]}
                              </span>
                            </div>
                            <span className="text-gray-900">
                              {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/campaign/${donation.campaign_id}`}
                            className="text-gray-900 hover:text-[#274a34] truncate block max-w-[200px]"
                          >
                            {donation.campaign?.title || 'Unknown'}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            donation.payment_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : donation.payment_status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {(donation.payment_status || 'pending').charAt(0).toUpperCase() + (donation.payment_status || 'pending').slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {formatDate(donation.created_at)}
                        </td>
                      </tr>
                    ))}
                    {donations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No donations yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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
            <p className="text-xs text-gray-400 text-center mb-6">
              A backup JSON file will be downloaded before deletion.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
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
