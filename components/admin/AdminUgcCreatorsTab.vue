<template>
  <div class="space-y-6">

    <!-- Header with "Neuen Creator anlegen" -->
    <div class="flex items-center justify-between gap-4">
      <p class="text-white/50 text-sm">
        Pflicht: Social-Link (Min. 1), Eigenschaften (Min. 2).
      </p>
      <button
        type="button"
        class="font-headline shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black text-xs font-semibold tracking-wide hover:bg-white/90 transition-colors"
        @click="openCreate"
      >
        <span class="text-base leading-none" aria-hidden="true">+</span>
        Neuen Creator anlegen
      </button>
    </div>

    <div v-if="listError" class="text-sm text-red-400">{{ listError }}</div>

    <!-- Creator list -->
    <div class="border border-white/15 divide-y divide-white/10">
      <article
        v-for="(c, idx) in items"
        :key="c.id"
        class="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <img
          v-if="c.foto_url"
          :src="c.foto_url"
          :alt="c.name"
          class="h-12 w-12 object-cover border border-white/20 shrink-0 rounded-sm"
        >
        <div v-else class="h-12 w-12 bg-white/10 border border-white/20 flex items-center justify-center text-white/40 text-xs shrink-0">—</div>

        <div class="flex-1 min-w-0">
          <p class="font-medium text-white">{{ c.name }}</p>
          <p class="text-xs text-white/40 mt-0.5">{{ c.stadt ?? '' }}</p>
          <p class="text-xs text-white/50 mt-0.5">
            {{ [c.eigenschaft_1, c.eigenschaft_2, c.eigenschaft_3].filter(Boolean).join(' · ') || 'Keine Tags' }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            class="font-headline px-4 py-2 text-xs border border-white/30 hover:border-white/60 hover:bg-white/5 transition-colors"
            @click="openEdit(c)"
          >
            Bearbeiten
          </button>
          <button
            type="button"
            class="font-headline px-4 py-2 text-xs border border-red-500/40 text-red-400 hover:border-red-400/60 hover:bg-red-950/20 transition-colors"
            @click="openDeleteModal(c)"
          >
            Löschen
          </button>
          <AdminReorderRow
            :index="idx"
            :total="items.length"
            :disabled="reordering"
            @move="(d) => move(idx, d)"
            @edge="(e) => moveEdge(idx, e)"
          />
        </div>
      </article>

      <p v-if="!items.length && !loading" class="p-6 text-center text-white/40 text-sm">
        Noch keine Creator.
      </p>
    </div>

    <!-- Create / Edit Modal -->
    <Teleport to="body">
      <Transition name="admin-ugc-modal">
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto overscroll-contain p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))]"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="editingId ? 'ugc-modal-edit-title' : 'ugc-modal-new-title'"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" @click="closeModal" />

          <div class="relative w-full max-w-3xl border border-white/20 bg-zinc-950 shadow-2xl my-auto">
            <!-- Modal header -->
            <div class="flex items-center justify-between gap-4 border-b border-white/15 px-5 py-4 sm:px-6">
              <h2
                :id="editingId ? 'ugc-modal-edit-title' : 'ugc-modal-new-title'"
                class="font-headline text-lg font-semibold text-white"
              >
                {{ editingId ? 'Creator bearbeiten' : 'Neuen Creator anlegen' }}
              </h2>
              <button
                type="button"
                class="text-white/50 hover:text-white text-2xl leading-none px-1 transition-colors"
                aria-label="Schließen"
                @click="closeModal"
              >
                ×
              </button>
            </div>

            <!-- Modal body (scrollable) -->
            <div class="overflow-y-auto max-h-[calc(100dvh-10rem)] px-5 py-5 sm:px-6 sm:py-6 space-y-6">

              <div class="grid gap-4 sm:grid-cols-2">
                <label class="block sm:col-span-2 text-sm text-white/80">
                  Name *
                  <input v-model="form.name" type="text" required class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50">
                </label>

                <label class="block text-sm text-white/80">
                  Stadt
                  <input v-model="form.stadt" type="text" placeholder="z. B. Hamburg" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50">
                </label>

                <label class="block text-sm text-white/80">
                  Geschlecht
                  <select v-model="form.geschlecht" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50">
                    <option value="" class="bg-zinc-900">— keine Angabe —</option>
                    <option value="Männlich" class="bg-zinc-900">Männlich</option>
                    <option value="Weiblich" class="bg-zinc-900">Weiblich</option>
                    <option value="Divers" class="bg-zinc-900">Divers</option>
                  </select>
                </label>

                <label class="block sm:col-span-2 text-sm text-white/80">
                  Badge-Text <span class="text-white/35 font-normal">(optional)</span>
                  <input v-model="form.badge_text" type="text" maxlength="40" placeholder="TOP CREATOR" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50">
                </label>

                <label class="block text-sm text-white/80">
                  Follower gesamt <span class="text-white/35 font-normal">(optional)</span>
                  <input v-model.number="form.follower_count" type="number" min="0" step="1000" placeholder="z. B. 150000" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50">
                </label>

                <div class="block text-sm text-white/80">
                  Login-Code <span class="text-white/35 font-normal">(Creator-Portal)</span>
                  <div class="mt-1.5 flex gap-2">
                    <input v-model="form.login_code" type="text" readonly placeholder="— noch kein Code —" class="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/20 text-white/60 placeholder:text-white/20 focus:outline-none font-mono text-xs">
                    <button type="button" class="font-headline shrink-0 px-3 py-3 border border-white/30 text-xs text-white/80 hover:bg-white/5 transition-colors" @click="generateLoginCode">Generieren</button>
                  </div>
                </div>

                <div class="sm:col-span-2">
                  <span class="text-sm text-white/80 block mb-2">Foto <span class="text-white/35">(max. 2 MB)</span></span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    class="admin-file-input text-sm w-full max-w-full"
                    @change="onPickPhoto"
                  >
                  <div v-if="form.foto_url" class="mt-3 flex flex-wrap items-center gap-4">
                    <img :src="form.foto_url" alt="" class="w-24 aspect-[3/4] object-cover border border-white/15">
                    <div class="flex flex-wrap gap-2">
                      <button type="button" class="font-headline px-3 py-2 text-xs border border-white/30 text-white/90 hover:bg-white/5 transition-colors disabled:opacity-50" :disabled="uploading" @click="recropExistingPhoto">Zuschnitt</button>
                      <button type="button" class="font-headline px-3 py-2 text-xs border border-red-500/40 text-red-400 hover:bg-red-950/20 transition-colors" @click="photoDeleteOpen = true">Entfernen</button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Social Links -->
              <div class="space-y-3">
                <p class="text-sm font-medium text-white/90">Social-Links <span class="text-white/40 font-normal">(Min. 1)</span></p>
                <p v-if="!socialEntries.length" class="text-sm text-white/40">Noch keine Links. Über „+" hinzufügen.</p>
                <div v-for="entry in socialEntries" :key="entry.id" class="border border-white/15 bg-white/[0.03] p-3 space-y-2">
                  <div class="flex flex-col sm:flex-row gap-2 sm:items-start">
                    <select v-model="entry.platform" class="sm:w-40 shrink-0 px-3 py-3 bg-white/5 border border-white/20 text-white text-sm focus:outline-none">
                      <option value="" disabled class="bg-zinc-900">Plattform</option>
                      <option v-for="p in UGC_SOCIAL_PLATFORMS" :key="p.value" :value="p.value" :disabled="isPlatformTaken(p.value, entry.id)" class="bg-zinc-900">{{ p.label }}</option>
                    </select>
                    <input v-model="entry.url" type="url" :placeholder="socialPlaceholder(entry.platform)" class="flex-1 min-w-0 px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                    <button type="button" class="shrink-0 px-3 py-3 border border-white/25 text-white/60 hover:text-white text-sm" @click="removeSocialEntry(entry.id)">×</button>
                  </div>
                  <label v-if="entry.platform === 'custom'" class="block text-sm text-white/80">
                    Bezeichnung
                    <input v-model="entry.label" type="text" placeholder="Website, Portfolio …" class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                  </label>
                </div>
                <button type="button" class="font-headline inline-flex items-center gap-2 px-4 py-2.5 border border-white/30 text-sm text-white/80 hover:bg-white/5 transition-colors disabled:opacity-40 disabled:pointer-events-none" :disabled="!canAddSocial" @click="addSocialEntry">
                  <span class="text-lg leading-none">+</span> Social hinzufügen
                </button>
              </div>

              <!-- Eigenschaften -->
              <div>
                <p class="text-sm font-medium text-white/90 mb-2">Eigenschaften <span class="text-white/40 font-normal">(Min. 2)</span></p>
                <div class="grid sm:grid-cols-3 gap-3">
                  <input v-model="form.eigenschaft_1" type="text" placeholder="Tag 1" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                  <input v-model="form.eigenschaft_2" type="text" placeholder="Tag 2" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                  <input v-model="form.eigenschaft_3" type="text" placeholder="Tag 3" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                </div>
              </div>

              <!-- No-Gos (optional, not shown on cards) -->
              <div>
                <p class="text-sm font-medium text-white/90 mb-2">No-Gos <span class="text-white/40 font-normal">(optional, intern)</span></p>
                <div class="grid sm:grid-cols-3 gap-3">
                  <input v-model="form.nogo_1" type="text" placeholder="No-Go 1" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                  <input v-model="form.nogo_2" type="text" placeholder="No-Go 2" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                  <input v-model="form.nogo_3" type="text" placeholder="No-Go 3" class="px-4 py-3 bg-white/5 border border-white/20 text-white text-sm placeholder:text-white/30 focus:outline-none">
                </div>
              </div>

            </div>

            <!-- Modal footer -->
            <div class="flex flex-wrap items-center justify-end gap-3 border-t border-white/15 px-5 py-4 sm:px-6">
              <button type="button" class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/80 hover:bg-white/5 transition-colors" @click="closeModal">Abbrechen</button>
              <button type="button" class="font-headline px-6 py-2.5 bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50" :disabled="saving" @click="save">
                {{ saving ? 'Speichern …' : editingId ? 'Aktualisieren' : 'Anlegen' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Image Crop Modal -->
    <ImageCropModal
      :open="cropOpen"
      :file="pendingFile"
      :source-url="cropSourceUrl"
      preset="ugc"
      @close="closeCrop"
      @cropped="onCropped"
      @load-error="onCropLoadError"
    />

    <AdminConfirmModal
      :open="photoDeleteOpen"
      title="Foto löschen?"
      message="Das Foto wird aus dem Formular entfernt."
      confirm-label="Ja, entfernen"
      @confirm="confirmRemovePhoto"
      @cancel="photoDeleteOpen = false"
    />

    <AdminConfirmModal
      :open="deleteModalOpen"
      :busy="deleting"
      busy-label="Löschen …"
      title="UGC Creator löschen?"
      :message="deleteConfirmMessage"
      confirm-label="Ja, löschen"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'
import ImageCropModal from '~/components/admin/ImageCropModal.vue'
import AdminReorderRow from '~/components/admin/AdminReorderRow.vue'
import type { UgcCreatorRow, UgcSocialEntry, UgcSocialPlatform } from '~/data/cms'
import { UGC_SKILL_LABELS, UGC_SOCIAL_PLATFORMS, socialEntriesToUgcFields, socialPlaceholder, ugcRowToSocialEntries } from '~/data/cms'

const emit = defineEmits<{ toast: [message: string, variant: 'success' | 'error'] }>()

type FormState = {
  name: string; stadt: string; geschlecht: string; foto_url: string; badge_text: string
  follower_count: number | null; login_code: string
  eigenschaft_1: string; eigenschaft_2: string; eigenschaft_3: string
  skill_bildpraesenz: number; skill_retorik: number; skill_hook: number; skill_reichweite: number
  nogo_1: string; nogo_2: string; nogo_3: string
}

const emptyForm = (): FormState => ({
  name: '', stadt: '', geschlecht: '', foto_url: '', badge_text: '',
  follower_count: null, login_code: '',
  eigenschaft_1: '', eigenschaft_2: '', eigenschaft_3: '',
  skill_bildpraesenz: 3, skill_retorik: 3, skill_hook: 3, skill_reichweite: 3,
  nogo_1: '', nogo_2: '', nogo_3: ''
})

const items = ref<UgcCreatorRow[]>([])
const loading = ref(false)
const listError = ref('')
const reordering = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editingId = ref<string | null>(null)
const modalOpen = ref(false)
const cropOpen = ref(false)
const pendingFile = ref<File | null>(null)
const cropSourceUrl = ref<string | null>(null)
const photoDeleteOpen = ref(false)
const deleteModalOpen = ref(false)
const pendingDelete = ref<UgcCreatorRow | null>(null)
const deleting = ref(false)
const form = ref<FormState>(emptyForm())
const socialEntries = ref<UgcSocialEntry[]>([])

const canAddSocial = computed(() => socialEntries.value.length < UGC_SOCIAL_PLATFORMS.length)
const deleteConfirmMessage = computed(() => {
  const c = pendingDelete.value
  return c ? `Bist du sicher, dass du „${c.name}" unwiderruflich löschen möchtest?` : ''
})

// Lock body scroll when modal is open
watch(modalOpen, (open) => {
  if (!import.meta.client) return
  document.body.style.overflow = open ? 'hidden' : ''
})
onUnmounted(() => { if (import.meta.client) document.body.style.overflow = '' })

function openCreate() {
  editingId.value = null
  form.value = emptyForm()
  socialEntries.value = []
  modalOpen.value = true
}

function openEdit(c: UgcCreatorRow) {
  editingId.value = c.id
  socialEntries.value = ugcRowToSocialEntries(c)
  form.value = {
    name: c.name, stadt: c.stadt ?? '', geschlecht: c.geschlecht ?? '', foto_url: c.foto_url ?? '', badge_text: c.badge_text ?? '',
    follower_count: c.follower_count ?? null, login_code: c.login_code ?? '',
    eigenschaft_1: c.eigenschaft_1 ?? '', eigenschaft_2: c.eigenschaft_2 ?? '', eigenschaft_3: c.eigenschaft_3 ?? '',
    skill_bildpraesenz: c.skill_bildpraesenz, skill_retorik: c.skill_retorik,
    skill_hook: c.skill_hook, skill_reichweite: c.skill_reichweite,
    nogo_1: c.nogo_1 ?? '', nogo_2: c.nogo_2 ?? '', nogo_3: c.nogo_3 ?? ''
  }
  modalOpen.value = true
}

function generateLoginCode() {
  form.value.login_code = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function closeModal() {
  modalOpen.value = false
  editingId.value = null
  form.value = emptyForm()
  socialEntries.value = []
}

function isPlatformTaken(platform: UgcSocialPlatform, entryId: string): boolean {
  return socialEntries.value.some((e) => e.id !== entryId && e.platform === platform)
}

function firstAvailablePlatform(): UgcSocialPlatform | '' {
  const used = new Set(socialEntries.value.map((e) => e.platform).filter(Boolean) as UgcSocialPlatform[])
  return UGC_SOCIAL_PLATFORMS.find((p) => !used.has(p.value))?.value ?? ''
}

function addSocialEntry() {
  const platform = firstAvailablePlatform()
  if (!platform) return
  socialEntries.value.push({
    id: crypto.randomUUID?.() ?? `social-${Date.now()}`,
    platform, url: '', label: ''
  })
}

function removeSocialEntry(id: string) {
  socialEntries.value = socialEntries.value.filter((e) => e.id !== id)
}

function validateForm(): string | null {
  const used = new Set<UgcSocialPlatform>()
  for (const e of socialEntries.value) {
    if (!e.platform) { if (e.url.trim()) return 'Bitte Plattform auswählen.'; continue }
    if (used.has(e.platform)) return 'Jede Plattform nur einmal.'
    used.add(e.platform)
    if (!e.url.trim()) return `URL für ${e.platform} fehlt.`
    if (e.platform === 'custom' && !e.label.trim()) return 'Bezeichnung für Custom-Link fehlt.'
  }
  const validSocials = socialEntries.value.filter((e) => e.platform && e.url.trim()).length
  if (validSocials < 1) return 'Mindestens ein Social-Link erforderlich.'
  const f = form.value
  const tags = [f.eigenschaft_1, f.eigenschaft_2, f.eigenschaft_3].filter((v) => v.trim()).length
  if (tags < 2) return 'Mindestens zwei Eigenschaften erforderlich.'
  return null
}

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])

function apiError(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string; statusMessage?: string } }
  return err?.data?.message || err?.data?.statusMessage || fallback
}

async function load() {
  loading.value = true; listError.value = ''
  try { items.value = await $fetch<UgcCreatorRow[]>('/api/admin/ugc-creators', { credentials: 'include' }) }
  catch (e: unknown) { listError.value = apiError(e, 'Liste konnte nicht geladen werden.'); items.value = [] }
  finally { loading.value = false }
}
onMounted(load)

function confirmRemovePhoto() { form.value.foto_url = ''; photoDeleteOpen.value = false; emit('toast', 'Foto entfernt.', 'success') }

function onPickPhoto(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0];
  (ev.target as HTMLInputElement).value = ''
  if (!file) return
  if (!allowedMime.has(file.type)) { emit('toast', 'Nur JPEG, PNG, WebP, GIF, AVIF.', 'error'); return }
  if (file.size > 2 * 1024 * 1024) { emit('toast', 'Maximal 2 MB.', 'error'); return }
  openCrop(file)
}

function recropExistingPhoto() { const url = form.value.foto_url?.trim(); if (url) openCrop(null, url) }
function openCrop(file: File | null, sourceUrl: string | null = null) { pendingFile.value = file; cropSourceUrl.value = sourceUrl; cropOpen.value = true }
function closeCrop() { cropOpen.value = false; pendingFile.value = null; cropSourceUrl.value = null }
function onCropLoadError() { emit('toast', 'Foto konnte nicht geladen werden.', 'error') }

async function onCropped(blob: Blob) {
  closeCrop(); uploading.value = true
  try {
    const fd = new FormData(); fd.append('file', blob, 'ugc-creator.jpg')
    const res = await $fetch<{ url: string }>('/api/admin/upload?purpose=ugc', { method: 'POST', body: fd, credentials: 'include' })
    form.value.foto_url = res.url; emit('toast', 'Foto gespeichert.', 'success')
  } catch (e: unknown) { emit('toast', apiError(e, 'Upload fehlgeschlagen.'), 'error') }
  finally { uploading.value = false }
}

async function save() {
  if (!form.value.name.trim()) { emit('toast', 'Name ist erforderlich.', 'error'); return }
  const err = validateForm(); if (err) { emit('toast', err, 'error'); return }
  saving.value = true
  try {
    const payload = {
      name: form.value.name.trim(), stadt: form.value.stadt.trim() || null,
      geschlecht: form.value.geschlecht.trim() || null,
      foto_url: form.value.foto_url || null, badge_text: form.value.badge_text.trim() || null,
      follower_count: typeof form.value.follower_count === 'number' && form.value.follower_count >= 0 ? form.value.follower_count : null,
      login_code: form.value.login_code.trim() || null,
      ...socialEntriesToUgcFields(socialEntries.value),
      eigenschaft_1: form.value.eigenschaft_1 || null, eigenschaft_2: form.value.eigenschaft_2 || null, eigenschaft_3: form.value.eigenschaft_3 || null,
      skill_bildpraesenz: form.value.skill_bildpraesenz, skill_retorik: form.value.skill_retorik,
      skill_hook: form.value.skill_hook, skill_reichweite: form.value.skill_reichweite,
      nogo_1: form.value.nogo_1 || null, nogo_2: form.value.nogo_2 || null, nogo_3: form.value.nogo_3 || null
    }
    if (editingId.value) {
      await $fetch(`/api/admin/ugc-creators/${editingId.value}`, { method: 'PUT', body: payload, credentials: 'include' })
      emit('toast', 'Creator aktualisiert.', 'success')
    } else {
      await $fetch('/api/admin/ugc-creators', { method: 'POST', body: payload, credentials: 'include' })
      emit('toast', 'Creator angelegt.', 'success')
    }
    closeModal(); await load()
  } catch (e: unknown) { emit('toast', apiError(e, 'Speichern fehlgeschlagen.'), 'error') }
  finally { saving.value = false }
}

function openDeleteModal(c: UgcCreatorRow) { pendingDelete.value = c; deleteModalOpen.value = true }
function closeDeleteModal() { if (deleting.value) return; deleteModalOpen.value = false; pendingDelete.value = null }

async function confirmDelete() {
  const c = pendingDelete.value; if (!c || deleting.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/ugc-creators/${c.id}`, { method: 'DELETE', credentials: 'include' })
    deleteModalOpen.value = false; pendingDelete.value = null
    emit('toast', `„${c.name}" wurde gelöscht.`, 'success'); await load()
  } catch (e: unknown) { emit('toast', apiError(e, 'Löschen fehlgeschlagen.'), 'error') }
  finally { deleting.value = false }
}

async function persistReorder(arr: UgcCreatorRow[]) {
  reordering.value = true
  try {
    await $fetch('/api/admin/ugc-creators/reorder', { method: 'POST', body: { ids: arr.map((x) => x.id) }, credentials: 'include' })
    items.value = arr; emit('toast', 'Reihenfolge gespeichert.', 'success')
  } catch (e: unknown) { emit('toast', apiError(e, 'Reihenfolge fehlgeschlagen.'), 'error'); await load() }
  finally { reordering.value = false }
}

async function move(index: number, direction: 'up' | 'down') {
  const next = direction === 'up' ? index - 1 : index + 1
  if (next < 0 || next >= items.value.length) return
  const arr = items.value.slice();[arr[index], arr[next]] = [arr[next]!, arr[index]!]
  await persistReorder(arr)
}

async function moveEdge(index: number, edge: 'top' | 'bottom') {
  const arr = items.value.slice(); const [row] = arr.splice(index, 1); if (!row) return
  if (edge === 'top') arr.unshift(row); else arr.push(row)
  await persistReorder(arr)
}
</script>

<style scoped>
.admin-ugc-modal-enter-active, .admin-ugc-modal-leave-active { transition: opacity 0.2s ease; }
.admin-ugc-modal-enter-from, .admin-ugc-modal-leave-to { opacity: 0; }
.admin-ugc-modal-enter-active .relative, .admin-ugc-modal-leave-active .relative { transition: transform 0.2s ease, opacity 0.2s ease; }
.admin-ugc-modal-enter-from .relative, .admin-ugc-modal-leave-to .relative { opacity: 0; transform: translateY(8px); }
</style>
