<template>
  <div class="flex justify-end w-full">
    <div class="inline-grid grid-cols-4 gap-1.5">
      <button
        type="button"
        class="font-headline flex h-10 w-10 items-center justify-center border border-white/25 text-sm text-white/90 hover:border-white/50 disabled:opacity-30"
        :disabled="disabled || index === 0"
        aria-label="Nach oben"
        @click="emit('move', 'up')"
      >
        ↑
      </button>
      <button
        type="button"
        class="font-headline flex h-10 w-10 items-center justify-center border border-white/25 text-sm text-white/90 hover:border-white/50 disabled:opacity-30"
        :disabled="disabled || index === total - 1"
        aria-label="Nach unten"
        @click="emit('move', 'down')"
      >
        ↓
      </button>
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded border border-emerald-500/45 text-emerald-400 hover:bg-emerald-950/40 disabled:opacity-30"
        :disabled="disabled || index === 0"
        aria-label="Ganz nach oben"
        @click="emit('edge', 'top')"
      >
        ⇈
      </button>
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded border border-red-500/45 text-red-400 hover:bg-red-950/35 disabled:opacity-30"
        :disabled="disabled || index === total - 1"
        aria-label="Ganz nach unten"
        @click="emit('edge', 'bottom')"
      >
        ⇊
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  index: number
  total: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  move: ['up' | 'down']
  edge: ['top' | 'bottom']
}>()
</script>
