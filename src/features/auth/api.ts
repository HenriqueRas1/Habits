import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase.ts'
import { translateAuthError } from './errors.ts'

export type SignUpResult = { needsEmailConfirmation: boolean }

function appUrl(path: string) {
  return `${window.location.origin}${path}`
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(translateAuthError(error))
}

export async function signUp(email: string, password: string): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: appUrl('/') },
  })
  if (error) throw new Error(translateAuthError(error))
  return { needsEmailConfirmation: data.session === null }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: appUrl('/reset-password'),
  })
  if (error) throw new Error(translateAuthError(error))
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(translateAuthError(error))
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(translateAuthError(error))
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export function onAuthChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
): () => void {
  const { data } = supabase.auth.onAuthStateChange(callback)
  return () => data.subscription.unsubscribe()
}
