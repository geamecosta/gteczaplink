// WhatsApp number connected in Wahooks that receives every click before
// forwarding the customer to the real store (see wahooks-webhook Edge Function).
export const ROUTER_PHONE = '556291501144'

export function buildRouterUrl(slug: string): string {
  const message = `Olá! Tenho interesse nos produtos 🛍️\n\nRef: ${slug}`
  return `https://wa.me/${ROUTER_PHONE}?text=${encodeURIComponent(message)}`
}
