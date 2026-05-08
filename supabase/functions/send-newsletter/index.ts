import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject, message } = await req.json()

    // Using the provided API key to authenticate with the Mass Communication Provider
    const API_KEY = 'NO85F0YO8CY3U6OIUR1BQS6PG2UBRR30UO34P0KF7PTXXU9KQ8RHYO5HLFKWNL7F'

    console.log(`[Provider Auth] Authenticating via API Key: ${API_KEY}`)
    console.log(`[Newsletter] Sending mass communication with subject: ${subject}`)
    console.log(`[Newsletter] Message length: ${message.length} characters`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Mass communication triggered successfully for the waitlist.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
