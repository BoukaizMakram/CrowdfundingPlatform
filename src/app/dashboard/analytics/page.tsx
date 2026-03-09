'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getCampaignsByCreator, getDonationsByCampaign, getDonationsByDonor } from '@/lib/supabase-queries'
import { formatCurrency } from '@/lib/utils'
import { Campaign, Donation } from '@/types'

export default function AnalyticsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [allDonationsReceived, setAllDonationsReceived] = useState<Donation[]>([])
  const [donationsMade, setDonationsMade] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [camps, made] = await Promise.all([
        getCampaignsByCreator(user!.id),
        getDonationsByDonor(user!.id),
      ])
      setCampaigns(camps)
      setDonationsMade(made)

      const received: Donation[] = []
      for (const camp of camps) {
        const donations = await getDonationsByCampaign(camp.id)
        received.push(...donations)
      }
      setAllDonationsReceived(received)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl" />)}
        </div>
      </div>
    )
  }

  const totalReceived = allDonationsReceived.reduce((sum, d) => sum + d.amount, 0)
  const totalDonated = donationsMade.reduce((sum, d) => sum + d.amount, 0)
  const avgDonationReceived = allDonationsReceived.length > 0 ? totalReceived / allDonationsReceived.length : 0
  const avgDonationMade = donationsMade.length > 0 ? totalDonated / donationsMade.length : 0
  const completedCampaigns = campaigns.filter(c => c.raised_amount >= c.goal_amount).length
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goal_amount, 0)
  const overallProgress = totalGoal > 0 ? Math.round((campaigns.reduce((sum, c) => sum + c.raised_amount, 0) / totalGoal) * 100) : 0

  // Top campaign
  const topCampaign = campaigns.length > 0
    ? campaigns.reduce((best, c) => c.raised_amount > best.raised_amount ? c : best, campaigns[0])
    : null

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Account Analytics</h1>
      <p className="text-gray-500 text-sm mb-8">Insights into your fundraising and giving</p>

      {/* Fundraising Stats */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Fundraising</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Campaigns</p>
          <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{completedCampaigns}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Overall Progress</p>
          <p className="text-2xl font-bold text-[#274a34]">{overallProgress}%</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Received</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Donors</p>
          <p className="text-2xl font-bold text-gray-900">{allDonationsReceived.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Avg Donation</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgDonationReceived)}</p>
        </div>
      </div>

      {/* Top Campaign */}
      {topCampaign && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Top Campaign</h2>
          <div className="flex items-center gap-4">
            <img src={topCampaign.cover_image_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{topCampaign.title}</p>
              <p className="text-sm text-gray-500">{formatCurrency(topCampaign.raised_amount)} raised of {formatCurrency(topCampaign.goal_amount)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-emerald-600">
                {Math.min(Math.round((topCampaign.raised_amount / topCampaign.goal_amount) * 100), 100)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Giving Stats */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Giving</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Donated</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalDonated)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Donations Made</p>
          <p className="text-2xl font-bold text-gray-900">{donationsMade.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Avg Donation</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgDonationMade)}</p>
        </div>
      </div>
    </div>
  )
}
