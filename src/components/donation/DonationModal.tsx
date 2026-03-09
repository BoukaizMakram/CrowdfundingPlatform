'use client'

import { useState } from 'react'
import { Campaign } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface DonationModalProps {
  campaign: Campaign
  isOpen: boolean
  onClose: () => void
}

const PRESET_AMOUNTS = [25, 50, 100, 250, 500, 1000]
const PLATFORM_FEE_RATE = 0.05

export default function DonationModal({ campaign, isOpen, onClose }: DonationModalProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'amount' | 'info' | 'payment'>('amount')
  const [amount, setAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState('')
  const [coverFee, setCoverFee] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  // Fee calculations
  const platformFeeAmount = Math.round(amount * PLATFORM_FEE_RATE * 100) / 100
  const platformFee = coverFee ? platformFeeAmount : 0
  const donorTotalPaid = Math.round((amount + platformFee) * 100) / 100
  const netToCampaign = coverFee
    ? amount
    : Math.round(amount * (1 - PLATFORM_FEE_RATE) * 100) / 100

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount('')
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    const num = parseInt(value)
    if (!isNaN(num) && num > 0) {
      setAmount(num)
    }
  }

  const handleNext = () => {
    if (step === 'amount' && amount > 0) {
      setStep('info')
    } else if (step === 'info' && (isAnonymous || donorName.trim())) {
      setStep('payment')
    }
  }

  const handlePayWithStripe = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          campaignTitle: campaign.title,
          amount,
          donorName: isAnonymous ? 'Anonymous' : donorName,
          isAnonymous,
          message: message.trim() || undefined,
          coverPlatformFee: coverFee,
          donorId: user?.id || undefined,
        }),
      })

      const data = await res.json()

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl
      } else {
        setError(data.error || 'Failed to create checkout session')
        setIsSubmitting(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep('amount')
    setAmount(50)
    setCustomAmount('')
    setDonorName('')
    setIsAnonymous(false)
    setMessage('')
    setCoverFee(false)
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#e8e5e0]">
          <h2 className="text-xl font-semibold text-gray-900">Make a Donation</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {['Amount', 'Details', 'Pay'].map((label, i) => {
              const steps = ['amount', 'info', 'payment'] as const
              const isActive = steps.indexOf(step) >= i
              return (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className={`h-1 flex-1 rounded-full transition-colors ${isActive ? 'bg-[#274a34]' : 'bg-gray-200'}`} />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between mt-1 mb-4">
            <span className="text-xs text-gray-400">Amount</span>
            <span className="text-xs text-gray-400">Details</span>
            <span className="text-xs text-gray-400">Pay</span>
          </div>
        </div>

        <div className="p-6 pt-0">
          {step === 'amount' && (
            <div>
              <p className="text-gray-600 mb-6">
                You&apos;re supporting: <span className="font-medium text-gray-900">{campaign.title}</span>
              </p>

              <p className="text-sm font-medium text-gray-700 mb-3">Select amount (USD)</p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {PRESET_AMOUNTS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleAmountSelect(value)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      amount === value && !customAmount
                        ? 'bg-[#274a34] text-white'
                        : 'bg-[#f7f5f2] text-gray-700 hover:bg-[#edffd3]'
                    }`}
                  >
                    ${value}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Enter custom amount"
                value={customAmount}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                type="number"
                min="1"
              />

              {/* Cover fee checkbox */}
              <div className="mt-5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="coverFee"
                  checked={coverFee}
                  onChange={(e) => setCoverFee(e.target.checked)}
                  className="w-5 h-5 mt-0.5 rounded border-gray-300 text-[#274a34] focus:ring-[#274a34]"
                />
                <label htmlFor="coverFee" className="text-sm text-gray-700 leading-snug">
                  Cover the <span className="font-semibold">{formatCurrency(platformFeeAmount)}</span> platform fee so the campaign receives the full donation
                </label>
              </div>

              {/* Fee breakdown */}
              <div className="mt-4 p-4 bg-[#f7f5f2] rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Your donation</span>
                  <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                </div>
                {coverFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Platform fee (5%)</span>
                    <span className="text-gray-500 text-sm">+{formatCurrency(platformFee)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">You pay</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(donorTotalPaid)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-xs">Campaign receives</span>
                  <span className="text-[#274a34] text-xs font-medium">{formatCurrency(netToCampaign)}</span>
                </div>
              </div>

              {!coverFee && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  A 5% platform fee is deducted from the donation. Cover it above to give the full amount.
                </p>
              )}

              <Button className="w-full mt-6" onClick={handleNext} disabled={amount <= 0}>
                Continue
              </Button>
            </div>
          )}

          {step === 'info' && (
            <div>
              <div className="p-3 bg-[#edffd3] rounded-lg mb-6 flex justify-between items-center">
                <span className="text-sm text-[#274a34]">Donation</span>
                <span className="font-bold text-[#274a34]">{formatCurrency(amount)}</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-[#274a34] focus:ring-[#274a34]"
                  />
                  <label htmlFor="anonymous" className="text-gray-700">Donate anonymously</label>
                </div>

                {!isAnonymous && (
                  <Input label="Your name" placeholder="Enter your name" value={donorName} onChange={(e) => setDonorName(e.target.value)} />
                )}

                {/* Donation message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Leave a message <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write an encouraging message for the campaign owner..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#274a34] focus:ring-1 focus:ring-[#274a34] transition-colors resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">{message.length}/500</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setStep('amount')}>Back</Button>
                <Button className="flex-1" onClick={handleNext} disabled={!isAnonymous && !donorName.trim()}>Continue</Button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div>
              {/* Order summary */}
              <div className="p-4 bg-[#f7f5f2] rounded-lg mb-6 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Donation to &ldquo;{campaign.title}&rdquo;</span>
                  <span className="font-medium text-gray-900">{formatCurrency(amount)}</span>
                </div>
                {coverFee && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Platform fee (5%)</span>
                    <span className="text-gray-500 text-sm">+{formatCurrency(platformFee)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total charge</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(donorTotalPaid)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500 text-sm">Donor</span>
                  <span className="text-gray-700 text-sm">{isAnonymous ? 'Anonymous' : donorName}</span>
                </div>
                {message.trim() && (
                  <div className="pt-1">
                    <span className="text-gray-500 text-sm">Message</span>
                    <p className="text-gray-700 text-sm mt-0.5 italic">&ldquo;{message.trim()}&rdquo;</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep('info')}>Back</Button>
                <button
                  onClick={handlePayWithStripe}
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[#635bff] hover:bg-[#5851db] text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Redirecting...</span>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
                      </svg>
                      Pay {formatCurrency(donorTotalPaid)}
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-4 text-center">
                Secure payment powered by Stripe. You&apos;ll be redirected to complete payment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
