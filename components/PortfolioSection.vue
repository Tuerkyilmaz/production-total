<template>
  <section class="pt-24 pb-16 sm:py-24 md:py-32 lg:py-48 bg-black text-white overflow-hidden">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">
      <h1 class="font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-5 md:mb-8">
        Projekte
      </h1>
      <p class="font-sans text-white/65 text-base sm:text-lg max-w-5xl mb-10 md:mb-12 leading-relaxed">
        {{ projectsPortfolioIntro }}
      </p>

      <div class="grid grid-cols-2 gap-3 mb-10 md:mb-14 md:flex md:flex-wrap md:gap-4">
        <button
          v-for="category in projectCategories"
          :key="category.value"
          type="button"
          class="font-headline text-sm md:text-base px-5 py-3 border-0 transition-colors duration-200 text-left md:text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          :class="[
            category.value === 'all' ? 'col-span-2 md:col-span-1' : '',
            activeCategory === category.value
              ? 'bg-white text-black'
              : 'bg-transparent text-[#b9dcc8] hover:text-white'
          ]"
          @click="activeCategory = category.value"
        >
          {{ category.label }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        <div
          v-for="item in portfolioItems"
          :key="item.id"
          class="group relative block"
          @mouseenter="hoveredId = item.id"
          @mouseleave="hoveredId = null"
        >
          <div class="relative aspect-video overflow-hidden">
            <img
              :src="getProjectPosterUrl(item)"
              :alt="`${item.title}: Vorschaubild, Filmprojekt für ${item.customerName}`"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none"
              :class="hoveredId === item.id ? 'opacity-0' : 'opacity-100'"
              loading="lazy"
            >
            <iframe
              v-if="hoveredId === item.id && getProjectHoverEmbedUrl(item)"
              :src="getProjectHoverEmbedUrl(item)"
              title="Video-Vorschau"
              class="absolute inset-0 w-full h-full pointer-events-none"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            />
            <div
              v-if="item.previewDarken"
              class="absolute inset-0 z-[1] bg-black/25 pointer-events-none"
              aria-hidden="true"
            />
            <div class="absolute inset-0 z-[2] bg-black/0 group-hover:bg-black/80 transition-colors duration-300 pointer-events-none" />
            <div class="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-5 sm:px-7 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <p class="font-headline text-base sm:text-lg md:text-xl text-white font-semibold w-full">
                {{ item.title }}
              </p>
              <p class="font-sans text-white/80 text-xs sm:text-sm mt-1 w-full">
                {{ item.customerName }}
              </p>
              <p class="font-sans text-white/70 text-[11px] sm:text-xs mt-2 leading-relaxed w-full max-w-none">
                {{ truncateHoverSummary(item.summary) }}
              </p>
            </div>
            <NuxtLink
              :to="`/projekte/${item.slug}`"
              class="absolute inset-0 z-20 block focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              :aria-label="`Projekt ${item.title} öffnen`"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { ProjectItem } from '~/data/projects'

const { data: projectsData } = await usePublicProjects()
const projects = computed(() => projectsData.value ?? [])

const projectsPortfolioIntro =
  'Von Imagefilm über Events bis Social Media und YouTube: hier finden Sie unsere Produktionen im Überblick.'

const hoveredId = ref<string | null>(null)
const activeCategory = ref<'all' | 'social' | 'events' | 'image' | 'youtube'>('all')

const projectCategories = [
  { value: 'all', label: 'Alle Projekte' },
  { value: 'social', label: 'Social Media' },
  { value: 'events', label: 'Events' },
  { value: 'image', label: 'Image Filme' },
  { value: 'youtube', label: 'YouTube' }
] as const

function matchesCategory (project: ProjectItem, category: typeof activeCategory.value): boolean {
  if (category === 'all') return true
  return project.portfolioCategories.includes(category)
}

const portfolioItems = computed(() =>
  projects.value.filter((project) => matchesCategory(project, activeCategory.value))
)
</script>
