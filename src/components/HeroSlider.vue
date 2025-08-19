<script setup>
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

/** Keep autoplay delay in one place so CSS animation matches it exactly */
const AUTOPLAY_DELAY = 5000

const slides = [
  {
    video: '/hero/slide1.mp4',
    badgeText: '',
    headline: 'Moving Flooring Forward',
    title: '',
    subtitle: '',
    link: { text: '', url: '' }
  },
  {
    image: '/hero/slide2.jpg',
    badgeText: 'Featured',
    title: 'Project Three',
    subtitle: '—',
    link: { text: 'View case study', url: '#' }
  },
  {
    image: '/hero/slide3.jpg',
    headline: 'Introducing Kinetex®',
    subtitle: 'New product range by J+J',
    description:
      'Crafted from recycled PET and fully recyclable in Aotearoa, Kinetex® carpet blends the softness of textiles with exceptional durability.',
    link: { text: 'Read article', url: '#' }

  },
  {
    video: '/hero/slide4.mp4',
    title: 'Project Four',
    subtitle: '—',
    link: { text: 'View case study', url: '#' }
  }
]

// (dev aid) enforce one of image|video
slides.forEach((s, i) => {
  if (s.image && s.video) console.warn(`[HeroSlider] Slide ${i}: use either 'image' or 'video' (video will render).`)
  if (!s.image && !s.video) console.warn(`[HeroSlider] Slide ${i}: missing media (image or video required).`)
})

const paginationEl = ref(null)
</script>

<template>
  <section class="relative h-screen min-h-[600px]" id="hero">
    <Swiper :modules="[Autoplay, Pagination]" :loop="true"
      :autoplay="{ delay: AUTOPLAY_DELAY, disableOnInteraction: false }" :speed="1500" effect="slide"
      :pagination="{ el: paginationEl, clickable: true }" class="h-full"
      :style="{ '--hero-autoplay-delay': AUTOPLAY_DELAY + 'ms' }">
      <!-- isActive from Swiper controls overlay visibility -->
      <SwiperSlide v-for="(s, i) in slides" :key="i" v-slot="{ isActive }">
        <!-- Background media -->
        <div class="absolute inset-0">
          <video v-if="s.video" :src="s.video" class="w-full h-full object-cover" autoplay muted loop playsinline
            preload="metadata" />
          <img v-else :src="s.image" class="w-full h-full object-cover" :alt="s.alt || ''" />
          <div class="absolute inset-0 bg-black/30"></div>
        </div>

        <!-- Centered headline -->
        <div v-if="s.headline"
          class="absolute inset-0 flex items-center justify-center text-center text-white px-4 pointer-events-none transition-opacity duration-300"
          :class="isActive ? 'opacity-100' : 'opacity-0'">
          <span class="text-5xl md:text-7xl font-bold drop-shadow-lg">
            {{ s.headline }}
          </span>
        </div>

        <!-- Bottom-left stack -->
        <div
          class="absolute left-6 sm:left-8 bottom-8 sm:bottom-10 text-white max-w-xl space-y-2 transition-opacity duration-300"
          :class="isActive ? 'opacity-100' : 'opacity-0'">
          <p v-if="s.badgeText" class="uppercase text-sm tracking-wide2 opacity-50">
            {{ s.badgeText }}
          </p>

          <!-- Title made same size as subtitle -->
          <h3 v-if="s.title" class="text-sm md:text-base font-light">
            {{ s.title }}
          </h3>

          <p v-if="s.subtitle" class="text-sm md:text-base opacity-50">
            {{ s.subtitle }}
          </p>

          <p v-if="s.description" class="text-white/90">
            {{ s.description }}
          </p>

          <div v-if="s.link" class="pt-2">
            <a :href="s.link.url" class="underline">
              {{ s.link.text }}
            </a>
          </div>

          <!-- keep pagination anchor inside the content block -->
          <div ref="paginationEl" class="pt-6"></div>
        </div>
      </SwiperSlide>
    </Swiper>

    <div class="absolute inset-0 rounded-lg overflow-hidden pointer-events-none"></div>
  </section>
</template>

<style scoped>
/* ---- Pagination positioning (unchanged) ---- */
:deep(.swiper-pagination) {
  left: 1.8rem !important;
  right: auto !important;
  bottom: 1rem !important;
  width: auto !important;
  display: flex !important;
  justify-content: flex-start !important;
}

/* ---- Bullets as thin bars ---- */
:deep(.swiper-pagination-bullet) {
  position: relative;
  width: 28px;
  height: 2px;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.25);
  /* base track */
  overflow: hidden;
  /* hide the filling bar overflow */
  margin: 0 2px !important;
}

/* The filling color bar (progress) */
:deep(.swiper-pagination-bullet)::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 0%;
  background: #CD9268;
  /* your brand color */
}

/* Animate only the active bullet to fill over the autoplay delay */
:deep(.swiper-pagination-bullet-active)::after {
  animation: bulletFill var(--hero-autoplay-delay) linear forwards;
}

/* When a bullet becomes inactive, ensure it's reset (no lingering fill) */
:deep(.swiper-pagination-bullet:not(.swiper-pagination-bullet-active))::after {
  width: 0%;
  animation: none;
}

@keyframes bulletFill {
  from {
    width: 0%;
  }

  to {
    width: 100%;
  }
}
</style>