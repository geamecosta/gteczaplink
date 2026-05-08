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
    const body = await req.json()
    const { name, email, phone, referral_code } = body

    // Here you would integrate with Resend/SendGrid (Email) and Twilio/Z-API/Evolution (WhatsApp)
    console.log(`[Email] Sending welcome email to: ${email}, Name: ${name}`)
    console.log(`[WhatsApp] Sending welcome message to: ${phone}`)
    console.log(`[Gamification] Referral code tracked: ${referral_code}`)

    // Mock response indicating successful notifications payload accepted
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Welcome email and WhatsApp notifications triggered successfully',
        data: { email, phone, referral_code },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
