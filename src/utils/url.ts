export function getBaseUrl(): string {
  // 1. Client-side: dynamically use current browser origin (works on Vercel, localhost, and custom domains)
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  // 2. Explicit site URL from environment variable if configured
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    let url = process.env.NEXT_PUBLIC_SITE_URL
    url = url.startsWith('http') ? url : `https://${url}`
    return url.endsWith('/') ? url.slice(0, -1) : url
  }

  // 3. Vercel deployment URL automatically provided by Vercel
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // 4. Default fallback for local development
  return 'http://localhost:3000'
}
