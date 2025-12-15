<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Elfsight injects the feed asynchronously (often via an iframe).
// If you are using Lenis smooth scroll, the scroll height can be measured BEFORE the embed finishes rendering,
// which makes the page appear to "stop" at the end of this block (footer becomes unreachable).
//
// This component-only fix:
// 1) forces scroll/Lenis to re-measure after the embed mutates
// 2) prevents the iframe from swallowing wheel/trackpad scroll by default (click to interact)
const interactive = ref(false)
const host = ref<HTMLElement | null>(null)

let observer: MutationObserver | null = null
let timeouts: number[] = []

function enableInteraction() {
  interactive.value = true
}

function disableInteraction() {
  interactive.value = false
}

function refreshScrollMeasurements() {
  if (typeof window === 'undefined') return

  // Force native layout recalculation
  window.dispatchEvent(new Event('resize'))

  // Try common Lenis globals (depends how Lenis is initialised/exposed in your app)
  const w = window as any
  w?.lenis?.resize?.()
  w?.__lenis?.resize?.()
  w?.lenisInstance?.resize?.()
}

onMounted(() => {
  // Elfsight injects over time; refresh a few times
  refreshScrollMeasurements()
  ;[250, 800, 1500, 2500, 4000].forEach((ms) => {
    timeouts.push(window.setTimeout(refreshScrollMeasurements, ms))
  })

  // Observe DOM mutations inside the embed container
  if (host.value) {
    observer = new MutationObserver(() => {
      requestAnimationFrame(refreshScrollMeasurements)
    })
    observer.observe(host.value, { childList: true, subtree: true, attributes: true })
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  timeouts.forEach((t) => clearTimeout(t))
  timeouts = []
})
</script>

<template>
  <ClientOnly>
    <div ref="host" class="relative" @click="enableInteraction" @mouseleave="disableInteraction">
      <div
        class="elfsight-app-8da8248f-aafa-475f-b8bb-85862e9211e9"
        :class="interactive ? 'pointer-events-auto' : 'pointer-events-none'"
        data-elfsight-app-lazy
      ></div>

      <!-- Scroll passes through; click enables interaction with the widget -->
      <div v-if="!interactive" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="bg-white/80 text-black text-xs px-4 py-2 rounded-full shadow">
          Scroll to continue. Click to interact.
        </div>
      </div>
    </div>
  </ClientOnly>
</template>