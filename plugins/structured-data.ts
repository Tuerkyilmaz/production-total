export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const base = String(config.public.siteUrl || '').replace(/\/$/, '')
  if (!base) return

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: 'TaToTa LDA',
        url: base,
        email: 'info@productiontotal.com',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Avenida Arriaga N°30, Andar, Sala A',
          postalCode: '9000-064',
          addressLocality: 'Funchal',
          addressRegion: 'Madeira',
          addressCountry: 'PT'
        }
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: 'ProductionTotal',
        inLanguage: 'de-DE',
        publisher: {
          '@id': `${base}/#organization`
        }
      }
    ]
  }

  useHead({
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(graph)
      }
    ]
  })
})
