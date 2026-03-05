'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function DonationSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [donation, setDonation] = useState<{
    status: string
    campaignId: string
    donorName: string
    donationAmount: string
    message: string
  } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) {
      setError('No session found')
      setLoading(false)
      return
    }

    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        const data = await res.json()

        if (data.error) {
          setError(data.error)
        } else {
          setDonation(data)
        }
      } catch {
        setError('Failed to verify payment')
      }
      setLoading(false)
    }

    verify()
  }, [sessionId])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
        <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
        <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-8">{error}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
        >
          Go home
        </Link>
      </div>
    )
  }

  if (donation?.status === 'paid') {
    return (
      <div>
        <div className="w-20 h-20 bg-[#edffd3] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank you for your generosity!</h1>
        <p className="text-gray-600 mb-2">
          Your donation of <span className="font-bold text-[#274a34]">${donation.donationAmount}</span> has been received.
        </p>
        <p className="text-gray-500 text-sm mb-8">May you be rewarded abundantly for your kindness.</p>

        {donation.message && (
          <div className="p-4 bg-white rounded-xl border border-gray-100 mb-8 text-left">
            <p className="text-xs text-gray-400 mb-1">Your message</p>
            <p className="text-gray-700 text-sm italic">&ldquo;{donation.message}&rdquo;</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {donation.campaignId && (
            <Link
              href={`/campaign/${donation.campaignId}`}
              className="px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
            >
              Back to campaign
            </Link>
          )}
          <Link
            href="/campaigns"
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Browse more campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment pending</h1>
      <p className="text-gray-600 mb-8">Your payment is being processed. You&apos;ll receive a confirmation shortly.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#274a34] text-white font-bold rounded-xl hover:bg-[#1d3827] transition-colors"
      >
        Go home
      </Link>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <Suspense fallback={
          <div className="animate-pulse space-y-4">
            <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto" />
            <div className="h-6 bg-gray-200 rounded w-48 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
          </div>
        }>
          <DonationSuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
