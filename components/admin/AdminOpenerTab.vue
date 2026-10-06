<template>
  <div class="space-y-10">
    <p class="text-white/60 text-sm">
      Hintergrundvideo im Hero. Entweder eine <strong class="text-white/80">MP4-Datei</strong> direkt hochladen
      oder einen <strong class="text-white/80">Vimeo- / YouTube-Link</strong> angeben.
    </p>

    <div v-if="loadError" class="text-sm text-red-400">
      {{ loadError }}
    </div>

    <div class="border border-white/15 p-6 space-y-4">
      <h2 class="font-headline text-xl font-semibold">
        Aktueller Opener
      </h2>
      <div v-if="loading" class="text-white/50 text-sm">
        Wird geladen …
      </div>
      <template v-else>
        <p v-if="current?.video_url" class="font-sans text-sm text-white/85 break-all">
          {{ current.video_url }}
        </p>
        <p v-else class="text-white/50 text-sm">
          Noch kein Video — Standard-Vimeo wird auf der Startseite genutzt.
        </p>
        <p v-if="current?.provider" class="text-xs uppercase tracking-widest text-white/45">
          {{ current.provider === 'vimeo' ? 'Vimeo' : current.provider === 'youtube' ? 'YouTube' : 'Datei (Vercel Blob)' }}
        </p>
      </template>
    </div>

    <div class="border border-white/15 p-6 space-y-4">
      <h2 class="font-headline text-xl font-semibold">
        Video-Datei hochladen
      </h2>
      <p class="text-xs text-white/45 leading-relaxed">
        MP4, WebM oder MOV — wird direkt im Hero abgespielt (kein externer Anbieter, kein Autoplay-Problem).
      </p>
      <label class="block text-sm text-white/80">
        Datei auswählen
        <input
          ref="fileInput"
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          class="mt-1.5 w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-white/10 file:text-white file:text-xs file:uppercase file:tracking-widest file:cursor-pointer hover:file:bg-white/20"
          :disabled="uploading"
          @change="onFileChange"
        >
      </label>
      <div v-if="selectedFile" class="text-xs text-white/55">
        {{ selectedFile.name }} · {{ (selectedFile.size / 1024 / 1024).toFixed(1) }} MB
      </div>
      <p v-if="uploadError" class="text-sm text-red-400">{{ uploadError }}</p>
      <button
        type="button"
        class="font-headline px-6 py-3 bg-white text-black font-semibold text-sm hover:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="uploading || !selectedFile"
        @click="uploadFile"
      >
        {{ uploading ? `Hochladen … ${uploadProgress}%` : 'Datei hochladen & setzen' }}
      </button>
    </div>

    <div class="border border-white/15 p-6 space-y-4">
      <h2 class="font-headline text-xl font-semibold">
        Neuen Link setzen
      </h2>
      <label class="block text-sm text-white/80">
        Vimeo- oder YouTube-URL
        <input
          v-model="form.videoUrl"
          type="url"
          placeholder="https://vimeo.com/… oder https://www.youtube.com/watch?v=…"
          class="mt-1.5 w-full px-4 py-3 bg-white/5 border border-white/20 text-white"
          :disabled="saving || confirmOpen"
        >
      </label>
      <p class="text-xs text-white/45 leading-relaxed">
        Beispiele: <span class="text-white/55">https://vimeo.com/1178774007</span>,
        <span class="text-white/55">https://youtu.be/…</span>,
        <span class="text-white/55">https://www.youtube.com/watch?v=…</span>
      </p>
      <p v-if="formError" class="text-sm text-red-400">
        {{ formError }}
      </p>
      <button
        type="button"
        class="font-headline px-6 py-3 bg-white text-black font-semibold text-sm hover:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="saving || previewLoading || confirmOpen || !form.videoUrl.trim()"
        @click="requestSave"
      >
        {{ previewLoading ? 'Wird geprüft …' : 'Opener speichern' }}
      </button>
    </div>

    <Teleport to="body">
      <Transition name="admin-modal">
        <div
          v-if="confirmOpen"
          class="fixed inset-0 z-[270] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="opener-confirm-title"
        >
          <div
            class="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-hidden="true"
            @click="!saving && !previewLoading && closeConfirm()"
          />
          <div class="relative w-full max-w-lg border border-white/20 bg-zinc-950 px-6 py-8 shadow-2xl max-h-[min(92dvh,40rem)] overflow-y-auto">
            <h3 id="opener-confirm-title" class="font-headline text-lg font-semibold text-white mb-2">
              Link ändern?
            </h3>
            <p class="text-white/70 text-sm leading-relaxed mb-4">
              Bist du sicher, dass du den Hero-Opener-Link ändern willst?
            </p>
            <p class="text-xs text-white/50 break-all mb-4 font-mono">
              {{ pendingUrl }}
            </p>

            <div class="mb-6 border border-white/10 bg-black/40 p-3">
              <p class="text-xs uppercase tracking-widest text-white/45 mb-3">
                Vorschau (Thumbnail)
              </p>
              <div v-if="previewLoading" class="text-white/50 text-sm py-8 text-center">
                Thumbnail wird geladen …
              </div>
              <template v-else-if="preview?.thumbnailUrl && !thumbnailLoadFailed">
                <img
                  :src="preview.thumbnailUrl"
                  alt="Video-Vorschau"
                  class="w-full max-h-48 object-cover border border-white/10"
                  @load="thumbnailLoaded = true"
                  @error="thumbnailLoadFailed = true"
                >
                <p v-if="thumbnailLoaded" class="text-xs text-emerald-400/90 mt-2">
                  Thumbnail geladen — der Link scheint erreichbar zu sein.
                </p>
              </template>
              <p v-else class="text-sm text-amber-200/85 leading-relaxed">
                {{
                  preview?.thumbnailUrl && thumbnailLoadFailed
                    ? 'Thumbnail konnte im Browser nicht angezeigt werden. Du kannst trotzdem speichern, wenn der Link stimmt.'
                    : 'Kein Thumbnail verfügbar (z. B. bei privaten Videos). Du kannst trotzdem speichern, wenn der Link öffentlich ist.'
                }}
              </p>
            </div>

            <div class="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/90 hover:border-white/55 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving || previewLoading"
                @click="closeConfirm"
              >
                Abbrechen
              </button>
              <button
                type="button"
                class="font-headline px-5 py-2.5 bg-white text-black font-semibold text-sm hover:bg-white/95 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="saving || previewLoading"
                @click="confirmSave"
              >
                {{ saving ? 'Speichern …' : previewLoading ? 'Lädt …' : 'Ja, Link speichern' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { HeroOpenerRow } from '~/data/cms'

type OpenerPreview = {
  videoUrl: string
  provider: 'vimeo' | 'youtube'
  videoId: string
  embedSrc: string
  thumbnailUrl: string | null
}

const emit = defineEmits<{
  toast: [message: string, variant: 'success' | 'error']
}>()

const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const formError = ref('')
const current = ref<HeroOpenerRow | null>(null)
const form = reactive({ videoUrl: '' })

const confirmOpen = ref(false)
const pendingUrl = ref('')
const previewLoading = ref(false)
const preview = ref<OpenerPreview | null>(null)
const thumbnailLoaded = ref(false)
const thumbnailLoadFailed = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  uploadError.value = ''
}

async function uploadFile() {
  if (!selectedFile.value || uploading.value) return
  uploadError.value = ''
  uploading.value = true
  uploadProgress.value = 0

  try {
    const { upload } = await import('@vercel/blob/client')
    const blob = await upload(
      `hero-opener/${selectedFile.value.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      selectedFile.value,
      {
        access: 'public',
        handleUploadUrl: '/api/admin/hero-opener/upload',
        allowOverwrite: true,
        onUploadProgress: ({ percentage }) => {
          uploadProgress.value = Math.round(percentage)
        },
      }
    )

    const saved = await $fetch<HeroOpenerRow>('/api/admin/hero-opener/set-blob', {
      method: 'POST',
      body: { url: blob.url }
    })
    current.value = saved
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    emit('toast', 'Video hochgeladen und gesetzt.', 'success')
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Upload fehlgeschlagen.'
    uploadError.value = msg
    emit('toast', msg, 'error')
  } finally {
    uploading.value = false
  }
}

function apiError(e: unknown, fallback: string): string {
  if (e && typeof e === 'object' && 'data' in e && e.data && typeof e.data === 'object' && 'message' in e.data) {
    return String((e.data as { message: string }).message)
  }
  if (e instanceof Error) return e.message
  return fallback
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    current.value = await $fetch<HeroOpenerRow | null>('/api/admin/hero-opener')
  } catch (e: unknown) {
    loadError.value = apiError(e, 'Opener konnte nicht geladen werden.')
  } finally {
    loading.value = false
  }
}

function resetConfirmState() {
  confirmOpen.value = false
  pendingUrl.value = ''
  preview.value = null
  previewLoading.value = false
  thumbnailLoaded.value = false
  thumbnailLoadFailed.value = false
}

function closeConfirm() {
  if (saving.value) return
  resetConfirmState()
}

async function requestSave() {
  formError.value = ''
  const url = form.videoUrl.trim()
  if (!url) return

  pendingUrl.value = url
  confirmOpen.value = true
  previewLoading.value = true
  preview.value = null
  thumbnailLoaded.value = false
  thumbnailLoadFailed.value = false

  try {
    preview.value = await $fetch<OpenerPreview>('/api/admin/hero-opener/preview', {
      query: { url }
    })
  } catch (e: unknown) {
    formError.value = apiError(e, 'Ungültiger Link.')
    closeConfirm()
  } finally {
    previewLoading.value = false
  }
}

async function confirmSave() {
  if (!pendingUrl.value || saving.value || previewLoading.value) return
  formError.value = ''
  saving.value = true
  try {
    const row = await $fetch<HeroOpenerRow>('/api/admin/hero-opener', {
      method: 'PUT',
      body: { video_url: pendingUrl.value }
    })
    current.value = row
    form.videoUrl = ''
    resetConfirmState()
    emit('toast', 'Hero-Opener gespeichert.', 'success')
  } catch (e: unknown) {
    const msg = apiError(e, 'Speichern fehlgeschlagen.')
    formError.value = msg
    emit('toast', msg, 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.admin-modal-enter-active,
.admin-modal-leave-active {
  transition: opacity 0.2s ease;
}
.admin-modal-enter-from,
.admin-modal-leave-to {
  opacity: 0;
}
</style>
