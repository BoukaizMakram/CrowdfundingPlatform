'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getUserById, getCampaignsByCreator } from '@/lib/supabase-queries'
import { formatDate } from '@/lib/utils'
import CampaignCard from '@/components/campaign/CampaignCard'
import { User, Campaign } from '@/types'
import Button from '@/components/ui/Button'

export default function ProfilePage() {
  const params = useParams()
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const id = params.id as string
      const [userData, campaignsData] = await Promise.all([
        getUserById(id),
        getCampaignsByCreator(id),
      ])
      setProfileUser(userData)
      setCampaigns(campaignsData.filter(c => c.status === 'approved'))
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        <div className="animate-pulse">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-7 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-full max-w-sm" />
              </div>
            </div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
        <p className="text-gray-600 mb-8">This profile doesn&apos;t exist.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const initial = profileUser.full_name?.[0]?.toUpperCase() || '?'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
      {/* Profile Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-[#274a34] rounded-full flex items-center justify-center shrink-0">
            <span className="text-white text-3xl font-bold">{initial}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{profileUser.full_name}</h1>
            <p className="text-sm text-gray-500 mb-3">Member since {formatDate(profileUser.created_at)}</p>
            {profileUser.bio && (
              <p className="text-gray-600 text-sm leading-relaxed">{profileUser.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Campaigns */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Campaigns ({campaigns.length})
      </h2>
      {campaigns.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">No public campaigns yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {campaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </div>
  )
}
