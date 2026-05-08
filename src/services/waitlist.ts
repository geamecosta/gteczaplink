import { supabase } from '@/lib/supabase/client'

export async function joinWaitlist(name: string, email: string, phone: string) {
  const { error } = await supabase.from('waitlist' as any).insert([{ name, email, phone }])

  return { error }
}
