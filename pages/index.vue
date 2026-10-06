<script setup lang="ts">
useHead({
  title: 'ProductionTotal | Video-Produktion für Ihre Marke',
  meta: [
    { name: 'description', content: 'ProductionTotal: Cinematische Video-Produktion für Marken, Events und Creator.' }
  ]
})

useSeoMeta({
  title: 'ProductionTotal | Video-Produktion für Ihre Marke',
  description: 'ProductionTotal: Cinematische Video-Produktion für Marken, Events und Creator.',
  ogTitle: 'ProductionTotal | Video-Produktion für Ihre Marke',
  ogDescription: 'Cinematische Video-Produktion für Marken, Events und Creator.',
  ogType: 'website',
  twitterTitle: 'ProductionTotal | Video-Produktion für Ihre Marke',
  twitterDescription: 'Cinematische Video-Produktion für Marken, Events und Creator.'
})
</script>

<template>
  <main class="font-sans min-h-screen bg-white text-black overflow-x-hidden">
    <HeroSection />
    <LogoStripSection />
    <AdvantagesSection />
    <ProjectsTeaserSection />
    <UgcCreatorsSection />
    <ContactSection />
    <Footer />
  </main>
</template>
