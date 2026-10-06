<template>
  <header
    class="fixed top-0 left-0 right-0 z-[120] transition-colors duration-300"
    :class="solidNav ? 'bg-black border-b border-white/10' : (scrolled ? 'bg-black/90 border-b border-white/10' : 'bg-transparent')"
  >
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">
      <div class="h-14 sm:h-16 flex items-center justify-between">
        <NuxtLink
          to="/"
          class="inline-flex items-center shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-sm"
          aria-label="ProductionTotal – Startseite"
        >
          <img
            src="/assets/img/production-total-logo.png"
            alt="ProductionTotal"
            width="180"
            height="40"
            class="h-8 sm:h-9 w-auto max-h-10 object-contain object-left"
            loading="eager"
            decoding="async"
          >
        </NuxtLink>

        <nav class="hidden lg:flex items-center gap-8">
          <NuxtLink
            v-for="link in links"
            :key="link.label"
            :to="link.to"
            class="font-headline transition-colors text-sm tracking-wide"
            :class="isActiveLink(link.to) ? 'text-[#b9dcc8]' : 'text-white/80 hover:text-white'"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <button class="lg:hidden w-10 h-10 border border-white/30 text-white inline-flex items-center justify-center" aria-label="Menü öffnen" @click="menuOpen = true">
          <span class="w-5 h-[2px] bg-white relative">
            <span class="absolute -top-1.5 left-0 w-5 h-[2px] bg-white" />
            <span class="absolute top-1.5 left-0 w-5 h-[2px] bg-white" />
          </span>
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="menuOpen" class="fixed inset-0 z-[130] bg-black/95 p-5 sm:p-8">
        <div class="h-full w-full flex flex-col">
          <div class="flex items-center justify-between h-16 gap-4">
            <img
              src="/assets/img/production-total-logo.png"
              alt=""
              width="160"
              height="36"
              class="h-8 w-auto max-h-9 object-contain opacity-90"
              loading="eager"
              decoding="async"
              aria-hidden="true"
            >
            <span class="font-headline text-white text-lg">Menü</span>
            <button class="w-10 h-10 border border-white/30 text-white inline-flex items-center justify-center" aria-label="Menü schließen" @click="menuOpen = false">
              ✕
            </button>
          </div>
          <nav class="mt-10 flex flex-col gap-5">
            <NuxtLink
              v-for="link in links"
              :key="`mobile-${link.label}`"
              :to="link.to"
              class="font-headline text-2xl sm:text-3xl"
              :class="isActiveLink(link.to) ? 'text-[#b9dcc8]' : 'text-white'"
              @click="menuOpen = false"
            >
              {{ link.label }}
            </NuxtLink>
          </nav>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const route = useRoute()
const scrolled = ref(false)
const menuOpen = ref(false)

const solidNav = computed(
  () => route.path === '/impressum' || route.path === '/datenschutz'
)

const links = [
  { label: 'Home', to: '/' },
  { label: 'Projekte', to: '/projekte' },
  { label: 'UGC Creator', to: '/#ugc-creators' },
  { label: 'Kontakt', to: '/#contact' }
]

function onScroll() {
  scrolled.value = window.scrollY > 20
}

function isActiveLink (to: string): boolean {
  if (to === '/') return route.path === '/'
  if (to.startsWith('/#')) {
    return route.path === '/' && route.hash === to.slice(1)
  }
  return route.path === to
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
