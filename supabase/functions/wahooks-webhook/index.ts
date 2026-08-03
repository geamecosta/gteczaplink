import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[*_~`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractRefSlug(message: string): string | null {
  const match = message.match(/ref:\s*([a-zA-Z0-9_-]+)/i)
  return match ? match[1] : null
}

async function verifySignature(
  rawBody: string,
  timestamp: string,
  signatureHeader: string,
  secret: string,
): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`))
  const hex = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const expected = `sha256=${hex}`

  if (expected.length !== signatureHeader.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signatureHeader.charCodeAt(i)
  }
  return diff === 0
}

async function sendRouterReply(phone: string, destinationUrl: string, title: string | null) {
  const WAHOOKS_API_KEY = Deno.env.get('WAHOOKS_API_KEY')
  const WAHOOKS_CONNECTION_ID = Deno.env.get('WAHOOKS_CONNECTION_ID')
  if (!WAHOOKS_API_KEY || !WAHOOKS_CONNECTION_ID) return

  const chatId = `${phone}@s.whatsapp.net`
  const text = `Oi! Aqui está o link direto para falar com *${title || 'a loja'}*:\n${destinationUrl}`

  await fetch(`https://api.wahooks.com/api/connections/${WAHOOKS_CONNECTION_ID}/send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${WAHOOKS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chatId, text }),
  })
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-wahooks-signature') ?? ''
  const timestamp = req.headers.get('x-wahooks-timestamp') ?? ''
  const signingSecret = Deno.env.get('WAHOOKS_WEBHOOK_SIGNING_SECRET')

  if (!signingSecret) {
    return new Response(
      JSON.stringify({ error: 'WAHOOKS_WEBHOOK_SIGNING_SECRET secret is not configured' }),
      { status: 500 },
    )
  }

  if (!signature || !timestamp) {
    return new Response(JSON.stringify({ error: 'Missing signature headers' }), { status: 401 })
  }

  const tsSeconds = Number(timestamp)
  if (!Number.isFinite(tsSeconds) || Math.abs(Date.now() / 1000 - tsSeconds) > 300) {
    return new Response(JSON.stringify({ error: 'Stale or invalid timestamp' }), { status: 401 })
  }

  const valid = await verifySignature(rawBody, timestamp, signature, signingSecret)
  if (!valid) {
    return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 401 })
  }

  try {
    const payload = JSON.parse(rawBody)

    if (payload.event !== 'message') {
      return new Response(JSON.stringify({ ignored: true }), { status: 200 })
    }

    // Ignore messages sent BY the connected router number itself (e.g. our own auto-reply
    // or WhatsApp Business greeting messages), so we don't loop on our own outgoing messages.
    if (payload.payload?.fromMe === true) {
      return new Response(JSON.stringify({ ignored: true, reason: 'outgoing message' }), {
        status: 200,
      })
    }

    // "from" can be a WhatsApp @lid (privacy identifier), not the real phone number.
    // remoteJidAlt carries the real phone-based JID when that happens (confirmed with Wahooks support).
    const remoteJidAlt: string | undefined = payload.payload?._data?.key?.remoteJidAlt
    const fromRaw: string = remoteJidAlt || payload.payload?.from || ''
    const phone = fromRaw.split('@')[0].replace(/\D/g, '')
    const messageText: string =
      typeof payload.payload?.body === 'string' ? payload.payload.body : ''

    let eventTimestamp: string | null = null
    if (payload.timestamp) {
      const parsed = new Date(payload.timestamp)
      if (!isNaN(parsed.getTime())) eventTimestamp = parsed.toISOString()
    }

    if (!phone) {
      return new Response(JSON.stringify({ ignored: true, reason: 'no phone' }), { status: 200 })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const secretKeys = Deno.env.get('SUPABASE_SECRET_KEYS')
    const serviceRoleKey = secretKeys
      ? JSON.parse(secretKeys)['default']
      : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, user_id, short_slug, destination_url, title')

    if (linksError) {
      return new Response(JSON.stringify({ error: `links query failed: ${linksError.message}` }), {
        status: 500,
      })
    }

    let matchedLinkId: string | null = null
    let matchedSlug: string | null = null
    let matchedUserId: string | null = null
    let matchedDestination: string | null = null
    let matchedTitle: string | null = null

    // 1. Deterministic match: the router message carries "Ref: <slug>".
    const refSlug = extractRefSlug(messageText)
    if (refSlug) {
      const exact = (links ?? []).find((link) => link.short_slug === refSlug)
      if (exact) {
        matchedLinkId = exact.id
        matchedSlug = exact.short_slug
        matchedUserId = exact.user_id
        matchedDestination = exact.destination_url
        matchedTitle = exact.title
      }
    }

    // 2. Fallback: fuzzy-match the message text against each link's pre-filled wa.me text
    // (covers messages sent before the Ref tag existed, or edited by the customer).
    if (!matchedLinkId) {
      let bestScore = 0
      const normalizedIncoming = normalize(messageText)

      for (const link of links ?? []) {
        try {
          const url = new URL(link.destination_url)
          const prefill = url.searchParams.get('text')
          if (!prefill) continue
          const normalizedPrefill = normalize(prefill)
          if (!normalizedPrefill || !normalizedIncoming) continue

          if (
            normalizedIncoming.includes(normalizedPrefill) ||
            normalizedPrefill.includes(normalizedIncoming)
          ) {
            const score = normalizedPrefill.length
            if (score > bestScore) {
              bestScore = score
              matchedLinkId = link.id
              matchedSlug = link.short_slug
              matchedUserId = link.user_id
              matchedDestination = link.destination_url
              matchedTitle = link.title
            }
          }
        } catch {
          continue
        }
      }
    }

    if (!matchedUserId) {
      const { data: fallbackOwner } = await supabase
        .from('links')
        .select('user_id')
        .limit(1)
        .maybeSingle()
      matchedUserId = fallbackOwner?.user_id ?? null
    }

    if (!matchedUserId) {
      return new Response(JSON.stringify({ ignored: true, reason: 'no owner found' }), {
        status: 200,
      })
    }

    const { error } = await supabase.from('leads').insert({
      user_id: matchedUserId,
      link_id: matchedLinkId,
      short_slug: matchedSlug,
      phone,
      message: messageText,
      event_timestamp: eventTimestamp,
    })

    if (error && error.code !== '23505') {
      return new Response(
        JSON.stringify({ error: `leads insert failed: ${error.message}`, code: error.code }),
        { status: 500 },
      )
    }

    if (matchedDestination) {
      // @ts-ignore EdgeRuntime is a Supabase Edge Functions global for background tasks
      EdgeRuntime.waitUntil(sendRouterReply(phone, matchedDestination, matchedTitle))
    }

    return new Response(JSON.stringify({ success: true, matched_slug: matchedSlug }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: 'unhandled exception',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
