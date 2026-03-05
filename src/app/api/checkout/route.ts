import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

const PLATFORM_FEE_PERCENT = 5

export async function POST(req: NextRequest) {
  try {
    const { campaignId, campaignTitle, amount, donorName, isAnonymous, message } = await req.json()

    if (!campaignId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const donationCents = Math.round(amount * 100)
    const feeCents = Math.round(donationCents * PLATFORM_FEE_PERCENT / 100)

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Donation to "${campaignTitle}"`,
            },
            unit_amount: donationCents,
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Platform fee (5%)',
            },
            unit_amount: feeCents,
          },
          quantity: 1,
        },
      ],
      metadata: {
        campaignId,
        donorName: donorName || 'Anonymous',
        isAnonymous: String(isAnonymous),
        message: message || '',
        donationAmount: String(amount),
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
