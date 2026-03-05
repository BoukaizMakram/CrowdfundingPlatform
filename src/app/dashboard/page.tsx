'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { getCampaignsByCreator } from '@/lib/supabase-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/campaign/ProgressBar'
import { Campaign } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const campaigns = await getCampaignsByCreator(user!.id)
      setMyCampaigns(campaigns)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const displayName = user?.user_metadata?.full_name || user?.email || 'User'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {displayName}</p>
        </div>
        <Link href="/campaign/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">My Campaigns</p>
          <p className="text-3xl font-bold text-gray-900">{myCampaigns.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Total Raised</p>
          <p className="text-3xl font-bold text-emerald-500">
            {formatCurrency(myCampaigns.reduce((sum, c) => sum + c.raised_amount, 0))}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <p className="text-sm text-gray-500 mb-1">Active Campaigns</p>
          <p className="text-3xl font-bold text-gray-900">
            {myCampaigns.filter(c => c.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : myCampaigns.length > 0 ? (
        <div className="space-y-4">
          {myCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0">
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
                        className="text-lg font-semibold text-gray-900 hover:text-emerald-500"
                      >
                        {campaign.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {formatDate(campaign.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : campaign.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>

                  <div className="mt-4">
                    <ProgressBar raised={campaign.raised_amount} goal={campaign.goal_amount} />
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(campaign.raised_amount)}
                      </span>
                      <span className="text-sm text-gray-500">
                        of {formatCurrency(campaign.goal_amount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <Link href={`/campaign/${campaign.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 mb-4">You haven&apos;t created any campaigns yet.</p>
          <Link href="/campaign/create">
            <Button>Create Your First Campaign</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
