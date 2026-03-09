import { supabase } from './supabase'

export async function signUp(email: string, password: string, fullName: string, phone?: string): Promise<{ user: import('@supabase/supabase-js').User; session: import('@supabase/supabase-js').Session | null } | { error: string }> {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone },
    },
  })

  if (authError) {
    // Catch duplicate email error
    if (authError.message.toLowerCase().includes('already registered') || authError.message.toLowerCase().includes('already been registered')) {
      return { error: 'An account with this email already exists. Please sign in instead.' }
    }
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Signup failed. Please try again.' }
  }

  // Supabase may return a user but no session when email already exists (email confirmation enabled)
  // Detect this: user has no identities = fake/duplicate user
  if (authData.user.identities && authData.user.identities.length === 0) {
    return { error: 'An account with this email already exists. Please sign in instead.' }
  }

  // 2. Create public.users row with same UUID
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      phone: phone || null,
      is_admin: false,
    })

  if (profileError) {
    console.error('Error creating user profile:', profileError)
    // Auth user was created, profile insert failed — not fatal for campaign creation
  }

  return { user: authData.user, session: authData.session }
}

export async function signIn(email: string, password: string): Promise<{ user: import('@supabase/supabase-js').User; session: import('@supabase/supabase-js').Session | null } | { error: string }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return { user: data.user, session: data.session }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error: error?.message }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function resetPasswordForEmail(email: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  if (error) return { error: error.message }
  return {}
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return {}
}
