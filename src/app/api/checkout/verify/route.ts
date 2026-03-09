import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      status: session.payment_status,
      campaignId: session.metadata?.campaignId,
      donorName: session.metadata?.donorName,
      donationAmount: session.metadata?.donationAmount,
      message: session.metadata?.message,
      coverPlatformFee: session.metadata?.coverPlatformFee === 'true',
      platformFee: session.metadata?.platformFee,
      stripeFee: session.metadata?.stripeFee,
      donorTotalPaid: session.metadata?.donorTotalPaid,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ error: 'Failed to verify session' }, { status: 500 })
  }
}
