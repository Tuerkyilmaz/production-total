<template>
  <section id="advantages" class="py-24 sm:py-32 md:py-40 bg-[#0a0a0a]">
    <div class="w-full px-5 sm:px-8 md:px-12 lg:px-24">

      <div class="mb-16 md:mb-24">
        <p class="text-xs uppercase tracking-[0.25em] text-white/30 mb-4 font-sans">Vorteile</p>
        <h2 class="font-headline font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-none">
          Was wir leisten.
        </h2>
      </div>

      <!-- Desktop -->
      <div class="hidden lg:grid lg:grid-cols-3 divide-x divide-white/[0.07]">
        <div
          v-for="(item, i) in advantages"
          :key="item.title"
          class="px-12 first:pl-0 last:pr-0"
        >
          <span class="font-headline text-[80px] leading-none font-bold text-white/[0.06] block mb-8 select-none">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3 class="font-headline font-bold text-xl text-white mb-4 tracking-tight">
            {{ item.title }}
          </h3>
          <p class="font-sans text-white/40 text-sm leading-relaxed">
            {{ item.description }}
          </p>
        </div>
      </div>

      <!-- Mobile / Tablet -->
      <div class="lg:hidden divide-y divide-white/[0.07]">
        <div
          v-for="(item, i) in advantages"
          :key="item.title"
          class="py-10 first:pt-0 last:pb-0"
        >
          <span class="font-headline text-5xl leading-none font-bold text-white/[0.06] block mb-5 select-none">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <h3 class="font-headline font-bold text-xl text-white mb-3 tracking-tight">
            {{ item.title }}
          </h3>
          <p class="font-sans text-white/40 text-sm leading-relaxed max-w-prose">
            {{ item.description }}
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
const advantages = [
  {
    title: 'Produktion & Formate',
    description:
      'Cinema-Qualität mit RED Komodo. UGC mit Inhouse-Creatorn. Imagefilm, Event, Werbung, Social — alles aus einer Hand, abgestimmt auf Marke und Kanal.'
  },
  {
    title: 'Innovation & Netzwerk',
    description:
      'Team aus Kino, YouTube und Livestream. Moderne Workflows für Tempo ohne Qualitätsverlust — und das volle Know-how der Agenturgruppe TalentsTotal.'
  },
  {
    title: 'Digitale Auftritte',
    description:
      'Homepages, Branding, Landingpages und Marketing-Pushes — digital sauber umgesetzt und technisch angebunden an Ihre Kanäle.'
  }
]
</script>
