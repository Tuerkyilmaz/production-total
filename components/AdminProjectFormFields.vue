<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="block sm:col-span-2">
      <span class="text-sm font-medium text-zinc-100">Titel</span>
      <input
        v-model="model.titel"
        type="text"
        class="mt-1.5 w-full px-4 py-3 text-zinc-50 placeholder:text-zinc-500 bg-white/[0.07] border border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
    </label>
    <label class="block sm:col-span-2">
      <span class="text-sm font-medium text-zinc-100">Untertitel</span>
      <input
        v-model="model.subtitel"
        type="text"
        class="mt-1.5 w-full px-4 py-3 text-zinc-50 placeholder:text-zinc-500 bg-white/[0.07] border border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
    </label>
    <label class="block sm:col-span-2">
      <span class="text-sm font-medium text-zinc-100">Projekttext</span>
      <textarea
        v-model="model.projekttext"
        rows="5"
        class="mt-1.5 w-full px-4 py-3 text-zinc-50 placeholder:text-zinc-500 bg-white/[0.07] border border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 whitespace-pre-wrap"
      />
    </label>
    <label class="block">
      <span class="text-sm font-medium text-zinc-100">Kategorie</span>
      <select
        v-model="model.kategorie"
        class="mt-1.5 w-full px-4 py-3 bg-white/[0.07] border border-white/25 text-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <option v-for="opt in kategorieOptions" :key="opt.value" :value="opt.value" class="bg-zinc-900 text-zinc-50">
          {{ opt.label }}
        </option>
      </select>
    </label>
    <label class="block sm:col-span-2">
      <span class="text-sm font-medium text-zinc-100">Vimeo- oder YouTube-URL</span>
      <input
        v-model="model.video_url"
        type="url"
        placeholder="https://…"
        class="mt-1.5 w-full px-4 py-3 text-zinc-50 placeholder:text-zinc-500 bg-white/[0.07] border border-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
    </label>
    <div class="sm:col-span-2">
      <span class="text-sm font-medium text-zinc-100 block mb-2">Thumbnail · nur Upload, max. 2&nbsp;MB</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        class="admin-file-input text-sm w-full max-w-full"
        @change="emit('fileChange', $event)"
      >
      <p v-if="uploading" class="text-xs text-zinc-300 mt-2">
        Upload läuft …
      </p>
      <div v-else-if="model.thumbnail_url" class="mt-3 flex flex-wrap items-center gap-4">
        <img
          :src="model.thumbnail_url"
          alt="Thumbnail-Vorschau"
          class="max-h-32 w-auto object-contain border border-white/20 bg-white/5"
        >
        <button
          type="button"
          class="font-headline px-4 py-2 text-xs border border-red-500/40 text-red-400 hover:bg-red-950/30 hover:border-red-400/60 transition-colors"
          @click="photoDeleteOpen = true"
        >
          Foto entfernen
        </button>
      </div>
    </div>

    <AdminConfirmModal
      :open="photoDeleteOpen"
      title="Foto löschen?"
      message="Das Thumbnail wird aus dem Formular entfernt."
      confirm-label="Ja, Foto löschen"
      @confirm="confirmRemovePhoto"
      @cancel="photoDeleteOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import AdminConfirmModal from '~/components/admin/AdminConfirmModal.vue'

const photoDeleteOpen = ref(false)

function confirmRemovePhoto() {
  model.value.thumbnail_url = ''
  photoDeleteOpen.value = false
}
type ProjektKategorie = 'social_media' | 'youtube' | 'imagefilm' | 'event'

type FormShape = {
  titel: string
  subtitel: string
  projekttext: string
  kategorie: ProjektKategorie
  video_url: string
  thumbnail_url: string
}

defineProps<{
  uploading: boolean
}>()

const emit = defineEmits<{
  fileChange: [ev: Event]
}>()

const model = defineModel<FormShape>({ required: true })

const kategorieOptions: { value: ProjektKategorie; label: string }[] = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'imagefilm', label: 'Imagefilm' },
  { value: 'event', label: 'Event' }
]
</script>
