<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/* Props */
const props = defineProps({
  headerSelector: { type: String, default: '#site-header' },
  headerFallback: { type: Number, default: 64 } // px
})

/* Data */
const sectors = [
  { label: 'Workplace', img: '/block4/block4-workplace.jpg' },
  { label: 'Education', img: '/block4/block4-education.jpg' },
  { label: 'Healthcare', img: '/block4/block4-healthcare.jpg', pos: '40% 50%' },
  { label: 'Public buildings', img: '/block4/block4-publicbuildings.jpg' },
  { label: 'Aged care', img: '/block4/block4-agedcare.jpg' },
  { label: 'Shopping & showrooms', img: '/block4/block4-shopping.jpg' },
  { label: 'Sport', img: '/block4/block4-sport.jpg' },
]

/* Swiper / active */
const active = ref(0)
let swiperRef = null
function onSlideChange(sw) { active.value = sw.realIndex ?? sw.activeIndex }
function to(i) { if (!swiperRef || i === active.value) return; swiperRef.slideToLoop(i) }

const current = computed(() => sectors[active.value] || sectors[0])
const caseHref = computed(() => `/case-studies?sector=${encodeURIComponent(current.value.label)}`)
const caseText = computed(() => `${current.value.label} case studies`)

/* 5-row window, active centered (for labels only) */
const center = 2
const visibleSectors = computed(() => {
  const out = []
  for (let k = -center; k <= 2; k++) {
    const idx = (active.value + k + sectors.length) % sectors.length
    out.push({ ...sectors[idx], i: idx })
  }
  return out
})

/* Full-height minus header */
const headerH = ref(props.headerFallback)
const sectionStyle = computed(() => ({ height: `calc(100vh - ${headerH.value}px)` }))
function measureHeader() {
  const el = document.querySelector(props.headerSelector)
  headerH.value = el?.offsetHeight || props.headerFallback
}
function onResize() { measureHeader() }

/* Lifecycle */
onMounted(() => {
  measureHeader()
  window.addEventListener('resize', onResize)

  updateShiftPct()
  window.addEventListener('resize', updateShiftPct)

  // Fade-in only (no Y movement so geometry never changes)
  gsap.from('.sectors-left', {
    scrollTrigger: { trigger: '.sectors-left', start: 'top 95%' },
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    clearProps: 'all',
  })
  gsap.from('.sectors-right', {
    scrollTrigger: { trigger: '.sectors-right', start: 'top 95%' },
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out',
    clearProps: 'all',
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  window.removeEventListener('resize', updateShiftPct)
})

const shiftPct = ref(0.304) // start at 30% (~between 1/4 and 1/3)

function clampShift(p) {
  // keep it between 25% and 33.333%
  return Math.min(1 / 3, Math.max(0.25, p))
}

function updateShiftPct() {
  // adjust for breakpoints if needed
  const sm = window.matchMedia('(min-width: 640px)').matches
  const lg = window.matchMedia('(min-width: 1024px)').matches

  let p = 0.31          // mobile
  if (lg) p = 0.304     // desktop, a bit closer to 28.5%
  else if (sm) p = 0.304 // tablet, ~29.5%

  shiftPct.value = clampShift(p)
}
</script>

<template>
  <!-- EXACT viewport (minus header). No scroll bleed. -->
  <section class="bg-sand overflow-hidden w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]"
    :style="sectionStyle">
    <!-- 50/50 split -->
    <div class="grid grid-cols-1 lg:grid-cols-2 h-full">
      <!-- LEFT: image slider -->
      <div class="relative h-[56vh] sm:h-[60vh] lg:h-full sectors-left overflow-hidden">
        <Swiper :modules="[Autoplay]" :slides-per-view="1" :loop="true" :speed="1400" :allow-touch-move="false"
          :autoplay="{
            delay: 4200,
            reverseDirection: true,
            disableOnInteraction: false,
            pauseOnMouseEnter: false
          }" @swiper="(sw) => (swiperRef = sw)" @slideChange="onSlideChange" class="h-full">
          <SwiperSlide v-for="(s, i) in sectors" :key="i" class="relative">
            <img :src="s.img" class="w-full h-full object-cover select-none"
              :style="{ objectPosition: s.pos || '50% 50%' }" :alt="s.label" draggable="false" />
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent pointer-events-none z-0" />
          </SwiperSlide>
        </Swiper>

        <!-- LEFT overlay: FIXED -->
        <div class="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 text-white drop-shadow-lg z-20 text-right">
          <div class="text-[clamp(22px,3.4vw,44px)] font-extrabold leading-tight">
            Flooring for
          </div>
        </div>
      </div>

      <!-- RIGHT: heading pinned; LIST is absolutely centered; blurb/CTAs in flow -->
      <div
        class="bg-[#D5CEC4] px-6 sm:px-10 lg:px-14 py-8 lg:py-12 relative sectors-right flex flex-col overflow-hidden">
        <div class="flex-1 relative">
          <!-- Heading stays at the top -->
          <p class="text-xs sm:text-sm uppercase tracking-wide mb-6 font-semibold">Sectors</p>

          <!-- Absolutely centered list (no JS; no snapping) -->
          <div class="absolute left-0 right-0 top-1/2 pointer-events-none"
            :style="{ transform: `translateY(-${(shiftPct * 100).toFixed(3)}%)` }">
            <div class="relative">
              <!-- top/bottom fades -->
              <div
                class="pointer-events-none absolute -top-3 left-0 right-0 h-8 bg-gradient-to-b from-[#D5CEC4] to-transparent" />
              <div
                class="pointer-events-none absolute -bottom-3 left-0 right-0 h-8 bg-gradient-to-t from-[#D5CEC4] to-transparent" />

              <ul class="relative grid grid-rows-5 gap-1.5 sm:gap-2 mb-6 select-none">
                <li v-for="(s, idx) in visibleSectors" :key="`${s.i}-${s.label}`"
                  class="h-[2.8rem] sm:h-[3.1rem] flex items-center">
                  <button
                    class="w-full text-left text-[clamp(22px,3.4vw,44px)] font-extrabold leading-tight whitespace-nowrap transition"
                    :class="idx === 2 ? 'text-black' : 'text-white/70'" @mouseenter="to(s.i)" @focus="to(s.i)">
                    {{ s.label }}
                  </button>
                </li>
              </ul>
            </div>

            <!-- Active blurb (kept directly under the list so visual grouping remains) -->
            <transition name="fade-slide" mode="out-in">
              <p :key="current.label"
                class="mt-1 text-[13.5px] leading-[1.55] tracking-[0.01em] text-black/85 max-w-[56ch]">
                {{ current.blurb }}
              </p>
            </transition>
          </div>
        </div>

        <!-- CTAs pinned to bottom as before -->
        <div class="mt-8 pt-4 flex items-center gap-5">
          <a class="inline-flex items-center gap-3 px-6 py-3 bg-white shadow-sm hover:shadow transition"
            :href="caseHref">
            <span class="font-semibold">Read more</span>
            <span aria-hidden>→</span>
          </a>
          <a class="underline font-medium" :href="caseHref">{{ caseText }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* slow, smooth scroll-up for blurb / any fade-slide content */
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  /* longer duration + softer easing */
  transition:
    opacity 900ms cubic-bezier(.2, .8, .2, 1),
    transform 900ms cubic-bezier(.2, .8, .2, 1);
  will-change: opacity, transform;
}
</style>