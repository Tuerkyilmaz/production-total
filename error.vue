<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const statusCode = computed(() => props.error.statusCode ?? 500)
const is404 = computed(() => statusCode.value === 404)

const pageTitle = computed(() =>
  is404.value ? 'Seite nicht gefunden (404) | ProductionTotal' : `Fehler ${statusCode.value} | ProductionTotal`
)

useHead({
  title: pageTitle,
  meta: [{ name: 'robots', content: 'noindex, follow' }]
})

function goHome () {
  clearError({ redirect: '/' })
}

function goProjects () {
  clearError({ redirect: '/projekte' })
}
</script>

<template>
  <div class="min-h-screen bg-black text-white flex flex-col">
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center font-sans">
      <p class="font-headline text-6xl sm:text-8xl font-bold tabular-nums mb-2">
        {{ statusCode }}
      </p>
      <h1 class="font-headline text-xl sm:text-2xl font-semibold mb-4 max-w-lg">
        <span v-if="is404">Diese Seite gibt es nicht.</span>
        <span v-else>Etwas ist schiefgelaufen.</span>
      </h1>
      <p class="text-white/70 max-w-md text-sm sm:text-base leading-relaxed mb-10">
        <span v-if="is404">
          Der Aufruf stimmte mit keiner Route überein. Prüfen Sie die URL oder kehren Sie zur Übersicht zurück.
        </span>
        <span v-else>
          {{ error.message || 'Bitte laden Sie die Seite neu oder versuchen Sie es in Kürze erneut.' }}
        </span>
      </p>
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none sm:justify-center">
        <button
          type="button"
          class="font-headline min-h-11 w-full sm:w-auto px-8 py-3 bg-white text-black font-semibold text-sm hover:bg-white/95 transition-colors"
          @click="goHome"
        >
          Zur Startseite
        </button>
        <button
          type="button"
          class="font-headline min-h-11 w-full sm:w-auto px-8 py-3 border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
          @click="goProjects"
        >
          Zu den Projekten
        </button>
      </div>
    </div>
  </div>
</template>
