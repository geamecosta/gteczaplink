export function getShortUrl(slug: string): string {
  if (typeof window === 'undefined') return `/r/${slug}`
  return `${window.location.origin}/r/${slug}`
}

export function getShortUrlPrefix(): string {
  if (typeof window === 'undefined') return '/r/'
  return `${window.location.host}/r/`
}
