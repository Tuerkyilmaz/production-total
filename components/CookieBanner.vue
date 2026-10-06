<script setup lang="ts">
const STORAGE_KEY = 'pt-cookie-consent'

const visible = ref(false)

function applyChoice (value: 'accepted' | 'declined') {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {}
  visible.value = false
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    visible.value = stored !== 'accepted' && stored !== 'declined'
  } catch {
    visible.value = true
  }
})

watch(visible, (v) => {
  if (import.meta.client) {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-banner-title"
      >
        <div class="absolute inset-0 bg-black/55 backdrop-blur-[2px]" aria-hidden="true" />

        <div
          class="relative w-full max-w-md rounded-2xl border border-black/10 bg-white shadow-xl shadow-black/10"
        >
          <div class="p-6 sm:p-8">
            <h2 id="cookie-banner-title" class="font-headline text-xl sm:text-2xl font-semibold tracking-tight text-black">
              Cookie-Einstellungen
            </h2>
            <p class="mt-3 text-sm sm:text-[15px] leading-relaxed text-black/70">
              Wir verwenden Cookies, um diese Website sicher und komfortabel zu nutzen. Sie können alle optionalen Cookies ablehnen oder alle annehmen. Details finden Sie in unserer Datenschutzerklärung.
            </p>

            <div class="mt-6 flex w-full flex-col-reverse gap-3 sm:flex-row sm:gap-3">
              <button
                type="button"
                class="font-headline min-h-11 w-full shrink-0 rounded-xl border border-black/15 bg-white px-4 text-sm font-medium text-black transition-colors hover:bg-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:basis-0 sm:flex-1"
                @click="applyChoice('declined')"
              >
                Ablehnen
              </button>
              <button
                type="button"
                class="font-headline min-h-11 w-full shrink-0 rounded-xl bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 sm:basis-0 sm:flex-1"
                @click="applyChoice('accepted')"
              >
                Annehmen
              </button>
            </div>

            <p class="mt-5 text-center text-sm text-black/55">
              <NuxtLink
                to="/datenschutz"
                class="font-headline underline underline-offset-2 transition-colors hover:text-black"
              >
                Datenschutzerklärung
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
