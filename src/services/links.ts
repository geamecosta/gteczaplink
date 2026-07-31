import { supabase } from '@/lib/supabase/client'

export interface CreateLinkPayload {
  destination_url: string
  short_slug?: string
  title?: string
  tags?: string[]
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  expires_at?: string | null
  qr_code_enabled?: boolean
}

export function generateRandomSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  if (!slug) return false
  const { data, error } = await supabase
    .from('links')
    .select('id')
    .eq('short_slug', slug.trim())
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking slug:', error)
    return false
  }
  return !data
}

export async function createShortLink(payload: CreateLinkPayload) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData?.user) {
    return { data: null, error: new Error('Usuário não autenticado') }
  }

  let finalSlug = payload.short_slug?.trim() || generateRandomSlug()

  const isAvailable = await checkSlugAvailable(finalSlug)
  if (!isAvailable) {
    if (payload.short_slug) {
      return { data: null, error: new Error('Este link personalizado (back-half) já está em uso.') }
    } else {
      finalSlug = generateRandomSlug(7)
    }
  }

  let finalDestinationUrl = payload.destination_url.trim()
  try {
    const urlObj = new URL(
      finalDestinationUrl.startsWith('http://') || finalDestinationUrl.startsWith('https://')
        ? finalDestinationUrl
        : `https://${finalDestinationUrl}`,
    )
    if (payload.utm_source) urlObj.searchParams.set('utm_source', payload.utm_source.trim())
    if (payload.utm_medium) urlObj.searchParams.set('utm_medium', payload.utm_medium.trim())
    if (payload.utm_campaign) urlObj.searchParams.set('utm_campaign', payload.utm_campaign.trim())
    finalDestinationUrl = urlObj.toString()
  } catch {
    // Keep raw string if URL parsing is lenient
  }

  const { data, error } = await supabase
    .from('links')
    .insert([
      {
        user_id: userData.user.id,
        destination_url: finalDestinationUrl,
        short_slug: finalSlug,
        title: payload.title?.trim() || null,
        tags: payload.tags || [],
        utm_source: payload.utm_source?.trim() || null,
        utm_medium: payload.utm_medium?.trim() || null,
        utm_campaign: payload.utm_campaign?.trim() || null,
        expires_at: payload.expires_at || null,
        qr_code_enabled: payload.qr_code_enabled ?? false,
      },
    ])
    .select()
    .single()

  return { data, error }
}

export async function getUserLinks() {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })

  return { data, error }
}

export async function deleteUserLink(id: string) {
  const { error } = await supabase.from('links').delete().eq('id', id)
  return { error }
}
