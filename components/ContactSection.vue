<template>
  <section id="contact" class="relative py-24 sm:py-32 md:py-40 bg-[#0a0a0a]">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">
      <div class="max-w-3xl mx-auto">
        <p class="text-xs uppercase tracking-[0.25em] text-white/30 mb-4 font-sans">Kontakt</p>
        <h2 class="font-headline font-bold text-4xl sm:text-5xl md:text-6xl tracking-tight text-white mb-5">
          Lass uns reden.
        </h2>
        <p class="font-sans text-white/45 text-base leading-relaxed mb-2">
          Video, Event oder Kampagne? Wir melden uns zeitnah.
        </p>
        <p class="font-sans text-white/45 text-sm mb-12">
          Oder direkt per Mail:
          <a :href="`mailto:${contactEmail}`" class="text-white/70 underline underline-offset-4 hover:text-white transition-colors">{{ contactEmail }}</a>
        </p>

        <form class="space-y-5" @submit.prevent="submitForm">
          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label for="contact-name" class="block text-xs uppercase tracking-[0.18em] text-white/40 mb-2 font-sans">Name / Unternehmen</label>
              <input
                id="contact-name"
                v-model="form.name"
                type="text"
                name="name"
                required
                autocomplete="name"
                class="w-full border-b border-white/15 px-0 py-3 bg-transparent text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors"
                placeholder="Max Mustermann"
              >
            </div>
            <div>
              <label for="contact-email" class="block text-xs uppercase tracking-[0.18em] text-white/40 mb-2 font-sans">E-Mail</label>
              <input
                id="contact-email"
                v-model="form.email"
                type="email"
                name="email"
                required
                autocomplete="email"
                class="w-full border-b border-white/15 px-0 py-3 bg-transparent text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors"
                placeholder="max@beispiel.de"
              >
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-5">
            <div>
              <label for="contact-phone" class="block text-xs uppercase tracking-[0.18em] text-white/40 mb-2 font-sans">Telefon</label>
              <input
                id="contact-phone"
                v-model="form.phone"
                type="tel"
                name="phone"
                required
                autocomplete="tel"
                class="w-full border-b border-white/15 px-0 py-3 bg-transparent text-white font-sans text-sm placeholder:text-white/25 focus:outline-none focus:border-white/50 transition-colors"
                placeholder="+49 …"
              >
            </div>
            <div>
              <label for="contact-subject" class="block text-xs uppercase tracking-[0.18em] text-white/40 mb-2 font-sans">Betreff</label>
              <select
                id="contact-subject"
                v-model="form.subject"
                name="subject"
                required
                class="w-full border-b border-white/15 px-0 py-3 bg-transparent text-white font-sans text-sm focus:outline-none focus:border-white/50 transition-colors appearance-none"
              >
                <option value="" disabled class="bg-[#111]">Bitte auswählen</option>
                <option v-for="opt in subjectOptions" :key="opt.value" :value="opt.value" class="bg-[#111]">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <div>
            <label for="contact-message" class="block text-xs uppercase tracking-[0.18em] text-white/40 mb-2 font-sans">Nachricht</label>
            <textarea
              id="contact-message"
              v-model="form.message"
              name="message"
              required
              rows="5"
              class="w-full border-b border-white/15 px-0 py-3 bg-transparent text-white font-sans text-sm placeholder:text-white/25 resize-none focus:outline-none focus:border-white/50 transition-colors"
              placeholder="Kurze Beschreibung Ihres Vorhabens …"
            />
          </div>

          <div class="pt-4">
            <button
              type="submit"
              :disabled="isSubmitting"
              class="font-headline inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-black text-sm font-semibold tracking-wide hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'Wird gesendet …' : 'Nachricht senden' }}
              <span v-if="!isSubmitting">→</span>
            </button>
          </div>
          <p
            v-if="alertMessage"
            class="text-sm mt-4"
            :class="alertType === 'success' ? 'text-emerald-400' : 'text-red-400'"
            role="status"
            aria-live="polite"
          >
            {{ alertMessage }}
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const contactEmail = computed(() => config.public.contactEmail || 'info@productiontotal.com')

const subjectOptions = [
  { value: 'allgemein', label: 'Allgemeine Anfrage' },
  { value: 'imagefilme', label: 'Imagefilme' },
  { value: 'event-videos', label: 'Event-Videos' },
  { value: 'werbefilm', label: 'Werbefilmproduktion' },
  { value: 'social', label: 'Social-Media-Content' },
  { value: 'youtube', label: 'YouTube-Formate' },
  { value: 'branded', label: 'Branded Content' }
] as const

const form = reactive({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const isSubmitting = ref(false)
const alertMessage = ref('')
const alertType = ref<'success' | 'error'>('success')
let alertTimer: ReturnType<typeof setTimeout> | null = null

function showAlert(message: string, type: 'success' | 'error') {
  alertMessage.value = message
  alertType.value = type
  if (alertTimer) clearTimeout(alertTimer)
  alertTimer = setTimeout(() => {
    alertMessage.value = ''
  }, 15000)
}

async function submitForm() {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        phone: form.phone,
        subject: form.subject,
        message: form.message
      }
    })
    form.name = ''
    form.email = ''
    form.phone = ''
    form.subject = ''
    form.message = ''
    showAlert('Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.', 'success')
  } catch (error: any) {
    const msg = error?.data?.statusMessage || 'Senden fehlgeschlagen. Bitte versuchen Sie es erneut.'
    showAlert(msg, 'error')
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(() => {
  if (alertTimer) clearTimeout(alertTimer)
})
</script>
