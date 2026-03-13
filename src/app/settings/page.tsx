'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getUserPayoutMethod, updateUserPayoutMethod, updateUserProfile } from '@/lib/supabase-queries'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import { PayoutMethod } from '@/types'

const PAYOUT_OPTIONS: { value: PayoutMethod; label: string; description: string; icon: string }[] = [
  {
    value: 'stripe',
    label: 'Stripe Connect',
    description: 'Receive payouts directly to your bank via Stripe',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
  },
  {
    value: 'paypal',
    label: 'PayPal',
    description: 'Receive payouts to your PayPal account',
    icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    value: 'wise',
    label: 'Wise (TransferWise)',
    description: 'Low-fee international transfers via Wise',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    value: 'bank_morocco',
    label: 'Bank Transfer (Morocco)',
    description: 'Direct bank transfer to your Moroccan bank account',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
]

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | ''>('')
  const [payoutEmail, setPayoutEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [loading, setLoading] = useState(true)
  // Profile fields
  const [profileName, setProfileName] = useState('')
  const [profileBio, setProfileBio] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [payoutData, profileData] = await Promise.all([
        getUserPayoutMethod(user!.id),
        supabase.from('users').select('full_name, bio, phone').eq('id', user!.id).single(),
      ])
      if (payoutData) {
        setPayoutMethod(payoutData.payout_method || '')
        setPayoutEmail(payoutData.payout_email || '')
      }
      if (profileData.data) {
        setProfileName(profileData.data.full_name || '')
        setProfileBio(profileData.data.bio || '')
        setProfilePhone(profileData.data.phone || '')
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  const handleSavePayout = async () => {
    if (!user || !payoutMethod) return
    if (!payoutEmail.trim()) {
      setSaveError('Please enter your payout details')
      return
    }
    setSaving(true)
    setSaveError('')
    const success = await updateUserPayoutMethod(
      user.id,
      payoutMethod as PayoutMethod,
      payoutEmail,
      user.email,
      user.user_metadata?.full_name
    )
    setSaving(false)
    if (success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setSaveError('Failed to save. Please try again.')
    }
  }

  const handleSaveProfile = async () => {
    if (!user) return
    if (!profileName.trim()) {
      setProfileError('Name is required')
      return
    }
    setProfileSaving(true)
    setProfileError('')
    const success = await updateUserProfile(user.id, {
      full_name: profileName.trim(),
      bio: profileBio.trim() || undefined,
      phone: profilePhone.trim() || undefined,
    })
    // Also sync auth metadata so Header updates
    if (success) {
      await supabase.auth.updateUser({ data: { full_name: profileName.trim() } })
    }
    setProfileSaving(false)
    if (success) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } else {
      setProfileError('Failed to save. Please try again.')
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

  const getPayoutFieldLabel = () => {
    switch (payoutMethod) {
      case 'stripe': return 'Stripe Account Email'
      case 'paypal': return 'PayPal Email'
      case 'wise': return 'Wise Email'
      case 'bank_morocco': return 'Bank Details (RIB / Account Number)'
      default: return 'Payout Details'
    }
  }

  const getPayoutFieldPlaceholder = () => {
    switch (payoutMethod) {
      case 'stripe': return 'your@email.com (Stripe account)'
      case 'paypal': return 'your@email.com (PayPal account)'
      case 'wise': return 'your@email.com (Wise account)'
      case 'bank_morocco': return 'RIB: 0000 0000 0000 0000 0000 00'
      default: return ''
    }
  }

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
              <input
                type="text"
                value={profileName}
                onChange={(e) => { setProfileName(e.target.value); setProfileError('') }}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="px-4 py-2.5 bg-gray-50 rounded-xl text-sm text-gray-500">{user?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profileBio}
                onChange={(e) => { setProfileBio(e.target.value); setProfileError('') }}
                placeholder="Tell others about yourself..."
                rows={3}
                maxLength={300}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{profileBio.length}/300</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => { setProfilePhone(e.target.value); setProfileError('') }}
                placeholder="+1 234 567 8900"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
              />
            </div>
            {profileError && <p className="text-sm text-red-600">{profileError}</p>}
            <Button onClick={handleSaveProfile} disabled={profileSaving}>
              {profileSaving ? 'Saving...' : profileSaved ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </div>

        {/* Payout Method */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Payout Method</h2>
          <p className="text-sm text-gray-500 mb-6">Choose how you want to receive funds from your campaigns.</p>

          {/* Method Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {PAYOUT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => { setPayoutMethod(option.value); setSaveError('') }}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  payoutMethod === option.value
                    ? 'border-[#274a34] bg-[#edffd3]/30'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  payoutMethod === option.value ? 'bg-[#274a34] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                  </svg>
                </div>
                <div>
                  <p className={`text-sm font-semibold ${payoutMethod === option.value ? 'text-[#274a34]' : 'text-gray-900'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Details Input */}
          {payoutMethod && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{getPayoutFieldLabel()}</label>
                {payoutMethod === 'bank_morocco' ? (
                  <textarea
                    value={payoutEmail}
                    onChange={(e) => { setPayoutEmail(e.target.value); setSaveError('') }}
                    placeholder={getPayoutFieldPlaceholder()}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent resize-none"
                  />
                ) : (
                  <input
                    type="email"
                    value={payoutEmail}
                    onChange={(e) => { setPayoutEmail(e.target.value); setSaveError('') }}
                    placeholder={getPayoutFieldPlaceholder()}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
                  />
                )}
                {payoutMethod === 'bank_morocco' && (
                  <p className="text-xs text-gray-400 mt-1">Include your full name, bank name, and RIB number.</p>
                )}
              </div>
              {saveError && <p className="text-sm text-red-600">{saveError}</p>}
              <Button onClick={handleSavePayout} disabled={saving || !payoutEmail.trim()}>
                {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Payout Method'}
              </Button>
            </div>
          )}
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
