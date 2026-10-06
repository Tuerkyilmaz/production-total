<template>
  <svg
    class="shrink-0"
    :class="sizeClass"
    viewBox="0 0 24 24"
    aria-hidden="true"
    fill="currentColor"
  >
    <!-- Instagram: real gradient (purple → pink → orange) -->
    <template v-if="platform === 'instagram'">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#f09433"/>
          <stop offset="30%"  stop-color="#e6683c"/>
          <stop offset="55%"  stop-color="#dc2743"/>
          <stop offset="75%"  stop-color="#cc2366"/>
          <stop offset="100%" stop-color="#bc1888"/>
        </linearGradient>
      </defs>
      <path fill="url(#ig-grad)" d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.9A3.85 3.85 0 0 0 3.9 7.75v8.5a3.85 3.85 0 0 0 3.85 3.85h8.5a3.85 3.85 0 0 0 3.85-3.85v-8.5a3.85 3.85 0 0 0-3.85-3.85h-8.5ZM12 7.15a4.85 4.85 0 1 1 0 9.7 4.85 4.85 0 0 1 0-9.7Zm0 1.9a2.95 2.95 0 1 0 0 5.9 2.95 2.95 0 0 0 0-5.9Zm5.35-2.55a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z"/>
    </template>

    <path v-else-if="platform === 'youtube'" d="M21.58 7.2a2.43 2.43 0 0 0-1.71-1.72C18.28 5 12 5 12 5s-6.28 0-7.87.48A2.43 2.43 0 0 0 2.42 7.2 25.3 25.3 0 0 0 2 12a25.3 25.3 0 0 0 .42 4.8 2.43 2.43 0 0 0 1.71 1.72C5.72 19 12 19 12 19s6.28 0 7.87-.48a2.43 2.43 0 0 0 1.71-1.72A25.3 25.3 0 0 0 22 12a25.3 25.3 0 0 0-.42-4.8ZM10 15.02V8.98L15.55 12 10 15.02Z" />
    <path v-else-if="platform === 'tiktok'" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.88-2.9 2.92 2.92 0 0 1 .57-.06v-3.5a6.39 6.39 0 1 0 5.74 6.35V9.12a8.16 8.16 0 0 0 4.79 1.52V7.19a4.85 4.85 0 0 1-1-.5Z" />
    <path v-else-if="platform === 'twitch'" d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
    <path v-else-if="platform === 'linkedin'" d="M4.98 3.5a2.1 2.1 0 1 1-.02 4.2 2.1 2.1 0 0 1 .02-4.2ZM3.15 9.35h3.65v11.15H3.15V9.35Zm6.2 0h3.5v1.52h.05c.49-.93 1.68-1.92 3.46-1.92 3.7 0 4.38 2.43 4.38 5.6v5.95h-3.65v-5.28c0-1.26-.02-2.88-1.76-2.88-1.76 0-2.03 1.37-2.03 2.79v5.37H9.35V9.35Z" />
    <path
      v-else
      d="M14.25 3.5h3.25v3.25h-1.9L9.4 12.95l1.65 1.65 6.2-6.2v1.9h3.25V6.05h-6.35v3.25h1.9l-6.2 6.2-1.65-1.65 6.2-6.2h-1.9V3.5Zm-8.5 4h3.25v13.25H3.5V7.5Z"
    />
  </svg>
</template>

<script setup lang="ts">
import type { UgcSocialPlatform } from '~/data/cms'

const props = withDefaults(
  defineProps<{
    platform: UgcSocialPlatform
    size?: 'sm' | 'md'
  }>(),
  { size: 'sm' }
)

const sizeClass = computed(() => (props.size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'))
</script>
