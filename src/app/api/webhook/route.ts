import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    const campaignId = session.metadata?.campaignId
    const donorName = session.metadata?.donorName || 'Anonymous'
    const isAnonymous = session.metadata?.isAnonymous === 'true'
    const message = session.metadata?.message || null
    const donationAmount = parseFloat(session.metadata?.donationAmount || '0')
    const coverPlatformFee = session.metadata?.coverPlatformFee === 'true'
    const platformFee = parseFloat(session.metadata?.platformFee || '0')
    const stripeFee = parseFloat(session.metadata?.stripeFee || '0')
    const donorTotalPaid = parseFloat(session.metadata?.donorTotalPaid || '0')
    const netToCampaign = parseFloat(session.metadata?.netToCampaign || '0')

    if (!campaignId || donationAmount <= 0) {
      console.error('Invalid webhook metadata:', session.metadata)
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    // Create donation record with fee breakdown
    const { error: donationError } = await supabase
      .from('donations')
      .insert({
        campaign_id: campaignId,
        donor_name: donorName,
        amount: donationAmount,
        is_anonymous: isAnonymous,
        message,
        payment_status: 'completed',
        stripe_session_id: session.id,
        cover_platform_fee: coverPlatformFee,
        platform_fee: platformFee,
        stripe_fee: stripeFee,
        donor_total_paid: donorTotalPaid,
        net_to_campaign: netToCampaign,
      })

    if (donationError) {
      console.error('Error creating donation:', donationError)
      return NextResponse.json({ error: 'Failed to create donation' }, { status: 500 })
    }

    // Update campaign raised_amount (only the donation amount, not fees)
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('raised_amount')
      .eq('id', campaignId)
      .single()

    if (campaign) {
      await supabase
        .from('campaigns')
        .update({ raised_amount: campaign.raised_amount + donationAmount })
        .eq('id', campaignId)
    }
  }

  return NextResponse.json({ received: true })
}
