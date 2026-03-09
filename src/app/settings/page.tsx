'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPayoutMethod, updateUserPayoutMethod } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { PayoutMethod } from '@/types'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | ''>('')
  const [payoutEmail, setPayoutEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchPayout() {
      const data = await getUserPayoutMethod(user!.id)
      if (data) {
        setPayoutMethod(data.payout_method || '')
        setPayoutEmail(data.payout_email || '')
      }
      setLoading(false)
    }
    fetchPayout()
  }, [user])

  const handleSavePayout = async () => {
    if (!user || !payoutMethod) return
    setSaving(true)
    const success = await updateUserPayoutMethod(user.id, payoutMethod as PayoutMethod, payoutEmail)
    setSaving(false)
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setResetSent(true)
    setTimeout(() => setResetSent(false), 3000)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] pt-28 px-4">
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-32" />
          <div className="h-64 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  const displayName = user?.user_metadata?.full_name || 'User'

  return (
    <div className="min-h-screen bg-[#fafaf8] pt-28 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">Manage your account and preferences</p>

        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">{displayName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-900">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Payout Method */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Method</h2>
          <p className="text-sm text-gray-500 mb-4">Choose how you want to receive funds from your campaigns.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as PayoutMethod)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
              >
                <option value="">Select payout method</option>
                <option value="stripe">Stripe</option>
                <option value="paypal">PayPal</option>
                <option value="wise">Wise</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payout Email</label>
              <input
                type="email"
                value={payoutEmail}
                onChange={(e) => setPayoutEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
              />
            </div>
            <Button onClick={handleSavePayout} disabled={saving || !payoutMethod}>
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Payout Method'}
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <p className="text-sm text-gray-500 mb-4">Update your password via email.</p>
          <Button variant="outline" onClick={handlePasswordReset}>
            {resetSent ? 'Reset Email Sent!' : 'Send Password Reset Email'}
          </Button>
        </div>
      </div>
    </div>
  )
}
