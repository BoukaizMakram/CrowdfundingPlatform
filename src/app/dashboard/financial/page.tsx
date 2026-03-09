'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { getDonationsByDonor, getCampaignsByCreator, getDonationsByCampaign } from '@/lib/supabase-queries'
import { formatCurrency } from '@/lib/utils'
import { Donation, Campaign } from '@/types'

type DonationWithCampaign = Donation & { campaign?: Campaign }

export default function FinancialDashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [donationsMade, setDonationsMade] = useState<DonationWithCampaign[]>([])
  const [donationsReceived, setDonationsReceived] = useState<(Donation & { campaignTitle: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'sent' | 'received'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      const [made, campaigns] = await Promise.all([
        getDonationsByDonor(user!.id),
        getCampaignsByCreator(user!.id),
      ])
      setDonationsMade(made)

      // Get donations received on user's campaigns
      const received: (Donation & { campaignTitle: string })[] = []
      for (const campaign of campaigns) {
        const donations = await getDonationsByCampaign(campaign.id)
        donations.forEach(d => received.push({ ...d, campaignTitle: campaign.title }))
      }
      received.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setDonationsReceived(received)
      setLoading(false)
    }
    fetchData()
  }, [user])

  if (authLoading || loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl" />)}
        </div>
        <div className="h-64 bg-gray-200 rounded-xl" />
      </div>
    )
  }

  const totalSent = donationsMade.reduce((sum, d) => sum + d.amount, 0)
  const totalReceived = donationsReceived.reduce((sum, d) => sum + d.amount, 0)
  const totalFeesPaid = donationsMade.reduce((sum, d) => sum + (d.platform_fee || 0), 0)
  const netBalance = totalReceived - totalSent

  const allTransactions = [
    ...donationsMade.map(d => ({ ...d, type: 'sent' as const, label: d.campaign?.title || 'Campaign' })),
    ...donationsReceived.map(d => ({ ...d, type: 'received' as const, label: d.campaignTitle })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const filtered = tab === 'all' ? allTransactions : allTransactions.filter(t => t.type === tab)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Financial Dashboard</h1>
      <p className="text-gray-500 text-sm mb-6">Track your financial activity</p>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Received</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Total Donated</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(totalSent)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Net Balance</p>
          <p className={`text-xl font-bold ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(netBalance)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs text-gray-500 mb-1">Fees Paid</p>
          <p className="text-xl font-bold text-gray-600">{formatCurrency(totalFeesPaid)}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-gray-200 rounded-xl">
        <div className="flex items-center gap-1 p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mr-auto">Transaction History</h2>
          {(['all', 'sent', 'received'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                tab === t ? 'bg-[#274a34] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No transactions found.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((tx, i) => (
              <div key={`${tx.id}-${i}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'received' ? 'bg-emerald-50' : 'bg-blue-50'
                }`}>
                  <svg className={`w-4 h-4 ${tx.type === 'received' ? 'text-emerald-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      tx.type === 'received'
                        ? 'M19 14l-7 7m0 0l-7-7m7 7V3'
                        : 'M5 10l7-7m0 0l7 7m-7-7v18'
                    } />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{tx.label}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {' '}&middot;{' '}
                    <span className={tx.type === 'received' ? 'text-emerald-600' : 'text-blue-600'}>
                      {tx.type === 'received' ? 'Received' : 'Donated'}
                    </span>
                  </p>
                </div>
                <p className={`text-sm font-semibold ${tx.type === 'received' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {tx.type === 'received' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
