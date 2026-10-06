<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-x-3"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 translate-x-3"
    >
      <div
        v-if="toast.open"
        role="status"
        :aria-live="toast.variant === 'error' ? 'assertive' : 'polite'"
        class="fixed right-4 top-[calc(3.5rem+1rem)] z-[300] max-w-[calc(100vw-2rem)] rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-sm sm:right-6 sm:top-[calc(4rem+1.25rem)] sm:max-w-md sm:px-5 sm:py-4"
        :class="toast.variant === 'success'
          ? 'border-emerald-500/40 bg-zinc-950/95 text-emerald-50'
          : 'border-red-500/45 bg-zinc-950/95 text-red-100'"
      >
        <p class="font-sans text-sm leading-snug">
          {{ toast.message }}
        </p>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="admin-modal">
      <div
        v-if="editModalOpen"
        class="fixed inset-0 z-[250] flex items-center justify-center overflow-hidden overscroll-none px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] min-[400px]:px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <div
          class="absolute inset-0 bg-black/55"
          aria-hidden="true"
          @click="closeEditModal"
        />
        <div
          class="relative flex min-h-0 w-full max-w-4xl flex-col overflow-hidden rounded-lg border border-white/20 bg-zinc-950 text-zinc-50 shadow-2xl max-h-[min(100dvh-1.5rem,52rem)] sm:max-h-[min(92dvh,56rem)]"
        >
          <div class="flex shrink-0 items-start justify-between gap-3 border-b border-white/15 bg-zinc-950 px-4 py-3.5 sm:px-6 sm:py-4">
            <h2 id="edit-modal-title" class="font-headline text-lg font-semibold leading-snug text-white sm:text-xl">
              {{ editingId ? 'Projekt bearbeiten' : 'Neues Projekt anlegen' }}
            </h2>
            <button
              type="button"
              class="shrink-0 rounded px-2 py-1 text-2xl leading-none text-zinc-200 hover:bg-white/10 hover:text-white"
              aria-label="Schließen"
              @click="closeEditModal"
            >
              ×
            </button>
          </div>
          <div class="edit-modal-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-6">
            <div class="space-y-5 pb-1">
              <AdminProjectFormFields
                :key="`edit-${formFieldsKey}`"
                v-model="form"
                :uploading="uploading"
                @file-change="onFile"
              />
              <div class="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  class="font-headline order-2 w-full px-5 py-3 text-sm text-zinc-100 sm:order-1 sm:w-auto border border-white/35 hover:border-white/55 hover:bg-white/5"
                  @click="closeEditModal"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  class="font-headline order-1 w-full px-5 py-3 bg-white font-semibold text-sm text-zinc-950 hover:bg-white/95 disabled:opacity-50 sm:order-2 sm:w-auto sm:px-6"
                  :disabled="saving"
                  @click="requestSave"
                >
                  Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <Teleport to="body">
    <Transition name="admin-modal">
      <div
        v-if="confirmModalOpen"
        class="fixed inset-0 z-[260] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        <div
          class="absolute inset-0 bg-black/85 backdrop-blur-sm"
          aria-hidden="true"
          @click="confirmModalOpen = false"
        />
        <div class="relative w-full max-w-md border border-white/20 bg-zinc-950 px-6 py-8 shadow-2xl">
          <h3 id="confirm-modal-title" class="font-headline text-lg font-semibold text-white mb-3">
            {{ confirmTitle }}
          </h3>
          <p class="text-white/75 text-sm leading-relaxed mb-8">
            {{ confirmMessage }}
          </p>
          <div class="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/90 hover:border-white/60"
              @click="confirmModalOpen = false"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="font-headline px-5 py-2.5 bg-white text-black font-semibold text-sm hover:bg-white/95 disabled:opacity-50"
              :disabled="saving"
              @click="performSave"
            >
              {{ saving ? 'Speichern …' : 'Ja, speichern' }}
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
    title="Projekt löschen?"
    :message="deleteConfirmMessage"
    confirm-label="Ja, löschen"
    @confirm="performDelete"
    @cancel="closeDeleteModal"
  />

  <main class="min-h-screen bg-black text-white font-sans px-5 sm:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16">
    <div class="max-w-4xl mx-auto">
      <h1 class="font-headline text-3xl sm:text-4xl font-bold mb-6">
        Admin
      </h1>

      <section v-if="!sessionChecked" class="text-white/60 text-sm">
        Lade …
      </section>

      <section v-else-if="!authenticated" class="max-w-sm space-y-4">
        <label class="block text-sm text-white/80">Passwort</label>
        <input
          v-model="loginPassword"
          type="password"
          autocomplete="current-password"
          class="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
          placeholder="Passwort"
          @keydown.enter.prevent="login"
        >
        <p v-if="loginError" class="text-sm text-red-400">
          {{ loginError }}
        </p>
        <button
          type="button"
          class="font-headline px-6 py-3 bg-white text-black font-semibold text-sm hover:bg-white/95 transition-colors"
          :disabled="loggingIn"
          @click="login"
        >
          {{ loggingIn ? 'Anmelden …' : 'Anmelden' }}
        </button>
      </section>

      <section v-else class="space-y-10">
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <p class="text-white/70 text-sm">
            Angemeldet
          </p>
          <button
            type="button"
            class="text-sm text-white/80 underline underline-offset-4 hover:text-white"
            @click="logout"
          >
            Abmelden
          </button>
        </div>

        <nav class="flex flex-wrap gap-2 border-b border-white/15 pb-1" aria-label="Admin-Bereiche">
          <button
            v-for="tab in adminTabs"
            :key="tab.id"
            type="button"
            class="font-headline px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px"
            :class="activeTab === tab.id
              ? 'border-white text-white'
              : 'border-transparent text-white/55 hover:text-white/85'"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>

        <AdminReferenzenTab
          v-if="activeTab === 'referenzen'"
          @toast="showToast"
        />
        <AdminUgcCreatorsTab
          v-else-if="activeTab === 'ugc'"
          @toast="showToast"
        />
        <AdminOpenerTab
          v-else-if="activeTab === 'opener'"
          @toast="showToast"
        />
        <AdminKalenderTab
          v-else-if="activeTab === 'kalender'"
          @toast="showToast"
        />
        <AdminBewerbungenTab
          v-else-if="activeTab === 'bewerbungen'"
          @toast="showToast"
        />

        <template v-else-if="activeTab === 'projekte'">
        <div class="flex items-center justify-between gap-4 -mt-4">
          <p class="text-white/60 text-sm">
            Reihenfolge mit ↑/↓ anpassen. Thumbnail max. 2&nbsp;MB.
          </p>
          <button
            type="button"
            class="font-headline shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-semibold tracking-wide hover:bg-white/90 transition-colors"
            @click="editingId = null; form = emptyForm(); formFieldsKey += 1; editModalOpen = true"
          >
            <span class="text-base leading-none">+</span>
            Neues Projekt anlegen
          </button>
        </div>

        <div v-if="listError" class="text-sm text-red-400">{{ listError }}</div>

        <div class="border border-white/15">
          <div class="sm:hidden divide-y divide-white/10">
            <article
              v-for="(p, idx) in projects"
              :key="`mob-${p.id}`"
              class="p-4 space-y-3"
            >
              <div class="flex gap-3 justify-between items-start">
                <div class="min-w-0 flex-1">
                  <p class="font-medium text-white leading-snug">
                    {{ p.titel }}
                  </p>
                  <p
                    v-if="p.subtitel"
                    class="text-white/65 text-xs mt-1.5 leading-relaxed"
                  >
                    {{ p.subtitel }}
                  </p>
                </div>
                <p class="text-xs text-white/80 text-right font-medium leading-snug shrink-0 max-w-[45%] pl-2">
                  {{ kategorieLabel(p.kategorie) }}
                </p>
              </div>
              <div class="flex flex-col items-end gap-2 w-full">
                <div class="grid grid-cols-2 gap-2 w-full max-w-xs">
                  <button
                    type="button"
                    class="font-headline py-2.5 text-xs uppercase tracking-wide border border-white/30 text-white/90 hover:border-white/55 w-full"
                    @click="startEdit(p)"
                  >
                    Bearbeiten
                  </button>
                  <button
                    type="button"
                    class="font-headline py-2.5 text-xs uppercase tracking-wide border border-red-500/40 text-red-400 hover:border-red-400/70 w-full"
                    @click="openDeleteModal(p)"
                  >
                    Löschen
                  </button>
                </div>
                <AdminReorderRow
                  :index="idx"
                  :total="projects.length"
                  :disabled="reordering"
                  @move="(d) => moveProject(idx, d)"
                  @edge="(e) => moveProjectToEdge(idx, e)"
                />
              </div>
            </article>
            <div
              v-if="!projects.length && !loadingList"
              class="p-6 text-white/50 text-center text-sm"
            >
              Noch keine Einträge in Supabase.
            </div>
          </div>

          <div class="hidden sm:block overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-white/5 border-b border-white/15">
                <tr>
                  <th class="p-3 font-headline font-semibold">
                    Titel
                  </th>
                  <th class="p-3 font-headline font-semibold">
                    Kategorie
                  </th>
                  <th class="p-3 font-headline font-semibold text-right">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(p, idx) in projects" :key="p.id" class="border-b border-white/10">
                  <td class="p-3 align-top">
                    <span class="font-medium">{{ p.titel }}</span>
                    <div v-if="p.subtitel" class="text-white/55 text-xs mt-0.5">
                      {{ p.subtitel }}
                    </div>
                  </td>
                  <td class="p-3 align-top text-white/75">
                    {{ kategorieLabel(p.kategorie) }}
                  </td>
                  <td class="p-3 align-top">
                    <div class="flex flex-col items-end gap-2">
                      <div class="whitespace-nowrap">
                        <button
                          type="button"
                          class="text-xs uppercase tracking-wide mr-3 text-white/85 hover:text-white"
                          @click="startEdit(p)"
                        >
                          Bearbeiten
                        </button>
                        <button
                          type="button"
                          class="text-xs uppercase tracking-wide text-red-400 hover:text-red-300"
                          @click="openDeleteModal(p)"
                        >
                          Löschen
                        </button>
                      </div>
                      <AdminReorderRow
                        :index="idx"
                        :total="projects.length"
                        :disabled="reordering"
                        @move="(d) => moveProject(idx, d)"
                        @edge="(e) => moveProjectToEdge(idx, e)"
                      />
                    </div>
                  </td>
                </tr>
                <tr v-if="!projects.length && !loadingList">
                  <td colspan="3" class="p-6 text-white/50 text-center">
                    Noch keine Einträge in Supabase.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        </template>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import AdminReorderRow from '~/components/admin/AdminReorderRow.vue'

type ProjektKategorie = 'social_media' | 'youtube' | 'imagefilm' | 'event'

type ProjekteRow = {
  id: string
  titel: string
  subtitel: string | null
  projekttext: string | null
  kategorie: ProjektKategorie
  video_url: string | null
  thumbnail_url: string | null
  slug: string
  listen_index: number
  created_at: string
  updated_at: string
}

export type AdminProjectForm = {
  titel: string
  subtitel: string
  projekttext: string
  kategorie: ProjektKategorie
  video_url: string
  thumbnail_url: string
}

const kategorieOptions: { value: ProjektKategorie; label: string }[] = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'imagefilm', label: 'Imagefilm' },
  { value: 'event', label: 'Event' }
]

function kategorieLabel(k: ProjektKategorie): string {
  return kategorieOptions.find((o) => o.value === k)?.label ?? k
}

const MAX_BYTES = 2 * 1024 * 1024

const allowedMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
])

useHead({
  title: 'Admin | ProductionTotal',
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})

type AdminTabId = 'projekte' | 'referenzen' | 'ugc' | 'opener' | 'kalender' | 'bewerbungen'

const adminTabs: { id: AdminTabId; label: string }[] = [
  { id: 'projekte', label: 'Projekte' },
  { id: 'referenzen', label: 'Referenzen' },
  { id: 'ugc', label: 'UGC Creator' },
  { id: 'opener', label: 'Opener' },
  { id: 'kalender', label: 'Kalender' },
  { id: 'bewerbungen', label: 'Bewerbungen' }
]

const activeTab = ref<AdminTabId>('projekte')

const sessionChecked = ref(false)
const authenticated = ref(false)
const loginPassword = ref('')
const loginError = ref('')
const loggingIn = ref(false)

const projects = ref<ProjekteRow[]>([])
const loadingList = ref(false)
const listError = ref('')
const reordering = ref(false)
const deleteModalOpen = ref(false)
const pendingDelete = ref<ProjekteRow | null>(null)
const deleting = ref(false)

const deleteConfirmMessage = computed(() => {
  const p = pendingDelete.value
  if (!p) return ''
  return `Bist du sicher, dass du „${p.titel}“ unwiderruflich löschen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden.`
})

const editingId = ref<string | null>(null)
const editModalOpen = ref(false)
const confirmModalOpen = ref(false)
const saving = ref(false)
const uploading = ref(false)
const formFieldsKey = ref(0)

const confirmTitle = computed(() =>
  editingId.value ? 'Änderungen speichern?' : 'Projekt anlegen?'
)
const confirmMessage = computed(() =>
  editingId.value
    ? 'Bist du sicher, dass du die Änderungen an diesem Projekt speichern möchtest?'
    : 'Bist du sicher, dass du dieses neue Projekt jetzt anlegen möchtest?'
)

const TOAST_MS = 10_000
const toast = ref<{ open: boolean; message: string; variant: 'success' | 'error' }>({
  open: false,
  message: '',
  variant: 'success'
})
let toastHideTimer: ReturnType<typeof setTimeout> | null = null

function showToast (message: string, variant: 'success' | 'error') {
  if (toastHideTimer) {
    clearTimeout(toastHideTimer)
    toastHideTimer = null
  }
  toast.value = { open: true, message, variant }
  toastHideTimer = setTimeout(() => {
    toast.value.open = false
    toastHideTimer = null
  }, TOAST_MS)
}

watch(editModalOpen, (open) => {
  if (!import.meta.client) return
  const v = open ? 'hidden' : ''
  document.documentElement.style.overflow = v
  document.body.style.overflow = v
})

onUnmounted(() => {
  if (toastHideTimer) clearTimeout(toastHideTimer)
  if (import.meta.client) {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
})

const emptyForm = (): AdminProjectForm => ({
  titel: '',
  subtitel: '',
  projekttext: '',
  kategorie: 'social_media',
  video_url: '',
  thumbnail_url: ''
})

const form = ref<AdminProjectForm>(emptyForm())

async function refreshSession() {
  try {
    const r = await $fetch<{ authenticated: boolean }>('/api/admin/me', { credentials: 'include' })
    authenticated.value = r.authenticated
  } catch {
    authenticated.value = false
  } finally {
    sessionChecked.value = true
  }
}

async function loadProjects() {
  loadingList.value = true
  listError.value = ''
  try {
    projects.value = await $fetch<ProjekteRow[]>('/api/admin/projects', { credentials: 'include' })
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string }; message?: string }
    listError.value = err?.data?.message || err?.data?.statusMessage || err?.message || 'Liste konnte nicht geladen werden.'
    projects.value = []
  } finally {
    loadingList.value = false
  }
}

onMounted(async () => {
  await refreshSession()
  if (authenticated.value) {
    await loadProjects()
  }
})

async function login() {
  loginError.value = ''
  loggingIn.value = true
  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: { password: loginPassword.value },
      credentials: 'include'
    })
    loginPassword.value = ''
    authenticated.value = true
    await loadProjects()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string } }
    loginError.value = err?.data?.message || err?.data?.statusMessage || 'Anmeldung fehlgeschlagen.'
  } finally {
    loggingIn.value = false
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
  authenticated.value = false
  projects.value = []
  editModalOpen.value = false
  confirmModalOpen.value = false
  deleteModalOpen.value = false
  pendingDelete.value = null
  resetForm()
}

function resetForm() {
  editingId.value = null
  form.value = emptyForm()
  formFieldsKey.value += 1
}

function closeEditModal() {
  editModalOpen.value = false
  confirmModalOpen.value = false
  resetForm()
}

function startEdit(p: ProjekteRow) {
  editingId.value = p.id
  form.value = {
    titel: p.titel,
    subtitel: p.subtitel ?? '',
    projekttext: p.projekttext ?? '',
    kategorie: p.kategorie,
    video_url: p.video_url ?? '',
    thumbnail_url: p.thumbnail_url ?? ''
  }
  editModalOpen.value = true
}

function openDeleteModal(p: ProjekteRow) {
  pendingDelete.value = p
  deleteModalOpen.value = true
}

function resetDeleteState() {
  deleteModalOpen.value = false
  pendingDelete.value = null
}

function closeDeleteModal() {
  if (deleting.value) return
  resetDeleteState()
}

async function performDelete() {
  const p = pendingDelete.value
  if (!p || deleting.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/projects/${p.id}`, { method: 'DELETE', credentials: 'include' })
    if (editingId.value === p.id) {
      closeEditModal()
    }
    resetDeleteState()
    showToast(`Projekt „${p.titel}“ wurde gelöscht.`, 'success')
    await loadProjects()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string } }
    showToast(err?.data?.message || err?.data?.statusMessage || 'Löschen fehlgeschlagen.', 'error')
  } finally {
    deleting.value = false
  }
}

async function persistReorder (arr: ProjekteRow[]) {
  reordering.value = true
  try {
    await $fetch('/api/admin/projects/reorder', {
      method: 'POST',
      body: { ids: arr.map((row) => row.id) },
      credentials: 'include'
    })
    projects.value = arr
    showToast('Reihenfolge gespeichert.', 'success')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string } }
    showToast(err?.data?.message || err?.data?.statusMessage || 'Reihenfolge konnte nicht gespeichert werden.', 'error')
    await loadProjects()
  } finally {
    reordering.value = false
  }
}

async function moveProject (index: number, direction: 'up' | 'down') {
  const next = direction === 'up' ? index - 1 : index + 1
  if (next < 0 || next >= projects.value.length) return
  const arr = projects.value.slice()
  const tmp = arr[index]!
  arr[index] = arr[next]!
  arr[next] = tmp
  await persistReorder(arr)
}

async function moveProjectToEdge (index: number, edge: 'top' | 'bottom') {
  const len = projects.value.length
  if (len <= 1) return
  if (edge === 'top' && index === 0) return
  if (edge === 'bottom' && index === len - 1) return
  const arr = projects.value.slice()
  const [row] = arr.splice(index, 1)
  if (!row) return
  if (edge === 'top') {
    arr.unshift(row)
  } else {
    arr.push(row)
  }
  await persistReorder(arr)
}

function validateImageFile(file: File): string | null {
  if (!file.type || !allowedMime.has(file.type)) {
    return 'Nur Bilder (JPEG, PNG, WebP, GIF, AVIF), max. 2 MB.'
  }
  if (file.size > MAX_BYTES) {
    return 'Datei zu groß — maximal 2 MB.'
  }
  return null
}

async function onFile(ev: Event) {
  const input = ev.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const err = validateImageFile(file)
  if (err) {
    showToast(err, 'error')
    input.value = ''
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: fd,
      credentials: 'include'
    })
    form.value.thumbnail_url = res.url
    showToast('Thumbnail hochgeladen.', 'success')
  } catch (e: unknown) {
    const errFetch = e as { data?: { message?: string; statusMessage?: string } }
    showToast(errFetch?.data?.message || errFetch?.data?.statusMessage || 'Upload fehlgeschlagen.', 'error')
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function requestSave() {
  if (!form.value.titel.trim()) {
    showToast('Titel ist erforderlich.', 'error')
    return
  }
  confirmModalOpen.value = true
}

async function performSave() {
  saving.value = true
  const wasEditing = Boolean(editingId.value)
  try {
    const payload = {
      titel: form.value.titel,
      subtitel: form.value.subtitel || null,
      projekttext: form.value.projekttext || null,
      kategorie: form.value.kategorie,
      video_url: form.value.video_url || null,
      thumbnail_url: form.value.thumbnail_url || null
    }
    if (editingId.value) {
      await $fetch(`/api/admin/projects/${editingId.value}`, {
        method: 'PUT',
        body: payload,
        credentials: 'include'
      })
    } else {
      await $fetch('/api/admin/projects', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })
    }
    confirmModalOpen.value = false
    editModalOpen.value = false
    showToast(
      wasEditing ? 'Änderungen gespeichert.' : 'Projekt angelegt.',
      'success'
    )
    resetForm()
    await loadProjects()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string; statusMessage?: string } }
    showToast(err?.data?.message || err?.data?.statusMessage || 'Speichern fehlgeschlagen.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-modal-scroll {
  -webkit-overflow-scrolling: touch;
}

.admin-modal-enter-active,
.admin-modal-leave-active {
  transition: opacity 0.2s ease;
}
.admin-modal-enter-from,
.admin-modal-leave-to {
  opacity: 0;
}
.admin-modal-enter-active .relative,
.admin-modal-leave-active .relative {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.admin-modal-enter-from .relative,
.admin-modal-leave-to .relative {
  opacity: 0;
  transform: scale(0.98);
}
</style>
