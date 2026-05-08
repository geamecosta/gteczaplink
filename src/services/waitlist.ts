import { supabase } from '@/lib/supabase/client'

export async function joinWaitlist(
  name: string,
  email: string,
  phone: string,
  referred_by?: string | null,
) {
  // Use RPC to bypass RLS select restrictions and handle duplicates gracefully
  const { data, error } = await supabase.rpc('join_waitlist' as any, {
    p_name: name,
    p_email: email,
    p_phone: phone,
    p_referred_by: referred_by || null,
  })

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

export async function getReferralStatus(email: string) {
  const { data, error } = await supabase.rpc('get_referral_status' as any, { p_email: email })
  return { data, error }
}
