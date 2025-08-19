<script setup>
import { ref, computed, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// 7 sectors total (includes “Shopping & showrooms” and “Sport”)
const sectors = [
  { label: 'Workplace', img: '/block4/block4-workplace.jpg', blurb: 'Comfortable, durable flooring designed for productivity, with a wide range of colour and pattern to create unique spaces.' },
  { label: 'Education', img: '/block4/block4-education.jpg', blurb: 'Acoustics and comfort for learning spaces that work hard.' },
  { label: 'Healthcare', img: '/block4/block4-healthcare.jpg', blurb: 'Hygienic and seamless surfaces that reduce contamination risk.' },
  { label: 'Public buildings', img: '/block4/block4-publicbuildings.jpg', blurb: 'High traffic performance with clean architectural aesthetics.' },
  { label: 'Aged care', img: '/block4/block4-agedcare.jpg', blurb: 'Warm, safe, and resilient flooring for living well.' },
  { label: 'Shopping & showrooms', img: '/block4/block4-shopping.jpg', blurb: 'Inviting, durable surfaces that showcase products and handle the crowds.' },
  { label: 'Sport', img: '/block4/block4-sport.jpg', blurb: 'Performance flooring built for impact, traction and easy maintenance.' },
]

// swiper / active
const active = ref(0)
let swiperRef = null

function onSlideChange(sw) {
  active.value = sw.realIndex ?? sw.activeIndex
}
function to(i) {
  if (!swiperRef) return
  if (i === active.value) return // guard to prevent hover jitter
  swiperRef.slideToLoop(i)
}

const current = computed(() => sectors[active.value] || sectors[0])

// dynamic case-studies link
const caseHref = computed(() => `/case-studies?sector=${encodeURIComponent(current.value.label)}`)
const caseText = computed(() => `${current.value.label} case studies`)

// show exactly 5 items; active sits in the middle (index 2 of the window)
const windowSize = 5
const center = 2
const visibleSectors = computed(() => {
  const out = []
  for (let k = -center; k <= (windowSize - center - 1); k++) {
    const idx = (active.value + k + sectors.length) % sectors.length
    out.push({ ...sectors[idx], i: idx })
  }
  return out
})

onMounted(() => {
  gsap.from('.sectors-left', { scrollTrigger: { trigger: '.sectors-left', start: 'top 80%' }, y: 24, opacity: 0, duration: 0.6, ease: 'power2.out' })
  gsap.from('.sectors-right', { scrollTrigger: { trigger: '.sectors-right', start: 'top 80%' }, y: 24, opacity: 0, duration: 0.6, ease: 'power2.out', delay: 0.08 })
})
</script>

<template>
  <!-- Full viewport on desktop; comfortable stack on mobile -->
  <section class="bg-sand lg:min-h-screen">
    <div class="mx-auto max-w-[1440px] grid grid-cols-1 lg:grid-cols-2 lg:h-screen">
      <!-- LEFT: image slider -->
      <div class="relative h-[56vh] sm:h-[60vh] lg:h-screen sectors-left">
        <Swiper :modules="[Autoplay]" :slides-per-view="1" :loop="true" :speed="700" :allow-touch-move="false"
          :autoplay="{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: false   // keep autoplay when hovering the image
          }" @swiper="(sw) => (swiperRef = sw)" @slideChange="onSlideChange" class="h-full">
          <SwiperSlide v-for="(s, i) in sectors" :key="i" class="relative">
            <img :src="s.img" class="w-full h-full object-cover" :alt="s.label" />
            <!-- vignette overlay so overlay copy stays readable -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent pointer-events-none" />
          </SwiperSlide>
        </Swiper>

        <!-- Overlay copy: Flooring for + Active sector (synced) -->
        <div class="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-white drop-shadow-lg">
          <div class="text-2xl sm:text-3xl font-medium">Flooring for</div>
          <transition name="fade-slide" mode="out-in">
            <div :key="current.label" class="text-4xl sm:text-5xl font-semibold mt-1">
              {{ current.label }}
            </div>
          </transition>
        </div>
      </div>

      <!-- RIGHT: list (5-window) + single blurb + links (links pinned to bottom) -->
      <div class="bg-[#D5CEC4] p-8 sm:p-10 lg:p-14 relative sectors-right flex flex-col">
        <div class="flex-1 flex flex-col">
          <p class="text-xs sm:text-sm uppercase tracking-wide mb-6">Sectors</p>

          <!-- 5-row window, active always the middle row -->
          <div class="relative">
            <!-- top/bottom fades -->
            <div
              class="pointer-events-none absolute -top-3 left-0 right-0 h-8 bg-gradient-to-b from-[#D5CEC4] to-transparent" />
            <div
              class="pointer-events-none absolute -bottom-3 left-0 right-0 h-8 bg-gradient-to-t from-[#D5CEC4] to-transparent" />

            <!-- tighter line spacing + stable row heights -->
            <ul class="relative grid grid-rows-5 gap-1.5 sm:gap-2 mb-6 select-none">
              <li v-for="(s, idx) in visibleSectors" :key="`${s.i}-${s.label}`"
                class="h-[2.8rem] sm:h-[3rem] flex items-center">
                <button
                  class="w-full text-left text-[clamp(20px,3.6vw,40px)] font-semibold leading-tight whitespace-nowrap transition will-change-transform"
                  :class="idx === 2 ? 'text-black' : 'text-white/65'" @mouseenter="to(s.i)" @focus="to(s.i)">
                  {{ s.label }}
                </button>
              </li>
            </ul>
          </div>

          <!-- Single blurb for active sector (no stack, no scroll) -->
          <transition name="fade-slide" mode="out-in">
            <p :key="current.label" class="mt-1 text-[13.5px] leading-[1.5] tracking-[0.01em] text-black/80">
              {{ current.blurb }}
            </p>
          </transition>
        </div>

        <!-- BOTTOM: CTAs pinned -->
        <div class="mt-8 pt-4 flex items-center gap-5">
          <a class="inline-flex items-center gap-2 px-5 py-3 bg-white rounded-md shadow-sm hover:shadow transition"
            :href="caseHref">
            Read more <span aria-hidden>→</span>
          </a>
          <a class="underline" :href="caseHref">{{ caseText }}</a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* overlay text swap */
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 220ms cubic-bezier(.2, .7, .2, 1);
}
</style>