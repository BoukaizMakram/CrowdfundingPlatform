import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Fetch all auth users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 1000,
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Fetch payout info from public.users table
    const { data: publicUsers } = await supabaseAdmin
      .from('users')
      .select('id, payout_method, payout_email')

    const payoutMap = new Map(
      (publicUsers || []).map(u => [u.id, { payout_method: u.payout_method, payout_email: u.payout_email }])
    )

    // Merge auth users with public.users data
    const users = authData.users.map(u => ({
      id: u.id,
      email: u.email || '',
      full_name: u.user_metadata?.full_name || u.email || 'Unknown',
      phone: u.phone || null,
      payout_method: payoutMap.get(u.id)?.payout_method || null,
      payout_email: payoutMap.get(u.id)?.payout_email || null,
      created_at: u.created_at,
    }))

    return NextResponse.json({ users })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
