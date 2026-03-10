import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, payoutMethod, payoutEmail, userEmail, fullName } = await req.json()

    if (!userId || !payoutMethod) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .upsert({
        id: userId,
        email: userEmail || '',
        full_name: fullName || 'User',
        payout_method: payoutMethod,
        payout_email: payoutEmail || null,
      }, { onConflict: 'id' })

    if (error) {
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to save payout method' }, { status: 500 })
  }
}
