<template>
  <main class="font-sans min-h-screen bg-black text-white overflow-x-hidden">
    <PortfolioSection />
    <Footer />
  </main>
</template>

<script setup lang="ts">
useHead({
  title: 'Projekte | ProductionTotal',
  meta: [
    { name: 'description', content: 'Ausgewählte Video-Projekte von ProductionTotal: Imagefilm, Event, Social, YouTube und Kampagnen.' }
  ]
})

useSeoMeta({
  title: 'Projekte | ProductionTotal',
  description: 'Ausgewählte Video-Projekte von ProductionTotal: Imagefilm, Event, Social, YouTube und Kampagnen.',
  ogTitle: 'Projekte | ProductionTotal',
  ogDescription: 'Ausgewählte Video-Projekte von ProductionTotal.',
  ogType: 'website',
  twitterTitle: 'Projekte | ProductionTotal',
  twitterDescription: 'Ausgewählte Video-Projekte von ProductionTotal.'
})
</script>
