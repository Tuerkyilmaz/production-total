<template>
  <div class="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <p class="text-xs uppercase tracking-[0.25em] text-white/25 mb-4 font-sans">Creator Portal</p>
        <h1 class="font-headline font-bold text-3xl text-white tracking-tight">Einloggen</h1>
      </div>

      <form class="space-y-4" @submit.prevent="login">
        <div>
          <label class="block text-sm text-white/70 mb-1.5">Login-Code</label>
          <input
            v-model="code"
            type="text"
            autocomplete="off"
            placeholder="Deinen persönlichen Code eingeben"
            class="w-full px-4 py-3 bg-white/5 border border-white/20 text-white placeholder:text-white/25 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 font-mono text-sm"
          >
        </div>

        <div v-if="error" class="text-sm text-red-400">{{ error }}</div>

        <button
          type="submit"
          class="font-headline w-full py-3 bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? 'Wird geprüft …' : 'Einloggen' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const code = ref('')
const loading = ref(false)
const error = ref('')

async function login() {
  error.value = ''
  if (!code.value.trim()) { error.value = 'Bitte Code eingeben.'; return }
  loading.value = true
  try {
    await $fetch('/api/creator/login', { method: 'POST', body: { login_code: code.value.trim() } })
    await navigateTo('/creator/portal')
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    error.value = err?.data?.message || 'Ungültiger Code.'
  } finally {
    loading.value = false
  }
}
</script>
