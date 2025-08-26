<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const solid = ref(false)
const open = ref(false)
const route = useRoute()

let headerTrigger = null

function killTrigger() {
  if (headerTrigger) {
    headerTrigger.kill()
    headerTrigger = null
  }
}

function createTrigger(hero) {
  solid.value = false

  const endDistance = () => {
    const h = hero.getBoundingClientRect().height || hero.offsetHeight || window.innerHeight
    return Math.max(h, window.innerHeight * 0.6) * 0.5
  }

  // hysteresis thresholds
  const SOLID_ON = 0.92   // become solid when past 92% of the range
  const SOLID_OFF = 0.85   // go back to transparent below 85%
  let isSolid = false
  
  headerTrigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${endDistance()}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (!isSolid && self.progress >= SOLID_ON) {
        isSolid = true
        solid.value = true
      } else if (isSolid && self.progress <= SOLID_OFF) {
        isSolid = false
        solid.value = false
      }
    },
    onLeaveBack: () => { isSolid = false; solid.value = false },
  })

  ScrollTrigger.refresh()
}


function setupHeaderTriggerWithRetry(retries = 0) {
  killTrigger()

  const hero = document.getElementById('hero')

  if (!hero) {
    // Give router-view time to mount; try a few times before concluding “no hero”
    if (retries < 10) {
      setTimeout(() => setupHeaderTriggerWithRetry(retries + 1), 50)
      return
    }
    // No hero on this route → keep header solid
    solid.value = true
    return
  }

  createTrigger(hero)
}

onMounted(async () => {
  await nextTick()
  // first run (home may not be mounted yet)
  setupHeaderTriggerWithRetry()
})

// Re-init when route changes
watch(() => route.fullPath, async () => {
  await nextTick()
  setupHeaderTriggerWithRetry()
})

onBeforeUnmount(killTrigger)
</script>




<template>
  <header id="site-header" class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="solid ? 'bg-[#F7F3EA] border-b border-black/10 text-black' : 'bg-transparent border-b border-white/25 text-white'">
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6">

      <!-- ===========================
           MOBILE TOP BAR (ADDED)
           =========================== -->
      <div class="flex md:hidden items-center justify-between h-16">
        <button class="font-medium" @click="open = true">Menu</button>

        <!-- Center brand text for now (you'll swap to logo later) -->
        <!-- Mobile logo -->
        <!-- Centered mobile logo that also touches the bottom line -->
        <a href="/" aria-label="Office Solutions" class="h-full pb-px flex items-stretch">
          <img src="/hero/os-logo.png" alt="Office Solutions" class="block h-full w-auto" />
        </a>

        <button aria-label="Search" class="inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 15" width="20" height="20" fill="none">
            <path
              d="M9.40431 9.79815L13.0002 13.7494M11.1891 6.2C11.1891 9.07188 8.86094 11.4 5.98906 11.4C3.11718 11.4 0.789062 9.07188 0.789062 6.2C0.789062 3.32812 3.11718 1 5.98906 1C8.86094 1 11.1891 3.32812 11.1891 6.2Z"
              stroke="currentColor" stroke-width="1.7" />
          </svg>
        </button>
      </div>

      <!-- Desktop bar (unchanged) -->
      <div class="hidden md:grid grid-cols-3 items-center h-16">
        <nav class="flex items-center gap-8">
          <a href="#" class="nav-link">Products</a>
          <a href="#" class="nav-link">Sectors</a>
          <a href="#" class="nav-link">Resources</a>
          <a href="#" class="nav-link">About</a>
        </nav>

        <!-- Desktop centered logo -->
        <!-- CENTERED LOGO (constrained) -->
        <div class="flex items-stretch justify-center h-16">
          <a href="/" aria-label="Office Solutions" class="h-full pb-px flex items-stretch">
            <img src="/hero/os-logo.png" alt="Office Solutions" class="block h-full w-auto" />
          </a>
        </div>

        <nav class="flex items-center gap-8 justify-end">
          <a href="#" class="nav-link">Case studies</a>
          <a href="#" class="nav-link">Contact</a>

          <!-- Search = text + icon in ONE clickable element, dims together -->
          <a href="#" class="nav-link nav-link--flex" aria-label="Search">
            <span>Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 15" class="nav-link--icon" fill="none">
              <path
                d="M9.40431 9.79815L13.0002 13.7494M11.1891 6.2C11.1891 9.07188 8.86094 11.4 5.98906 11.4C3.11718 11.4 0.789062 9.07188 0.789062 6.2C0.789062 3.32812 3.11718 1 5.98906 1C8.86094 1 11.1891 3.32812 11.1891 6.2Z"
                stroke="currentColor" stroke-width="1.7" />
            </svg>
          </a>
        </nav>
      </div>
    </div>

    <!-- ===========================
         MOBILE DRAWER (ADDED)
         =========================== -->
    <div v-if="open" class="md:hidden">
      <div class="fixed inset-0 bg-black/40" @click="open = false"></div>
      <aside class="fixed inset-y-0 left-0 w-80 bg-white text-black shadow-xl p-6 space-y-4">
        <button class="mb-4" @click="open = false">✕ Close</button>
        <a href="#" class="block">Products</a>
        <a href="#" class="block">Sectors</a>
        <a href="#" class="block">Resources</a>
        <a href="#" class="block">About</a>
        <hr>
        <a href="#" class="block">Case studies</a>
        <a href="#" class="block">Contact</a>
        <a href="#" class="block">Search</a>
      </aside>
    </div>
    <!-- =========================== -->
  </header>
</template>

<style scoped>
/* Centralized link behavior — tweak here and it updates everywhere */
.nav-link {
  @apply transition-opacity duration-200;
}

.nav-link:hover {
  opacity: 0.6;
  /* change to .5 or .7 to taste */
}

/* Search (or any link with icon) */
.nav-link--flex {
  @apply inline-flex items-center gap-2;
}

.nav-link--icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  /* Follows text color via stroke="currentColor" in the SVG */
}

/* (Optional) If you later need the mobile button styling again
.search-btn svg { width: 20px; height: 20px; }
.search-btn:hover svg { opacity: 0.6; }
*/
</style>