<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white">

    <!-- Header -->
    <header class="border-b border-white/[0.06] px-5 sm:px-8 md:px-12 py-4 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <img v-if="me?.foto_url" :src="me.foto_url" :alt="me.name" class="h-8 w-8 rounded-full object-cover border border-white/20">
        <div v-else class="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-headline">
          {{ me?.name?.charAt(0) ?? '?' }}
        </div>
        <span class="font-headline font-semibold text-sm truncate min-w-0 max-w-[160px] sm:max-w-none">{{ me?.name ?? '…' }}</span>
      </div>
      <button
        class="font-headline text-xs px-3 py-2 border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-colors"
        @click="logout"
      >
        Ausloggen
      </button>
    </header>

    <!-- Main -->
    <main class="px-5 sm:px-8 md:px-12 py-10 max-w-4xl">
      <h1 class="font-headline font-bold text-3xl sm:text-4xl tracking-tight mb-2">Nächste Projekte</h1>
      <p class="text-white/35 text-sm font-sans mb-8">Hier siehst du alle anstehenden Events. Bewirb dich einfach.</p>

      <div v-if="pending" class="text-white/20 text-sm">Wird geladen …</div>

      <div v-else-if="!events.length" class="py-16 text-center text-white/25 text-sm">
        Aktuell keine Events geplant.
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="ev in events"
          :key="ev.id"
          class="border border-white/[0.08] bg-white/[0.02] p-4 sm:p-5 flex flex-col sm:flex-row gap-4"
        >
          <!-- Thumbnail -->
          <div class="shrink-0 w-full sm:w-32 aspect-video sm:aspect-auto sm:h-20 bg-white/[0.04] overflow-hidden">
            <img v-if="ev.thumbnailUrl" :src="ev.thumbnailUrl" :alt="ev.title" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-white/10 text-xs">Kein Bild</div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="text-[10px] text-white/30 font-sans uppercase tracking-widest mb-1">
              {{ formatDate(ev.eventDate) }}
            </p>
            <h2 class="font-headline font-bold text-base leading-tight mb-1">{{ ev.title }}</h2>
            <p v-if="ev.beschreibung" class="text-sm text-white/45 font-sans leading-relaxed line-clamp-2">{{ ev.beschreibung }}</p>
          </div>

          <!-- Actions -->
          <div class="shrink-0 flex items-end sm:items-center">
            <template v-if="ev.applicationStatus === 'pending'">
              <span class="text-xs font-sans text-yellow-400/70 border border-yellow-400/20 px-3 py-1.5">Beworben</span>
            </template>
            <template v-else-if="ev.applicationStatus === 'accepted'">
              <span class="text-xs font-sans text-green-400/70 border border-green-400/20 px-3 py-1.5">Angenommen ✓</span>
            </template>
            <template v-else-if="ev.applicationStatus === 'rejected'">
              <span class="text-xs font-sans text-white/25 border border-white/10 px-3 py-1.5">Abgelehnt</span>
            </template>
            <template v-else>
              <button
                class="font-headline text-xs px-4 py-2 bg-white text-black hover:bg-white/90 transition-colors disabled:opacity-50"
                :disabled="applying.has(ev.id)"
                @click="apply(ev.id)"
              >
                {{ applying.has(ev.id) ? '…' : 'Bewerben' }}
              </button>
            </template>
          </div>
        </article>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

type EventWithStatus = {
  id: string; title: string; beschreibung: string | null
  eventDate: string; thumbnailUrl: string | null; published: boolean; listIndex: number
  applicationStatus: 'pending' | 'accepted' | 'rejected' | null
}

const { data: me } = await useFetch<{ id: string; name: string; foto_url: string | null }>('/api/creator/me')

if (!me.value) {
  await navigateTo('/creator')
}

const { data, pending, refresh } = await useFetch<EventWithStatus[]>('/api/creator/events')
const events = computed(() => data.value ?? [])
const applying = ref(new Set<string>())

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return iso
  }
}

async function apply(eventId: string) {
  applying.value = new Set([...applying.value, eventId])
  try {
    await $fetch(`/api/creator/events/${eventId}/apply`, { method: 'POST' })
    await refresh()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    alert(err?.data?.message || 'Bewerbung fehlgeschlagen.')
  } finally {
    applying.value = new Set([...applying.value].filter((id) => id !== eventId))
  }
}

async function logout() {
  await $fetch('/api/creator/logout', { method: 'POST' })
  await navigateTo('/creator')
}
</script>
