'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getCampaignsByCreator } from '@/lib/supabase-queries'
import { formatCurrency, formatDate } from '@/lib/utils'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/campaign/ProgressBar'
import { Campaign } from '@/types'

export default function CampaignsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const data = await getCampaignsByCreator(user!.id)
      setCampaigns(data)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
      </div>
    )
  }

  const filtered = filter === 'all' ? campaigns : campaigns.filter(c => c.status === filter)

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
          <p className="text-gray-500 text-sm">{campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/campaign/create">
          <Button>Create Campaign</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'approved', 'pending', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f ? 'bg-[#274a34] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <p className="text-gray-500 mb-4">
            {filter === 'all' ? "You haven't created any campaigns yet." : `No ${filter} campaigns.`}
          </p>
          {filter === 'all' && (
            <Link href="/campaign/create">
              <Button>Create Your First Campaign</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(campaign => (
            <div key={campaign.id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 aspect-video sm:aspect-square rounded-lg overflow-hidden flex-shrink-0">
                  <img src={campaign.cover_image_url} alt={campaign.title} className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/campaign/${campaign.id}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-500">
                        {campaign.title}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">Created {formatDate(campaign.created_at)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                      campaign.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-4">
                    <ProgressBar raised={campaign.raised_amount} goal={campaign.goal_amount} />
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold text-gray-900">{formatCurrency(campaign.raised_amount)}</span>
                      <span className="text-sm text-gray-500">of {formatCurrency(campaign.goal_amount)}</span>
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
      )}
    </div>
  )
}
