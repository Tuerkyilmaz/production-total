<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-4">
      <p class="text-white/50 text-sm">Events für Creator-Portal verwalten.</p>
      <button
        type="button"
        class="font-headline shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-semibold tracking-wide hover:bg-white/90 transition-colors"
        @click="openCreate"
      >
        <span class="text-base leading-none">+</span>
        Neues Event
      </button>
    </div>

    <div v-if="listError" class="text-sm text-red-400">{{ listError }}</div>

    <div class="border border-white/15 divide-y divide-white/10">
      <article
        v-for="ev in items"
        :key="ev.id"
        class="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <div class="shrink-0 w-20 aspect-video bg-white/[0.04] overflow-hidden">
          <img v-if="ev.thumbnailUrl" :src="ev.thumbnailUrl" :alt="ev.title" class="w-full h-full object-cover">
          <div v-else class="w-full h-full flex items-center justify-center text-white/10 text-xs">—</div>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-white">{{ ev.title }}</p>
          <p class="text-xs text-white/40 mt-0.5">{{ formatDate(ev.eventDate) }}</p>
          <span
            class="inline-block mt-1 text-[10px] px-2 py-0.5 border font-sans tracking-wide"
            :class="ev.published ? 'border-green-500/30 text-green-400/70' : 'border-white/15 text-white/30'"
          >
            {{ ev.published ? 'Veröffentlicht' : 'Entwurf' }}
          </span>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            type="button"
            class="font-headline px-4 py-2 text-xs border border-white/30 hover:border-white/60 hover:bg-white/5 transition-colors"
            @click="openEdit(ev)"
          >
            Bearbeiten
          </button>
          <button
            type="button"
            class="font-headline px-4 py-2 text-xs border border-red-500/40 text-red-400 hover:border-red-400/60 hover:bg-red-950/20 transition-colors"
            @click="openDeleteModal(ev)"
          >
            Löschen
          </button>
        </div>
      </article>
      <p v-if="!items.length && !loading" class="p-6 text-center text-white/40 text-sm">Noch keine Events.</p>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="kal-modal">
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))]"
          role="dialog"
          aria-modal="true"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" @click="closeModal" />
          <div class="relative w-full max-w-lg border border-white/20 bg-zinc-950 shadow-2xl my-auto">
            <div class="flex items-center justify-between gap-4 border-b border-white/15 px-5 py-4">
              <h2 class="font-headline text-lg font-semibold text-white">{{ editingId ? 'Event bearbeiten' : 'Neues Event' }}</h2>
              <button type="button" class="text-white/50 hover:text-white text-2xl leading-none px-1" @click="closeModal">×</button>
            </div>
            <div class="overflow-y-auto max-h-[calc(100dvh-10rem)] px-5 py-5 space-y-4">
              <label class="block text-sm text-white/80">
                Titel *
                <input v-model="form.title" type="text" required class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none">
              </label>
              <label class="block text-sm text-white/80">
                Datum *
                <input v-model="form.event_date" type="date" required class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none">
              </label>
              <label class="block text-sm text-white/80">
                Beschreibung
                <textarea v-model="form.beschreibung" rows="3" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none resize-none" />
              </label>
              <div class="block text-sm text-white/80">
                Thumbnail <span class="text-white/35 font-normal">(JPG/PNG/WebP, max. 2 MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  class="mt-1.5 block w-full text-sm text-white/60 file:mr-3 file:border file:border-white/30 file:bg-white/5 file:px-3 file:py-2 file:text-xs file:text-white/80 hover:file:bg-white/10 file:cursor-pointer"
                  @change="onPickThumbnail"
                >
                <div v-if="form.thumbnail_url" class="mt-2 flex items-center gap-3">
                  <img :src="form.thumbnail_url" alt="" class="h-14 aspect-video object-cover border border-white/15">
                  <button type="button" class="text-xs text-white/40 hover:text-white/70 underline underline-offset-2" @click="form.thumbnail_url = ''">Entfernen</button>
                </div>
                <p v-if="thumbnailUploading" class="mt-1 text-xs text-white/40">Wird hochgeladen …</p>
              </div>
              <label class="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                <input v-model="form.published" type="checkbox" class="accent-white w-4 h-4">
                Veröffentlicht (für Creator sichtbar)
              </label>
            </div>
            <div class="flex justify-end gap-3 border-t border-white/15 px-5 py-4">
              <button type="button" class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/80 hover:bg-white/5" @click="closeModal">Abbrechen</button>
              <button type="button" class="font-headline px-6 py-2.5 bg-white text-black font-semibold text-sm hover:bg-white/90 disabled:opacity-50" :disabled="saving" @click="save">
                {{ saving ? 'Speichern …' : editingId ? 'Aktualisieren' : 'Anlegen' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <AdminConfirmModal
      :open="deleteModalOpen"
      :busy="deleting"
      busy-label="Löschen …"
      title="Event löschen?"
      :message="deleteMessage"
      confirm-label="Ja, löschen"
      @confirm="confirmDelete"
      @cancel="deleteModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import type { CalendarEventItem } from '~/data/cms'

const emit = defineEmits<{ toast: [message: string, variant: 'success' | 'error'] }>()

type FormState = { title: string; event_date: string; beschreibung: string; thumbnail_url: string; published: boolean }

const emptyForm = (): FormState => ({ title: '', event_date: '', beschreibung: '', thumbnail_url: '', published: false })

const items = ref<CalendarEventItem[]>([])
const loading = ref(false)
const listError = ref('')
const saving = ref(false)
const deleting = ref(false)
const thumbnailUploading = ref(false)
const editingId = ref<string | null>(null)
const modalOpen = ref(false)
const deleteModalOpen = ref(false)
const pendingDelete = ref<CalendarEventItem | null>(null)
const form = ref<FormState>(emptyForm())

const deleteMessage = computed(() => pendingDelete.value ? `Event „${pendingDelete.value.title}" löschen?` : '')

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
  try { items.value = await $fetch<CalendarEventItem[]>('/api/admin/calendar-events', { credentials: 'include' }) }
  catch (e) { listError.value = apiError(e, 'Laden fehlgeschlagen.'); items.value = [] }
  finally { loading.value = false }
}
onMounted(load)

async function onPickThumbnail(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0];
  (ev.target as HTMLInputElement).value = ''
  if (!file) return
  if (file.size > 2 * 1024 * 1024) { emit('toast', 'Maximal 2 MB.', 'error'); return }
  thumbnailUploading.value = true
  try {
    const fd = new FormData(); fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/admin/upload?purpose=projekt', { method: 'POST', body: fd, credentials: 'include' })
    form.value.thumbnail_url = res.url
  } catch (e) { emit('toast', apiError(e, 'Upload fehlgeschlagen.'), 'error') }
  finally { thumbnailUploading.value = false }
}

function openCreate() { editingId.value = null; form.value = emptyForm(); modalOpen.value = true }

function openEdit(ev: CalendarEventItem) {
  editingId.value = ev.id
  form.value = { title: ev.title, event_date: ev.eventDate, beschreibung: ev.beschreibung ?? '', thumbnail_url: ev.thumbnailUrl ?? '', published: ev.published }
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false; editingId.value = null; form.value = emptyForm() }

async function save() {
  if (!form.value.title.trim()) { emit('toast', 'Titel ist erforderlich.', 'error'); return }
  if (!form.value.event_date) { emit('toast', 'Datum ist erforderlich.', 'error'); return }
  saving.value = true
  try {
    const payload = { title: form.value.title.trim(), event_date: form.value.event_date, beschreibung: form.value.beschreibung.trim() || null, thumbnail_url: form.value.thumbnail_url.trim() || null, published: form.value.published }
    if (editingId.value) {
      await $fetch(`/api/admin/calendar-events/${editingId.value}`, { method: 'PUT', body: payload, credentials: 'include' })
      emit('toast', 'Event aktualisiert.', 'success')
    } else {
      await $fetch('/api/admin/calendar-events', { method: 'POST', body: payload, credentials: 'include' })
      emit('toast', 'Event angelegt.', 'success')
    }
    closeModal(); await load()
  } catch (e) { emit('toast', apiError(e, 'Speichern fehlgeschlagen.'), 'error') }
  finally { saving.value = false }
}

function openDeleteModal(ev: CalendarEventItem) { pendingDelete.value = ev; deleteModalOpen.value = true }

async function confirmDelete() {
  const ev = pendingDelete.value; if (!ev || deleting.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/calendar-events/${ev.id}`, { method: 'DELETE', credentials: 'include' })
    deleteModalOpen.value = false; pendingDelete.value = null
    emit('toast', 'Event gelöscht.', 'success'); await load()
  } catch (e) { emit('toast', apiError(e, 'Löschen fehlgeschlagen.'), 'error') }
  finally { deleting.value = false }
}
</script>

<style scoped>
.kal-modal-enter-active, .kal-modal-leave-active { transition: opacity 0.2s ease; }
.kal-modal-enter-from, .kal-modal-leave-to { opacity: 0; }
</style>
