'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function InviteFriendsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  const referralLink = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${user?.id?.slice(0, 8)}`
    : ''

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Amanatick',
          text: 'Check out Amanatick - a platform for crowdfunding and charitable giving!',
          url: referralLink,
        })
      } catch {
        // cancelled
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Invite Friends</h1>
      <p className="text-gray-500 text-sm mb-8">Share Amanatick with friends and family</p>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#edffd3] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#274a34]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Share your referral link</h2>
          <p className="text-sm text-gray-500">Invite others to join the platform and make a difference together.</p>
        </div>

        {/* Referral Link */}
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-4">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-transparent text-sm text-gray-700 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
              copied
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-[#274a34] text-white hover:bg-[#1d3827]'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share with friends
        </button>
      </div>
    </div>
  )
}
