import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  let body: string
  try {
    body = await req.text()
  } catch (err) {
    console.error('Webhook: failed to read body:', err)
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 })
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    console.error('Webhook: missing stripe-signature header')
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
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: 'Invalid signature', detail: message }, { status: 400 })
  }

  console.log('Webhook event received:', event.type)

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
    const donorId = session.metadata?.donorId || null

    if (!campaignId || donationAmount <= 0) {
      console.error('Webhook: invalid metadata:', session.metadata)
      return NextResponse.json({ error: 'Invalid metadata', metadata: session.metadata }, { status: 400 })
    }

    console.log('Webhook: processing donation:', { campaignId, donorName, donationAmount, donorId })

    // Create donation record — only include columns that exist in the DB
    // Core fields (from original schema)
    const insertData: Record<string, unknown> = {
      campaign_id: campaignId,
      donor_name: donorName,
      amount: donationAmount,
      is_anonymous: isAnonymous,
    }

    // Extended fields (from migration — safe to include, uses IF NOT EXISTS)
    insertData.message = message
    insertData.payment_status = 'completed'
    insertData.stripe_session_id = session.id
    insertData.cover_platform_fee = coverPlatformFee
    insertData.platform_fee = platformFee
    insertData.stripe_fee = stripeFee
    insertData.donor_total_paid = donorTotalPaid
    insertData.net_to_campaign = netToCampaign
    if (donorId) {
      insertData.donor_id = donorId
    }

    const { error: donationError } = await supabase
      .from('donations')
      .insert(insertData)

    if (donationError) {
      console.error('Webhook: error creating donation:', JSON.stringify(donationError))
      return NextResponse.json({
        error: 'Failed to create donation',
        detail: donationError.message,
        code: donationError.code,
      }, { status: 500 })
    }

    console.log('Webhook: donation created for campaign:', campaignId)

    // Update campaign raised_amount
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('raised_amount')
      .eq('id', campaignId)
      .single()

    if (campaignError) {
      console.error('Webhook: error fetching campaign:', JSON.stringify(campaignError))
    } else if (campaign) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ raised_amount: campaign.raised_amount + donationAmount })
        .eq('id', campaignId)

      if (updateError) {
        console.error('Webhook: error updating raised_amount:', JSON.stringify(updateError))
      } else {
        console.log('Webhook: raised_amount updated to', campaign.raised_amount + donationAmount)
      }
    }
  }

  return NextResponse.json({ received: true })
}
