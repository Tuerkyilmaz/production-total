<template>
  <main class="font-sans min-h-screen bg-black text-white overflow-x-hidden">
    <NuxtLink
      to="/projekte"
      class="fixed top-20 sm:top-24 left-5 sm:left-8 md:left-12 lg:left-24 z-[110] inline-flex items-center gap-2 font-headline text-sm sm:text-base text-white/85 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
      aria-label="Zurück zur Projekte-Übersicht"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4 sm:w-5 sm:h-5 -mt-px" aria-hidden="true">
        <path fill-rule="evenodd" d="M11.03 3.97a.75.75 0 0 1 0 1.06l-6.22 6.22H21a.75.75 0 0 1 0 1.5H4.81l6.22 6.22a.75.75 0 1 1-1.06 1.06l-7.5-7.5a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
      </svg>
      Zurück
    </NuxtLink>
    <section class="py-16 sm:py-24 md:py-32">
      <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">
        <div class="max-w-[1600px] mx-auto">
          <div class="text-center">
            <h1 class="font-headline text-4xl sm:text-5xl md:text-6xl font-bold">
              {{ project?.title }}
            </h1>
            <p class="font-sans text-white/70 text-base sm:text-lg mt-3">
              {{ project?.customerName }}
            </p>
            <p
              v-if="project?.description"
              class="font-sans text-white/65 text-base sm:text-lg leading-relaxed mt-6 max-w-6xl mx-auto text-left sm:text-center whitespace-pre-line"
            >
              {{ project.description }}
            </p>
          </div>

          <div class="mt-8 relative aspect-video overflow-hidden bg-black/40">
            <template v-if="project">
              <template v-if="project.videoProvider === 'file'">
                <video
                  :src="getProjectFileVideoUrl(project)"
                  :poster="project.thumbnailUrl"
                  controls
                  playsinline
                  preload="metadata"
                  class="absolute inset-0 w-full h-full object-cover bg-black"
                  :title="`${project.title}: Video`"
                />
                <div
                  v-if="project.previewDarken"
                  class="absolute inset-0 z-[5] bg-black/25 pointer-events-none"
                  aria-hidden="true"
                />
              </template>
              <template v-else>
                <img
                  v-if="!playing"
                  :src="getProjectPosterUrl(project)"
                  :alt="`${project.title}: Video-Vorschau für ${project.customerName}`"
                  class="absolute inset-0 w-full h-full object-cover"
                >
                <iframe
                  v-if="playing && getProjectDetailEmbedUrl(project)"
                  :src="getProjectDetailEmbedUrl(project)"
                  :title="`${project.title}: eingebettetes Video`"
                  class="absolute inset-0 w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowfullscreen
                />
                <div
                  v-if="project.previewDarken && !playing"
                  class="absolute inset-0 z-[5] bg-black/25 pointer-events-none"
                  aria-hidden="true"
                />
                <button
                  v-if="!playing && getProjectDetailEmbedUrl(project)"
                  class="absolute inset-0 z-10 flex items-center justify-center"
                  @click="playing = true"
                  aria-label="Video abspielen"
                >
                  <span class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-7 h-7 ml-0.5">
                      <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.64l11.54 6.347c1.295.713 1.295 2.567 0 3.28l-11.54 6.347A1.875 1.875 0 0 1 4.5 18.347V5.653Z" clip-rule="evenodd" />
                    </svg>
                  </span>
                </button>
              </template>
            </template>
          </div>
        </div>
      </div>
    </section>
    <Footer />
  </main>
</template>

<script setup lang="ts">
const route = useRoute()
const playing = ref(false)

const { data: projectsData } = await usePublicProjects()

const project = computed(() => {
  const slug = String(route.params.project || '')
  return (projectsData.value ?? []).find((p) => p.slug === slug)
})

useHead(() => ({
  title: project.value
    ? `${project.value.title} | Projekt | ProductionTotal`
    : 'Projekt | ProductionTotal',
  meta: [
    {
      name: 'description',
      content: project.value
        ? `${project.value.title}: ${project.value.customerName}. Video-Projekt von ProductionTotal.`
        : 'Video-Projekt von ProductionTotal.'
    }
  ]
}))

useSeoMeta({
  title: () => (project.value ? `${project.value.title} | Projekt | ProductionTotal` : 'Projekt | ProductionTotal'),
  description: () => (
    project.value
      ? `${project.value.title}: ${project.value.customerName}. Video-Projekt von ProductionTotal.`
      : 'Video-Projekt von ProductionTotal.'
  ),
  ogTitle: () => (project.value ? `${project.value.title} | Projekt | ProductionTotal` : 'Projekt | ProductionTotal'),
  ogDescription: () => (
    project.value
      ? `${project.value.title}: ${project.value.customerName}. Video-Projekt von ProductionTotal.`
      : 'Video-Projekt von ProductionTotal.'
  ),
  ogType: 'article'
})

watch(
  () => route.params.project,
  () => {
    playing.value = false
  }
)
</script>
