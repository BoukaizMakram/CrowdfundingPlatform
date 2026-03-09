'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AddFundsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  if (loading) {
    return <div className="animate-pulse"><div className="h-8 bg-gray-200 rounded w-48" /></div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Add Funds</h1>
      <p className="text-gray-500 text-sm mb-8">Top up your wallet balance</p>

      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          The wallet feature is currently under development. Soon you&apos;ll be able to add funds to your account balance for quick donations.
        </p>
      </div>
    </div>
  )
}
