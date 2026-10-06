export default defineNuxtPlugin(() => {
  const route = useRoute()
  const config = useRuntimeConfig()

  const base = String(config.public.siteUrl || '').replace(/\/$/, '')
  if (!base) return

  const canonicalFor = () => {
    const cleanPath = (route.path || '/').replace(/\/+$/, '') || '/'
    return `${base}${cleanPath === '/' ? '/' : cleanPath}`
  }

  const apply = () => {
    const canonical = canonicalFor()
    useSeoMeta({
      ogUrl: canonical
    })
    useHead({
      link: [
        { rel: 'canonical', href: canonical },
        { rel: 'alternate', hreflang: 'de-DE', href: canonical },
        { rel: 'alternate', hreflang: 'x-default', href: canonical }
      ]
    })
  }

  apply()
  watch(() => route.fullPath, apply)
})
