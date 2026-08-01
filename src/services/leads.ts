import { supabase } from '@/lib/supabase/client'

export interface LinkLead {
  id: string
  phone: string
  message: string | null
  link_id: string | null
  short_slug: string | null
  created_at: string
  links?: { title: string | null; short_slug: string } | null
}

export async function getUserLinkLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('id, phone, message, link_id, short_slug, created_at, links(title, short_slug)')
    .order('created_at', { ascending: false })

  return { data: (data as LinkLead[]) || [], error }
}
