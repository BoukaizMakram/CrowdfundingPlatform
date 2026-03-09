'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getDonationsByDonor } from '@/lib/supabase-queries'
import { formatCurrency } from '@/lib/utils'
import { Donation, Campaign } from '@/types'

type DonationWithCampaign = Donation & { campaign?: Campaign }

export default function DonationHistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [donations, setDonations] = useState<DonationWithCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    async function fetchDonations() {
      const data = await getDonationsByDonor(user!.id)
      setDonations(data)
      setLoading(false)
    }
    fetchDonations()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] pt-28 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-64" />
            <div className="space-y-3 mt-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-28 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Donation History</h1>
        <p className="text-gray-500 text-sm mb-8">Your past donations and contributions</p>

        {donations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-[#edffd3] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">No donations yet</h2>
            <p className="text-gray-500 text-sm mb-6">When you make a donation, it will appear here.</p>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
            >
              Browse campaigns
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {donations.map(donation => (
              <div key={donation.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  {donation.campaign?.cover_image_url && (
                    <img
                      src={donation.campaign.cover_image_url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {donation.campaign ? (
                          <Link
                            href={`/campaign/${donation.campaign_id}`}
                            className="text-sm font-semibold text-gray-900 hover:text-[#274a34] transition-colors line-clamp-1"
                          >
                            {donation.campaign.title}
                          </Link>
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">Campaign removed</span>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(donation.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(donation.amount)}</p>
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                          donation.payment_status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : donation.payment_status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {donation.payment_status}
                        </span>
                      </div>
                    </div>
                    {donation.message && (
                      <p className="text-xs text-gray-500 mt-2 italic line-clamp-2">&ldquo;{donation.message}&rdquo;</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      {donation.cover_platform_fee && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Fee covered
                        </span>
                      )}
                      <span>Total paid: {formatCurrency(donation.donor_total_paid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
