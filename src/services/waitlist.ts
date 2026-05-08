import { supabase } from '@/lib/supabase/client'

export async function joinWaitlist(
  name: string,
  email: string,
  phone: string,
  referred_by?: string | null,
) {
  const payload: any = { name, email, phone }
  if (referred_by) {
    payload.referred_by = referred_by
  }

  const { data, error } = await supabase
    .from('waitlist' as any)
    .insert([payload])
    .select()
    .single()

  if (!error && data) {
    // Invoke edge function to send welcome email & whatsapp asynchronously
    supabase.functions
      .invoke('waitlist-welcome', {
        body: {
          waitlistId: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          referral_code: data.referral_code,
        },
      })
      .catch(console.error)
  }

  return { data, error }
}
