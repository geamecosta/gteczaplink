import { supabase } from '@/lib/supabase/client'

export async function saveLink(
  userId: string | undefined,
  phone: string,
  message: string | undefined,
  url: string,
) {
  const payload: Record<string, any> = {
    phone,
    url,
  }
  if (userId) payload.user_id = userId
  if (message) payload.message = message

  const { data, error } = await supabase.from('whatsapp_links').insert([payload]).select().single()

  return { data, error }
}

export async function getLinks(userId: string) {
  const { data, error } = await supabase
    .from('whatsapp_links')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  return { data, error }
}

export async function deleteLink(id: string) {
  const { error } = await supabase.from('whatsapp_links').delete().eq('id', id)

  return { error }
}
