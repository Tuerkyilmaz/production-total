import { defineNuxtPlugin } from '#app'
import { nextTick } from 'vue'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('page:finish', () => {
    nextTick(() => {
      const ST = nuxtApp.$ScrollTrigger as { refresh?: () => void } | undefined
      ST?.refresh?.()
    })
  })
})
