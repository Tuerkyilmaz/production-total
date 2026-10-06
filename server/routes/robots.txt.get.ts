export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const requestOrigin = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true }).origin.replace(/\/$/, '')
  const configuredBase = String(config.public.siteUrl || '').replace(/\/$/, '')
  const base = requestOrigin || configuredBase
  const lines = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${base}/sitemap.xml`
  ]
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=86400')
  return lines.join('\n')
})
