'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { getCampaignsByCreator, getDonationsByDonor } from '@/lib/supabase-queries'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { Campaign, Donation } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([])
  const [myDonations, setMyDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [campaigns, donations] = await Promise.all([
        getCampaignsByCreator(user!.id),
        getDonationsByDonor(user!.id),
      ])
      setMyCampaigns(campaigns)
      setMyDonations(donations)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'
  const totalRaised = myCampaigns.reduce((sum, c) => sum + c.raised_amount, 0)
  const totalDonated = myDonations.reduce((sum, d) => sum + d.amount, 0)

  const quickActions = [
    { href: '/dashboard/add-funds', label: 'Add Funds', desc: 'Top up your wallet', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6', color: 'bg-blue-50 text-blue-600' },
    { href: '/dashboard/withdraw', label: 'Withdraw', desc: 'Cash out your earnings', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-emerald-50 text-emerald-600' },
    { href: '/dashboard/financial', label: 'Financial', desc: 'View transactions', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {displayName}</p>
        </div>
        <Link href="/campaign/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${action.color}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-500">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">My Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '-' : myCampaigns.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Raised</p>
          <p className="text-2xl font-bold text-emerald-600">{loading ? '-' : formatCurrency(totalRaised)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Donated</p>
          <p className="text-2xl font-bold text-blue-600">{loading ? '-' : formatCurrency(totalDonated)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Active Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{loading ? '-' : myCampaigns.filter(c => c.status === 'approved').length}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Campaigns */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Campaigns</h2>
            <Link href="/dashboard/campaigns" className="text-sm text-[#274a34] hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
            </div>
          ) : myCampaigns.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No campaigns yet.</p>
          ) : (
            <div className="space-y-3">
              {myCampaigns.slice(0, 5).map(campaign => (
                <Link key={campaign.id} href={`/campaign/${campaign.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <img src={campaign.cover_image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{campaign.title}</p>
                    <p className="text-xs text-gray-500">{formatCurrency(campaign.raised_amount)} of {formatCurrency(campaign.goal_amount)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    campaign.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    campaign.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {campaign.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Donations */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
            <Link href="/donations/history" className="text-sm text-[#274a34] hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-14 bg-gray-100 rounded-lg" />)}
            </div>
          ) : myDonations.length === 0 ? (
            <p className="text-sm text-gray-500 py-4">No donations yet.</p>
          ) : (
            <div className="space-y-3">
              {myDonations.slice(0, 5).map(donation => {
                const d = donation as Donation & { campaign?: Campaign }
                return (
                  <div key={donation.id} className="flex items-center gap-3 p-2 rounded-lg">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{d.campaign?.title || 'Campaign'}</p>
                      <p className="text-xs text-gray-500">{new Date(donation.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(donation.amount)}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
