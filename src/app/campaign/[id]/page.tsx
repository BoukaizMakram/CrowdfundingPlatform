'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCampaignById, getDonationsByCampaign } from '@/lib/supabase-queries'
import { formatCurrency, formatDate, getTimeAgo } from '@/lib/utils'
import ProgressBar from '@/components/campaign/ProgressBar'
import Button from '@/components/ui/Button'
import DonationModal from '@/components/donation/DonationModal'
import MediaCarousel from '@/components/campaign/MediaCarousel'
import { CATEGORIES, Campaign, Donation, MediaItem } from '@/types'

export default function CampaignPage() {
  const params = useParams()
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = window.location.href
    const title = campaign?.title || 'Campaign'
    const text = `Check out this campaign: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch {
        // User cancelled or share failed silently
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [campaign?.title])

  useEffect(() => {
    async function fetchData() {
      const id = params.id as string
      const campaignData = await getCampaignById(id)
      setCampaign(campaignData)
      if (campaignData) {
        const donationsData = await getDonationsByCampaign(campaignData.id)
        setDonations(donationsData)
      }
      setLoading(false)
    }
    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
        <p className="text-gray-600 mb-8">The campaign you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    )
  }

  const categoryLabel = CATEGORIES.find(c => c.value === campaign.category)?.label || campaign.category
  const progress = Math.min(Math.round((campaign.raised_amount / campaign.goal_amount) * 100), 100)
  const isCompleted = campaign.raised_amount >= campaign.goal_amount

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-emerald-500">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/campaigns?category=${campaign.category}`} className="text-gray-500 hover:text-emerald-500">
                {categoryLabel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 truncate max-w-[200px]">{campaign.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Media Carousel */}
            <MediaCarousel
              items={
                (campaign.media_urls && campaign.media_urls.length > 0)
                  ? campaign.media_urls
                  : [{ url: campaign.cover_image_url, type: 'image' as const }]
              }
              featured={campaign.featured}
              alt={campaign.title}
            />

            {/* Title & Creator */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {campaign.title}
            </h1>
            <p className="text-gray-600 mb-6">
              Created by <span className="font-medium text-gray-900">{campaign.creator_name}</span>
              {' · '}
              <span className="text-gray-500">{formatDate(campaign.created_at)}</span>
            </p>

            {/* Story */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Story</h2>
              <div className="prose prose-gray max-w-none break-words overflow-hidden">
                {campaign.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-4 last:mb-0 break-words">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Donations List */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Donations ({donations.length})
              </h2>
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                            <span className="text-emerald-600 font-medium">
                              {donation.is_anonymous ? '?' : donation.donor_name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {donation.is_anonymous ? 'Anonymous' : donation.donor_name}
                            </p>
                            <p className="text-sm text-gray-500">{getTimeAgo(donation.created_at)}</p>
                          </div>
                        </div>
                        <span className="font-semibold text-emerald-600">
                          {formatCurrency(donation.amount)}
                        </span>
                      </div>
                      {donation.message && (
                        <p className="mt-2 ml-13 text-sm text-gray-600 italic pl-[52px]">
                          &ldquo;{donation.message}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Be the first to donate to this campaign!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                {/* Progress */}
                <div className="mb-6">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(campaign.raised_amount)}
                    </span>
                    <span className="text-gray-500">
                      raised of {formatCurrency(campaign.goal_amount)}
                    </span>
                  </div>
                  <ProgressBar raised={campaign.raised_amount} goal={campaign.goal_amount} />
                  <p className="text-sm text-gray-500 mt-2">{progress}% funded</p>
                </div>

                {/* Stats */}
                <div className="flex gap-6 py-4 border-y border-gray-200 mb-6">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{donations.length}</p>
                    <p className="text-sm text-gray-500">donations</p>
                  </div>
                  <div>
                    {isCompleted ? (
                      <>
                        <p className="text-2xl font-bold text-[#274a34]">Completed</p>
                        <p className="text-sm text-gray-500">goal reached</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(campaign.goal_amount - campaign.raised_amount)}
                        </p>
                        <p className="text-sm text-gray-500">to go</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Donate Button */}
                <Button
                  size="lg"
                  className="w-full mb-4"
                  onClick={() => setShowDonationModal(true)}
                >
                  Donate Now
                </Button>

                {/* Share */}
                <Button variant="outline" size="lg" className="w-full" onClick={handleShare}>
                  {copied ? (
                    <>
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share Campaign
                    </>
                  )}
                </Button>

                {/* Category Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-2">Category</p>
                  <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1 rounded-full">
                    {categoryLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        campaign={campaign}
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />
    </>
  )
}
