<template>
  <Teleport to="body">
    <Transition name="admin-modal">
      <div
        v-if="open"
        class="fixed inset-0 z-[270] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
      >
        <div
          class="absolute inset-0 bg-black/80 backdrop-blur-sm"
          aria-hidden="true"
          @click="!busy && emit('cancel')"
        />
        <div class="relative w-full max-w-md border border-white/20 bg-zinc-950 px-6 py-8 shadow-2xl">
          <h3 :id="titleId" class="font-headline text-lg font-semibold text-white mb-2">
            {{ title }}
          </h3>
          <p class="text-white/70 text-sm leading-relaxed mb-8">
            {{ message }}
          </p>
          <div class="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              class="font-headline px-5 py-2.5 border border-white/30 text-sm text-white/90 hover:border-white/55 hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="busy"
              @click="emit('cancel')"
            >
              Abbrechen
            </button>
            <button
              type="button"
              class="font-headline px-5 py-2.5 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="variant === 'danger'
                ? 'border border-red-500/50 bg-red-950/50 text-red-100 hover:bg-red-950/80 hover:border-red-400/60'
                : 'bg-white text-black hover:bg-white/95'"
              :disabled="busy"
              @click="emit('confirm')"
            >
              {{ busy ? busyLabel : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    title: string
    message: string
    confirmLabel: string
    busyLabel?: string
    busy?: boolean
    variant?: 'danger' | 'default'
  }>(),
  { variant: 'danger', busy: false, busyLabel: 'Bitte warten …' }
)

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const titleId = useId()
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
