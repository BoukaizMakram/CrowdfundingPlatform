'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getCampaignsByCreator, getUserPayoutMethod, createPayoutRequest, getPayoutRequestsByUser } from '@/lib/supabase-queries'
import { formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { Campaign, PayoutMethod, PayoutRequest } from '@/types'

export default function WithdrawPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | null>(null)
  const [payoutEmail, setPayoutEmail] = useState<string | null>(null)
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [camps, payout, requests] = await Promise.all([
        getCampaignsByCreator(user!.id),
        getUserPayoutMethod(user!.id),
        getPayoutRequestsByUser(user!.id),
      ])
      setCampaigns(camps)
      setPayoutMethod(payout?.payout_method || null)
      setPayoutEmail(payout?.payout_email || null)
      setPayoutRequests(requests)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-40 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised_amount, 0)
  const totalPendingOrApproved = payoutRequests
    .filter(r => r.status === 'pending' || r.status === 'approved' || r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0)
  const availableBalance = Math.max(0, totalRaised - totalPendingOrApproved)

  const handleSubmit = async () => {
    setError('')
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (amt > availableBalance) {
      setError(`Maximum available: ${formatCurrency(availableBalance)}`)
      return
    }
    if (!payoutMethod || !payoutEmail) {
      setError('Set up your payout method in Settings first')
      return
    }

    setSubmitting(true)
    const success = await createPayoutRequest(user!.id, amt, payoutMethod, payoutEmail)
    setSubmitting(false)

    if (success) {
      setSubmitted(true)
      setAmount('')
      const updated = await getPayoutRequestsByUser(user!.id)
      setPayoutRequests(updated)
      setTimeout(() => setSubmitted(false), 3000)
    } else {
      setError('Failed to submit request. Please try again.')
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Withdraw Funds</h1>
      <p className="text-gray-500 text-sm mb-8">Request a payout from your campaign earnings</p>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Raised</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRaised)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Requested / Paid Out</p>
          <p className="text-2xl font-bold text-gray-600">{formatCurrency(totalPendingOrApproved)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Available</p>
          <p className="text-2xl font-bold text-[#274a34]">{formatCurrency(availableBalance)}</p>
        </div>
      </div>

      {/* Payout Method Status */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Payout Method</h2>
        {payoutMethod ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 capitalize">{payoutMethod}</p>
                <p className="text-xs text-gray-500">{payoutEmail}</p>
              </div>
            </div>
            <Link href="/settings" className="text-sm text-[#274a34] hover:underline">Change</Link>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 mb-3">No payout method configured.</p>
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#274a34] text-white text-sm font-medium rounded-xl hover:bg-[#1d3827] transition-colors"
            >
              Set up payout method
            </Link>
          </div>
        )}
      </div>

      {/* Request Payout Form */}
      {payoutMethod && availableBalance > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Payout</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableBalance}
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setError('') }}
                  placeholder={`Up to ${formatCurrency(availableBalance)}`}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#274a34] focus:border-transparent"
                />
                <button
                  onClick={() => setAmount(availableBalance.toFixed(2))}
                  className="px-4 py-2.5 text-sm font-medium text-[#274a34] border border-[#274a34] rounded-xl hover:bg-[#edffd3] transition-colors"
                >
                  Max
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button onClick={handleSubmit} disabled={submitting || submitted}>
              {submitting ? 'Submitting...' : submitted ? 'Request Submitted!' : 'Submit Payout Request'}
            </Button>
            <p className="text-xs text-gray-400">Your request will be reviewed by the admin team and processed manually.</p>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
        </div>
        {payoutRequests.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No payout requests yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {payoutRequests.map(req => (
              <div key={req.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(req.amount)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {' via '}
                      <span className="capitalize">{req.payout_method}</span>
                      {' to '}
                      {req.payout_email}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[req.status] || 'bg-gray-100 text-gray-600'}`}>
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </span>
                </div>
                {req.admin_note && (
                  <p className="text-xs text-gray-500 mt-2 italic">Admin: {req.admin_note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
