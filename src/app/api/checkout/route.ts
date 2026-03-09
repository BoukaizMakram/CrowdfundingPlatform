import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

const PLATFORM_FEE_RATE = 0.05
const STRIPE_FEE_RATE = 0.029
const STRIPE_FEE_FIXED = 0.30

export async function POST(req: NextRequest) {
  try {
    const { campaignId, campaignTitle, amount, donorName, isAnonymous, message, coverPlatformFee, donorId } = await req.json()

    if (!campaignId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const donationCents = Math.round(amount * 100)
    const platformFeeCents = Math.round(donationCents * PLATFORM_FEE_RATE)

    // What the donor pays
    const totalCents = coverPlatformFee ? donationCents + platformFeeCents : donationCents

    // Stripe fee estimate (deducted by Stripe from total)
    const stripeFeeEstimate = Math.round(totalCents * STRIPE_FEE_RATE + STRIPE_FEE_FIXED * 100)

    // What the campaign receives
    const netToCampaignCents = coverPlatformFee
      ? donationCents // campaign gets full donation
      : donationCents - platformFeeCents // 5% deducted from donation

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: `Donation to "${campaignTitle}"` },
          unit_amount: donationCents,
        },
        quantity: 1,
      },
    ]

    if (coverPlatformFee) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'Platform fee (5%)' },
          unit_amount: platformFeeCents,
        },
        quantity: 1,
      })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      metadata: {
        campaignId,
        donorName: donorName || 'Anonymous',
        isAnonymous: String(isAnonymous),
        message: message || '',
        donationAmount: String(amount),
        coverPlatformFee: String(!!coverPlatformFee),
        platformFee: String(platformFeeCents / 100),
        stripeFee: String(stripeFeeEstimate / 100),
        donorTotalPaid: String(totalCents / 100),
        netToCampaign: String(netToCampaignCents / 100),
        donorId: donorId || '',
      },
      success_url: `${req.nextUrl.origin}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.nextUrl.origin}/campaign/${campaignId}`,
    })

    return NextResponse.json({ sessionUrl: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
