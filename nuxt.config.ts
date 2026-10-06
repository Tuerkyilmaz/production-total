import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  experimental: {
    appManifest: false
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    adminSessionSecret:
      process.env.ADMIN_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-only-change-me',
    adminPassword: process.env.ADMIN_PASSWORD || 'Production2025!',
    blobReadWriteToken: process.env.BLOB_READ_WRITE_TOKEN || '',
    supabaseStorageUrl: process.env.SUPABASE_STORAGE_URL || '',
    supabaseAccessKey: process.env.SUPABASE_ACCESS_KEY || '',
    supabaseSecretAccessKey: process.env.SUPABASE_SECRET_ACCESS_KEY || '',
    supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'media',
    supabaseLogosBucket: process.env.SUPABASE_LOGOS_BUCKET || process.env.SUPABASE_PARTNER_LOGOS_BUCKET || 'logos',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: Number(process.env.SMTP_PORT || 465),
    smtpSecure: String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true',
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://productiontotal.com',
      contactEmail: process.env.CONTACT_EMAIL || 'info@productiontotal.com',
      supabaseUrl: process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''
    }
  },
  vite: {
    resolve: {
      alias: {
        '#app-manifest': join(projectRoot, 'node_modules/unenv/dist/runtime/mock/empty.mjs')
      }
    }
  },
  modules: ['@nuxtjs/tailwindcss', '@vueuse/motion/nuxt'],
  app: {
    head: {
      htmlAttrs: { lang: 'de' },
      title: 'ProductionTotal | Video-Produktion für Ihre Marke',
      meta: [
        { name: 'description', content: 'ProductionTotal: Cinematische Video-Produktion für Marken, Events und Creator.' },
        { name: 'keywords', content: 'Video-Produktion, Filmproduktion, Livestream, Twitch, Imagefilm, Motorsport, Rinteln, Eventproduktion' },
        { name: 'author', content: 'ProductionTotal UG' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#000000' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'ProductionTotal' },
        { property: 'og:locale', content: 'de_DE' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap' }
      ]
    }
  },
  css: ['~/assets/css/main.css']
})
