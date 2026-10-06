<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <p class="text-white/50 text-sm">Creator-Bewerbungen verwalten.</p>
      <div class="flex gap-2">
        <button
          v-for="opt in statusFilters"
          :key="opt.value"
          type="button"
          class="font-headline px-3 py-1.5 text-xs border transition-colors"
          :class="filterStatus === opt.value ? 'border-white text-white' : 'border-white/20 text-white/45 hover:text-white/70'"
          @click="filterStatus = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>
    </div>

    <div v-if="listError" class="text-sm text-red-400">{{ listError }}</div>

    <div class="border border-white/15 divide-y divide-white/10">
      <article
        v-for="app in filtered"
        :key="app.id"
        class="p-4 flex flex-col sm:flex-row gap-4"
      >
        <div class="shrink-0 flex items-center gap-3">
          <img v-if="app.creatorFotoUrl" :src="app.creatorFotoUrl" alt="" class="h-10 w-10 rounded-full object-cover border border-white/15">
          <div v-else class="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/30">?</div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-white text-sm">{{ app.creatorName ?? '—' }}</p>
          <p class="text-xs text-white/40 mt-0.5">Event: {{ app.eventTitle ?? '—' }}</p>
          <p v-if="app.nachricht" class="text-xs text-white/35 mt-1 font-sans leading-relaxed">{{ app.nachricht }}</p>
          <p class="text-[10px] text-white/20 mt-1 font-sans">{{ formatDate(app.createdAt) }}</p>
        </div>
        <div class="shrink-0 flex flex-col gap-2 items-end justify-center">
          <span
            class="text-[10px] border px-2 py-0.5 font-sans tracking-wide"
            :class="{
              'border-yellow-400/30 text-yellow-400/70': app.status === 'pending',
              'border-green-500/30 text-green-400/70': app.status === 'accepted',
              'border-red-500/30 text-red-400/60': app.status === 'rejected'
            }"
          >
            {{ statusLabel(app.status) }}
          </span>
          <div v-if="app.status === 'pending'" class="flex gap-2">
            <button
              type="button"
              class="font-headline px-3 py-1.5 text-xs border border-green-500/40 text-green-400 hover:bg-green-950/20 transition-colors disabled:opacity-50"
              :disabled="updating.has(app.id)"
              @click="setStatus(app.id, 'accepted')"
            >
              Annehmen
            </button>
            <button
              type="button"
              class="font-headline px-3 py-1.5 text-xs border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-colors disabled:opacity-50"
              :disabled="updating.has(app.id)"
              @click="setStatus(app.id, 'rejected')"
            >
              Ablehnen
            </button>
          </div>
          <div v-else-if="app.status !== 'pending'" class="flex gap-2">
            <button
              type="button"
              class="font-headline px-3 py-1.5 text-xs border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition-colors disabled:opacity-50"
              :disabled="updating.has(app.id)"
              @click="setStatus(app.id, 'pending')"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
      </article>
      <p v-if="!filtered.length && !loading" class="p-6 text-center text-white/40 text-sm">Keine Bewerbungen.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreatorApplicationItem } from '~/data/cms'

const emit = defineEmits<{ toast: [message: string, variant: 'success' | 'error'] }>()

type AppWithMeta = CreatorApplicationItem & { creatorName?: string; creatorFotoUrl?: string | null; eventTitle?: string }

const statusFilters = [
  { value: '', label: 'Alle' },
  { value: 'pending', label: 'Offen' },
  { value: 'accepted', label: 'Angenommen' },
  { value: 'rejected', label: 'Abgelehnt' }
]

const items = ref<AppWithMeta[]>([])
const loading = ref(false)
const listError = ref('')
const updating = ref(new Set<string>())
const filterStatus = ref('')

const filtered = computed(() =>
  filterStatus.value ? items.value.filter((a) => a.status === filterStatus.value) : items.value
)

function statusLabel(s: string) {
  if (s === 'pending') return 'Offen'
  if (s === 'accepted') return 'Angenommen'
  if (s === 'rejected') return 'Abgelehnt'
  return s
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' }) }
  catch { return iso }
}

function apiError(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string } }
  return err?.data?.message || fallback
}

async function load() {
  loading.value = true; listError.value = ''
  try { items.value = await $fetch<AppWithMeta[]>('/api/admin/applications', { credentials: 'include' }) }
  catch (e) { listError.value = apiError(e, 'Laden fehlgeschlagen.'); items.value = [] }
  finally { loading.value = false }
}
onMounted(load)

async function setStatus(id: string, status: 'accepted' | 'rejected' | 'pending') {
  updating.value = new Set([...updating.value, id])
  try {
    await $fetch(`/api/admin/applications/${id}/status`, { method: 'PUT', body: { status }, credentials: 'include' })
    emit('toast', status === 'accepted' ? 'Angenommen.' : status === 'rejected' ? 'Abgelehnt.' : 'Zurückgesetzt.', 'success')
    await load()
  } catch (e) {
    emit('toast', apiError(e, 'Fehler beim Aktualisieren.'), 'error')
  } finally {
    updating.value = new Set([...updating.value].filter((i) => i !== id))
  }
}
</script>
