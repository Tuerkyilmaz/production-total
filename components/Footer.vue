<template>
  <footer class="bg-black py-12 sm:py-16 md:py-20 px-5 sm:px-8 md:px-16 border-t border-white/10">
    <div class="w-full max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <p class="font-sans text-white/60 font-medium">© ProductionTotal</p>
      <div class="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-white/60 font-sans">
        <a href="/projekte" class="font-headline hover:text-white transition-colors">Projekte</a>
        <a href="/#contact" class="font-headline hover:text-white transition-colors">Kontakt</a>
        <NuxtLink to="/datenschutz" class="font-headline hover:text-white transition-colors">Datenschutz</NuxtLink>
        <NuxtLink to="/impressum" class="font-headline hover:text-white transition-colors">Impressum</NuxtLink>
      </div>
    </div>
  </footer>
</template>
