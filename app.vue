<script setup lang="ts">
const route = useRoute()
useHead({
  script: [
    { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-3TL124Z4EQ' },
    {
      children: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-3TL124Z4EQ');"
    }
  ]
})
</script>

<template>
  <div>
    <HeaderModal v-if="!route.path.startsWith('/creator')" />
    <NuxtPage :keepalive="{ max: 8 }" />
    <CookieBanner v-if="!route.path.startsWith('/creator')" />
  </div>
</template>
