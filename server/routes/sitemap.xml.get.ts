import { createClient } from '@supabase/supabase-js'

function escapeXml (s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const requestOrigin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin.replace(/\/$/, '')
  const configuredBase = String(config.public.siteUrl || '').replace(/\/$/, '')
  const base = requestOrigin || configuredBase
  if (!base) {
    event.node.res.statusCode = 500
    return 'NUXT_PUBLIC_SITE_URL / runtimeConfig.public.siteUrl fehlt'
  }

  const staticPaths = ['/', '/projekte', '/impressum', '/datenschutz']
  let projectPaths: string[] = []
  const url = config.public.supabaseUrl
  const key = config.public.supabaseAnonKey
  if (url && key) {
    const supabase = createClient(url, key)
    const { data } = await supabase.from('projekte').select('slug').order('listen_index', { ascending: true })
    projectPaths = (data ?? []).map((r) => `/projekte/${r.slug}`)
  }

  const sanitizePath = (path: string) => {
    const noFragment = path.split('#')[0] || '/'
    const noQuery = noFragment.split('?')[0] || '/'
    const normalized = noQuery.startsWith('/') ? noQuery : `/${noQuery}`
    return normalized === '' ? '/' : normalized
  }

  const paths = Array.from(new Set([...staticPaths, ...projectPaths].map(sanitizePath)))
  const lastmod = new Date().toISOString().slice(0, 10)

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map((path) => {
    const loc = path === '/' ? `${base}/` : `${base}${path}`
    const priority =
      path === '/' ? '1.0' : path === '/projekte' ? '0.9' : path.startsWith('/projekte/') ? '0.75' : '0.65'
    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600, s-maxage=3600')
  return body
})
