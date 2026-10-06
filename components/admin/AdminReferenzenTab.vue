<template>
  <div class="space-y-10">
    <p class="text-white/60 text-sm">
      Partner-Logos für den Slider unter dem Hero. Format 3:1 (600×200), Upload mit Zuschnitt, optional Partner-Link (öffnet in neuem Tab).
    </p>

    <div v-if="listError" class="text-sm text-red-400">
      {{ listError }}
    </div>

    <div class="border border-white/15 divide-y divide-white/10">
      <article
        v-for="(r, idx) in items"
        :key="r.id"
        class="p-4 flex flex-col sm:flex-row sm:items-center gap-4"
      >
        <img
          :src="r.logo_url"
          :alt="r.name"
          class="h-12 w-36 object-contain bg-white/5 border border-white/10 shrink-0"
        >
        <div class="flex-1 min-w-0">
          <p class="font-medium text-white truncate">
            {{ r.name }}
          </p>
          <p v-if="r.href" class="text-xs text-white/55 truncate mt-1">
            {{ r.href }}
          </p>
        </div>
        <div class="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto">
          <div class="flex flex-wrap gap-2 justify-end">
            <button
              type="button"
              class="font-headline px-4 py-2 text-xs border border-white/30"
              @click="startEdit(r)"
            >
              Bearbeiten
            </button>
            <button
              type="button"
              class="font-headline px-4 py-2 text-xs border border-red-500/40 text-red-400"
              @click="openDeleteModal(r)"
            >
              Löschen
            </button>
          </div>
          <AdminReorderRow
            :index="idx"
            :total="items.length"
            :disabled="reordering"
            @move="(d) => move(idx, d)"
            @edge="(e) => moveEdge(idx, e)"
          />
        </div>
      </article>
      <p v-if="!items.length && !loading" class="p-6 text-center text-white/50 text-sm">
        Noch keine Referenzen. Unten anlegen.
      </p>
    </div>

    <div class="border border-white/15 p-6 space-y-4">
      <h2 class="font-headline text-xl font-semibold">
        {{ editingId ? 'Referenz bearbeiten' : 'Neue Referenz' }}
      </h2>
      <label class="block text-sm text-white/80">
        Bezeichnung (für Alt-Text)
        <input
          v-model="form.name"
          type="text"
          class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white"
        >
      </label>
      <label class="block text-sm text-white/80">
        Partner-Link (optional)
        <input
          v-model="form.href"
          type="url"
          placeholder="https://…"
          class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white"
        >
      </label>
      <div>
        <span class="text-sm text-white/80 block mb-2">Logo · nur Upload (3:1, max. 5&nbsp;MB)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          class="admin-file-input text-sm w-full max-w-full"
          @change="onPickFile"
        >
        <div v-if="form.logo_url" class="mt-3 flex flex-wrap items-center gap-4">
          <img
            :src="form.logo_url"
            alt="Vorschau"
            class="h-14 max-w-xs object-contain border border-white/15 bg-white/5"
          >
          <button
            type="button"
            class="font-headline px-4 py-2 text-xs border border-red-500/40 text-red-400 hover:bg-red-950/30 hover:border-red-400/60 transition-colors"
            @click="logoDeleteOpen = true"
          >
            Logo entfernen
          </button>
        </div>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="font-headline px-6 py-3 bg-white text-black font-semibold text-sm disabled:opacity-50"
          :disabled="saving || !form.logo_url"
          @click="save"
        >
          {{ saving ? 'Speichern …' : editingId ? 'Aktualisieren' : 'Anlegen' }}
        </button>
        <button
          v-if="editingId"
          type="button"
          class="font-headline px-4 py-3 border border-white/30 text-sm"
          @click="resetForm"
        >
          Abbrechen
        </button>
      </div>
    </div>

    <ImageCropModal
      :open="cropOpen"
      :file="pendingFile"
      @close="closeCrop"
      @cropped="onCropped"
    />

    <AdminConfirmModal
      :open="logoDeleteOpen"
      title="Logo löschen?"
      message="Das hochgeladene Logo wird entfernt. Zum Speichern ist ein neues Logo erforderlich."
      confirm-label="Ja, Logo löschen"
      @confirm="confirmRemoveLogo"
      @cancel="logoDeleteOpen = false"
    />

    <AdminConfirmModal
      :open="deleteModalOpen"
      :busy="deleting"
      busy-label="Löschen …"
      title="Referenz löschen?"
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
import type { ReferenzRow } from '~/data/cms'

const emit = defineEmits<{
  toast: [message: string, variant: 'success' | 'error']
}>()

const items = ref<ReferenzRow[]>([])
const loading = ref(false)
const listError = ref('')
const reordering = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editingId = ref<string | null>(null)
const cropOpen = ref(false)
const logoDeleteOpen = ref(false)
const deleteModalOpen = ref(false)
const pendingDelete = ref<ReferenzRow | null>(null)
const deleting = ref(false)
const pendingFile = ref<File | null>(null)

const deleteConfirmMessage = computed(() => {
  const r = pendingDelete.value
  if (!r) return ''
  const label = r.name.trim() || 'Referenz'
  return `Bist du sicher, dass du „${label}“ unwiderruflich löschen möchtest? Dieser Vorgang kann nicht rückgängig gemacht werden.`
})

function confirmRemoveLogo() {
  form.value.logo_url = ''
  logoDeleteOpen.value = false
  emit('toast', 'Logo entfernt.', 'success')
}

const form = ref({ name: '', href: '', logo_url: '' })

const allowedMime = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
const MAX_BYTES = 5 * 1024 * 1024

function apiError(e: unknown, fallback: string) {
  const err = e as { data?: { message?: string; statusMessage?: string } }
  return err?.data?.message || err?.data?.statusMessage || fallback
}

async function load() {
  loading.value = true
  listError.value = ''
  try {
    items.value = await $fetch<ReferenzRow[]>('/api/admin/referenzen', { credentials: 'include' })
  } catch (e: unknown) {
    listError.value = apiError(e, 'Liste konnte nicht geladen werden.')
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)

function resetForm() {
  editingId.value = null
  form.value = { name: '', href: '', logo_url: '' }
}

function startEdit(r: ReferenzRow) {
  editingId.value = r.id
  form.value = {
    name: r.name,
    href: r.href ?? '',
    logo_url: r.logo_url
  }
}

function onPickFile(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  ;(ev.target as HTMLInputElement).value = ''
  if (!file) return
  if (!file.type || !allowedMime.has(file.type)) {
    emit('toast', 'Nur Bilder (JPEG, PNG, WebP, GIF, AVIF).', 'error')
    return
  }
  if (file.size > MAX_BYTES) {
    emit('toast', 'Datei zu groß — maximal 5 MB.', 'error')
    return
  }
  pendingFile.value = file
  cropOpen.value = true
}

function closeCrop() {
  cropOpen.value = false
  pendingFile.value = null
}

async function onCropped(blob: Blob) {
  closeCrop()
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', blob, 'referenz.png')
    const res = await $fetch<{ url: string }>('/api/admin/upload?purpose=referenz', {
      method: 'POST',
      body: fd,
      credentials: 'include'
    })
    form.value.logo_url = res.url
    emit('toast', 'Logo hochgeladen.', 'success')
  } catch (e: unknown) {
    emit('toast', apiError(e, 'Upload fehlgeschlagen.'), 'error')
  } finally {
    uploading.value = false
  }
}

async function save() {
  if (!form.value.logo_url) {
    emit('toast', 'Bitte zuerst ein Logo hochladen.', 'error')
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.value.name,
      href: form.value.href.trim() || null,
      logo_url: form.value.logo_url
    }
    if (editingId.value) {
      await $fetch(`/api/admin/referenzen/${editingId.value}`, {
        method: 'PUT',
        body: payload,
        credentials: 'include'
      })
      emit('toast', 'Referenz aktualisiert.', 'success')
    } else {
      await $fetch('/api/admin/referenzen', {
        method: 'POST',
        body: payload,
        credentials: 'include'
      })
      emit('toast', 'Referenz angelegt.', 'success')
    }
    resetForm()
    await load()
  } catch (e: unknown) {
    emit('toast', apiError(e, 'Speichern fehlgeschlagen.'), 'error')
  } finally {
    saving.value = false
  }
}

function openDeleteModal(r: ReferenzRow) {
  pendingDelete.value = r
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

async function confirmDelete() {
  const r = pendingDelete.value
  if (!r || deleting.value) return
  deleting.value = true
  try {
    await $fetch(`/api/admin/referenzen/${r.id}`, { method: 'DELETE', credentials: 'include' })
    if (editingId.value === r.id) resetForm()
    resetDeleteState()
    const label = r.name.trim() || 'Referenz'
    emit('toast', `„${label}" wurde gelöscht.`, 'success')
    await load()
  } catch (e: unknown) {
    emit('toast', apiError(e, 'Löschen fehlgeschlagen.'), 'error')
  } finally {
    deleting.value = false
  }
}

async function persistReorder(arr: ReferenzRow[]) {
  reordering.value = true
  try {
    await $fetch('/api/admin/referenzen/reorder', {
      method: 'POST',
      body: { ids: arr.map((x) => x.id) },
      credentials: 'include'
    })
    items.value = arr
    emit('toast', 'Reihenfolge gespeichert.', 'success')
  } catch (e: unknown) {
    emit('toast', apiError(e, 'Reihenfolge konnte nicht gespeichert werden.'), 'error')
    await load()
  } finally {
    reordering.value = false
  }
}

async function move(index: number, direction: 'up' | 'down') {
  const next = direction === 'up' ? index - 1 : index + 1
  if (next < 0 || next >= items.value.length) return
  const arr = items.value.slice()
  ;[arr[index], arr[next]] = [arr[next]!, arr[index]!]
  await persistReorder(arr)
}

async function moveEdge(index: number, edge: 'top' | 'bottom') {
  const arr = items.value.slice()
  const [row] = arr.splice(index, 1)
  if (!row) return
  if (edge === 'top') arr.unshift(row)
  else arr.push(row)
  await persistReorder(arr)
}
</script>
