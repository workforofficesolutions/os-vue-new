<template>
  <div id="layout" class="min-h-screen flex flex-col bg-[#F4EFE7]">
    <SiteHeader />
    <!-- content area fills remaining height; overflow hidden prevents margin-collapsing white gaps -->
    <div class="flex-1">
      <router-view />
    </div>
    <!-- ensure no extra gap above the footer -->
    <SiteFooter class="mt-0" />
    <WhatsappWidget />
  </div>
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import WhatsappWidget from './components/WhatsappWidget.vue';
</script>

<style>
/* Ensure root stretches and no default margins cause seams */
html, body, #app { min-height: 100%; }
body { margin: 0; }
</style>