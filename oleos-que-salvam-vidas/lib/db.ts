import { neon } from '@neondatabase/serverless'

// Add options=--search_path%3Doleos to DATABASE_URL for schema isolation
function buildUrl(url: string) {
  try {
    const u = new URL(url)
    u.searchParams.set('options', '--search_path=oleos')
    return u.toString()
  } catch {
    return url + (url.includes('?') ? '&' : '?') + 'options=--search_path%3Doleos'
  }
}

const sql = neon(buildUrl(process.env.DATABASE_URL!))
export { sql }
