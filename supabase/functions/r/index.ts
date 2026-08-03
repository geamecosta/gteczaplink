import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// WhatsApp number connected in Wahooks that receives every click before
// forwarding the customer to the real store (see wahooks-webhook Edge Function).
const ROUTER_PHONE = '556291501144'

function buildRouterUrl(slug: string): string {
  const message = `Olá! Tenho interesse nos produtos 🛍️\n\nRef: ${slug}`
  return `https://wa.me/${ROUTER_PHONE}?text=${encodeURIComponent(message)}`
}

const NOT_FOUND_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Link não encontrado</title></head>
<body style="font-family:sans-serif;text-align:center;padding:60px">
  <h1>Link não encontrado</h1>
  <p>Este link pode ter expirado, sido removido ou simplesmente não existir.</p>
</body>
</html>`

Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const parts = url.pathname.split('/').filter(Boolean)
  const slug = parts[parts.length - 1]

  if (!slug || slug === 'r') {
    return new Response('Slug not provided', { status: 400 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const publishableKeys = Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')
  const publishableKey = publishableKeys
    ? JSON.parse(publishableKeys)['default']
    : Deno.env.get('SUPABASE_ANON_KEY')!
  const supabase = createClient(supabaseUrl, publishableKey)

  const { data, error } = await supabase.rpc('redirect_link', { p_slug: slug }).maybeSingle()

  if (error || !data) {
    return new Response(NOT_FOUND_HTML, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const referrer = req.headers.get('referer') ?? null
  const userAgent = req.headers.get('user-agent') ?? null

  // @ts-ignore EdgeRuntime is a Supabase Edge Functions global for background tasks
  EdgeRuntime.waitUntil(
    supabase.from('link_clicks').insert({
      link_id: data.link_id,
      short_slug: slug,
      referrer,
      user_agent: userAgent,
    }),
  )

  return new Response(null, {
    status: 302,
    headers: { Location: buildRouterUrl(slug) },
  })
})
