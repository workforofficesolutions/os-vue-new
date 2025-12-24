<template>
  <main class="w-full max-w-none">
    <!-- BLOCK 1 – HERO / INTRO (full screen) -->
    <section ref="heroRef" class="relative w-full min-h-screen overflow-hidden">
      <video
        v-if="hero.video"
        :src="hero.video"
        class="absolute inset-0 w-full h-full object-cover"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        :poster="hero.poster || hero.image"
      />
      <img
        v-else
        :src="hero.image"
        :alt="hero.title"
        class="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div class="absolute inset-0 bg-black/45"></div>

      <div class="relative z-10 flex items-center justify-center text-center px-4 min-h-screen">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
            {{ hero.title }}
          </h1>
          <div class="mt-6 w-14 h-px bg-white/70 mx-auto"></div>
        </div>
      </div>

      <!-- Minimal scroll cue -->
      <button
        type="button"
        class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90"
        @click="scrollToContent"
        aria-label="Scroll to our story"
      >
        <span
          class="text-[11px] sm:text-xs tracking-wide bg-black/30 border border-white/20 px-3 py-1 backdrop-blur-sm"
        >
          Scroll to our story
        </span>
        <span class="hero-arrow animate-bounce" aria-hidden="true">↓</span>
      </button>
    </section>

    <!-- CONTENT WRAP (keeps header height correct) -->
    <section
      ref="contentRef"
      class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
      style="padding-top: calc(var(--header-height, 72px) + var(--header-gap, 32px))"
    >
      <div class="mx-auto max-w-6xl">
        <!-- BLOCK 2 – ABOUT THE BRAND -->
        <section class="mt-10 sm:mt-12 md:mt-16">
          <div class="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
            <div class="lg:col-span-6">
              <div class="relative w-full overflow-hidden border border-neutral-900/35 bg-transparent">
                <div class="relative w-full aspect-[4/3]">
                  <img
                    :src="blocks.about.image"
                    alt="Office Solutions – Our story"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="lg:col-span-6">
              <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                {{ blocks.about.heading }}
              </h2>
              <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

              <div class="space-y-4">
                <template v-for="(b, bi) in aboutBlocks" :key="`about-b-${bi}`">
                  <p
                    v-if="b.type === 'p'"
                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                  >
                    <template v-for="(t, ti) in b.tokens" :key="`about-t-${bi}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </p>

                  <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                    <li v-for="(it, ii) in b.items" :key="`about-ul-${bi}-${ii}`">
                      <template v-for="(t, ti) in it" :key="`about-ul-t-${bi}-${ii}-${ti}`">
                        <strong v-if="t.bold">{{ t.text }}</strong>
                        <span v-else>{{ t.text }}</span>
                      </template>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- BLOCK 3 – WHAT WE STAND FOR -->
        <section class="mt-12 sm:mt-14 md:mt-16">
          <div class="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
            <div class="lg:col-span-6 lg:order-2">
              <div class="relative w-full overflow-hidden border border-neutral-900/35 bg-transparent">
                <div class="relative w-full aspect-[4/3]">
                  <img
                    :src="blocks.values.image"
                    alt="Office Solutions – Values"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="lg:col-span-6 lg:order-1">
              <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                {{ blocks.values.heading }}
              </h2>
              <div class="w-12 h-px bg-neutral-700 mt-4 mb-8"></div>

              <div class="grid gap-6">
                <article
                  v-for="(v, i) in blocks.values.items"
                  :key="`val-${i}`"
                  class="border border-neutral-900/35 bg-transparent p-5"
                >
                  <h3 class="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">
                    {{ v.title }}
                  </h3>
                  <div class="w-10 h-px bg-neutral-700 mt-3 mb-4"></div>

                  <div class="space-y-3">
                    <template v-for="(b, bi) in valueBlocks(v.body)" :key="`valb-${i}-${bi}`">
                      <p
                        v-if="b.type === 'p'"
                        class="text-[0.95rem] sm:text-base leading-relaxed text-neutral-800"
                      >
                        <template v-for="(t, ti) in b.tokens" :key="`valt-${i}-${bi}-${ti}`">
                          <strong v-if="t.bold">{{ t.text }}</strong>
                          <span v-else>{{ t.text }}</span>
                        </template>
                      </p>
                      <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                        <li v-for="(it, ii) in b.items" :key="`valul-${i}-${bi}-${ii}`">
                          <template v-for="(t, ti) in it" :key="`valul-t-${i}-${bi}-${ii}-${ti}`">
                            <strong v-if="t.bold">{{ t.text }}</strong>
                            <span v-else>{{ t.text }}</span>
                          </template>
                        </li>
                      </ul>
                    </template>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- BLOCK 4 – INNOVATION & FUTURE FOCUS -->
        <section class="mt-12 sm:mt-14 md:mt-16">
          <div class="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
            <div class="lg:col-span-6">
              <div class="relative w-full overflow-hidden border border-neutral-900/35 bg-transparent">
                <div class="relative w-full aspect-[4/3]">
                  <img
                    :src="blocks.future.image"
                    alt="Office Solutions – Where floors matter"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="lg:col-span-6">
              <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                {{ blocks.future.heading }}
              </h2>
              <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

              <div class="space-y-4">
                <template v-for="(b, bi) in futureBlocks" :key="`fut-b-${bi}`">
                  <p
                    v-if="b.type === 'p'"
                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                  >
                    <template v-for="(t, ti) in b.tokens" :key="`fut-t-${bi}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </p>

                  <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                    <li v-for="(it, ii) in b.items" :key="`fut-ul-${bi}-${ii}`">
                      <template v-for="(t, ti) in it" :key="`fut-ul-t-${bi}-${ii}-${ti}`">
                        <strong v-if="t.bold">{{ t.text }}</strong>
                        <span v-else>{{ t.text }}</span>
                      </template>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- BLOCK 5 – SUSTAINABILITY -->
        <section class="mt-12 sm:mt-14 md:mt-16">
          <div class="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
            <div class="lg:col-span-6 lg:order-2">
              <div class="relative w-full overflow-hidden border border-neutral-900/35 bg-transparent">
                <div class="relative w-full aspect-[4/3]">
                  <img
                    :src="blocks.sustainability.image"
                    alt="Office Solutions – Sustainability"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="lg:col-span-6 lg:order-1">
              <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                {{ blocks.sustainability.heading }}
              </h2>
              <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

              <div class="space-y-4">
                <template v-for="(b, bi) in sustainabilityBlocks" :key="`sus-b-${bi}`">
                  <p
                    v-if="b.type === 'p'"
                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                  >
                    <template v-for="(t, ti) in b.tokens" :key="`sus-t-${bi}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </p>

                  <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                    <li v-for="(it, ii) in b.items" :key="`sus-ul-${bi}-${ii}`">
                      <template v-for="(t, ti) in it" :key="`sus-ul-t-${bi}-${ii}-${ti}`">
                        <strong v-if="t.bold">{{ t.text }}</strong>
                        <span v-else>{{ t.text }}</span>
                      </template>
                    </li>
                  </ul>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- BLOCK 6 – CLOSING CTA -->
        <section class="mt-12 sm:mt-14 md:mt-16 border-t border-neutral-200 pt-10 sm:pt-12">
          <div class="grid gap-10 lg:gap-12 lg:grid-cols-12 items-start">
            <div class="lg:col-span-6">
              <div class="relative w-full overflow-hidden border border-neutral-900/35 bg-transparent">
                <div class="relative w-full aspect-[4/3]">
                  <img
                    :src="blocks.cta.image"
                    alt="Office Solutions – Explore products"
                    class="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            <div class="lg:col-span-6">
              <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                {{ blocks.cta.heading }}
              </h2>
              <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

              <p class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                {{ blocks.cta.body }}
              </p>

              <div class="mt-8">
                <a
                  :href="blocks.cta.href"
                  class="relative overflow-hidden inline-flex items-center gap-3 border border-neutral-900 px-5 py-3 text-sm sm:text-base text-neutral-900 group"
                >
                  <span
                    class="absolute inset-0 bg-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"
                  ></span>
                  <span class="relative z-10 group-hover:text-white transition-colors duration-300">
                    {{ blocks.cta.buttonText }}
                  </span>
                  <span class="relative z-10 group-hover:text-white transition-colors duration-300">→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

// Rich text helpers (same pattern as ProductDetail.vue / OurTeam.vue)
const parseInlineBold = (text = '') => {
  const s = String(text)
  if (!s) return []
  const parts = s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)
  return parts.map((p) => {
    const bold = p.startsWith('**') && p.endsWith('**') && p.length >= 4
    return { text: bold ? p.slice(2, -2) : p, bold }
  })
}

const richTextBlocks = (raw = '') => {
  const s = String(raw || '')
  if (!s.trim()) return []

  const blocks = s
    .split(/\n\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean)

  return blocks.map((b) => {
    const lines = b
      .split(/\n+/g)
      .map((x) => x.trim())
      .filter(Boolean)

    if (lines.length > 1) {
      return {
        type: 'ul',
        items: lines.map((l) => parseInlineBold(l.replace(/^[-•]\s+/, '').trim())),
      }
    }

    return {
      type: 'p',
      tokens: parseInlineBold(lines[0] || ''),
    }
  })
}

const valueBlocks = (raw) => richTextBlocks(raw)

// Page data
// Put your images and video into `/public/about/our-story/` and update these paths as needed.
const hero = {
  title: 'Our Story',
  // Hero video (recommended). Put your file at: /public/about/our-story/hero.mp4
  video: '/about/our-team/our-team.mp4',
  // Poster image shown while video loads
  poster: '/about/our-team/team-photo.jpg',
  // Fallback image if video is removed
  image: '/about/our-team/team-photo.jpg',
}

const blocks = {
  about: {
    heading: 'Our Story',
    image: '/about/our-story/block-02.webp',
    body:
      'Established in 2012, Office Solutions has grown into one of the UAE’s trusted names in flooring. We deliver high quality, durable, and visually refined solutions across residential, commercial, hospitality, healthcare, and industrial projects. With every project, our focus remains on creating spaces that balance performance with design.',
  },
  values: {
    heading: 'What we stand for',
    image: '/about/our-story/block-03.webp',
    items: [
      {
        title: 'Proven Expertise and Trusted Partnerships',
        body:
          'Office Solutions combines years of experience with deep industry knowledge to support developers, architects, and contractors in delivering flooring solutions that meet high standards of performance and design.',
      },
      {
        title: 'Premium Flooring Selection',
        body:
          'We provide a carefully chosen range of internationally recognised products, ensuring each option offers quality, durability, and a refined aesthetic for every space.',
      },
      {
        title: 'Comprehensive Client Support',
        body:
          'Our team works alongside clients from initial consultation to installation and after sales, offering guidance and support at every step to achieve efficient and reliable outcomes.',
      },
      {
        title: 'Assured Quality and Warranty',
        body:
          'Sourcing from top manufacturers, our flooring solutions are durable and backed by comprehensive warranties, giving clients confidence in long lasting performance.',
      },
      {
        title: 'Enduring Client Relationships',
        body:
          'By maintaining a consistent focus on service, trust, and project excellence, we foster strong and lasting relationships with clients across all sectors.',
      },
    ],
  },
  future: {
    heading: 'Where Floors Matter',
    image: '/about/our-story/block-04.webp',
    body:
      'At Office Solutions, our goal is to make flooring selection and installation straightforward and reliable. We work closely with developers, architects, contractors, and homeowners to deliver solutions that combine quality, durability, and aesthetic appeal. Our team supports every project from consultation and material selection to installation and after sales care, ensuring a smooth experience and outstanding results.\n\nWe believe every space has its own potential, and flooring is the foundation for comfort, style, and functionality. By offering carefully curated products from globally recognised brands and applying our industry expertise, we help our clients create environments that are both practical and visually engaging.',
  },
  sustainability: {
    heading: 'Sustainability',
    image: '/about/our-story/block-05.webp',
    body:
      'We are committed to ecofriendly practices through sustainable sourcing, waste reduction, and adherence to green building standards. Every flooring selection and solution is developed with responsibility in mind, supporting healthier environments for future generations.',
  },
  cta: {
    heading: 'Every space starts with a strong foundation',
    image: '/about/our-story/block-06.webp',
    body:
      'Discover our flooring range, featuring premium products for residential, commercial, and industrial environments.',
    buttonText: 'Browse our solutions',
    href: '/products',
  },
}

const aboutBlocks = computed(() => richTextBlocks(blocks.about.body))
const futureBlocks = computed(() => richTextBlocks(blocks.future.body))
const sustainabilityBlocks = computed(() => richTextBlocks(blocks.sustainability.body))

// Hero/header behaviour (same wiring as OurTeam.vue)
const heroRef = ref(null)
const contentRef = ref(null)

const scrollToContent = () => {
  const el = contentRef.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let io = null
const BODY_CLASS = 'page-our-story'
const HERO_CLASS = 'os-hero-top'

onMounted(() => {
  document.title = 'Our Story – Office Solutions'

  document.body.classList.add(BODY_CLASS)

  const heroEl = heroRef.value
  if (heroEl && typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle(HERO_CLASS, !!entry?.isIntersecting)
      },
      { threshold: 0.6 }
    )
    io.observe(heroEl)
  } else {
    document.body.classList.add(HERO_CLASS)
  }
})

onBeforeUnmount(() => {
  try {
    if (io) io.disconnect()
  } catch (_) { /* no-op */ }

  document.body.classList.remove(HERO_CLASS)
  document.body.classList.remove(BODY_CLASS)
})
</script>

<style scoped>
.hero-arrow {
  font-size: 18px;
  line-height: 1;
  padding: 2px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(6px);
}

/* Transparent header wiring (same as OurTeam.vue) */
:global(body.os-hero-top header),
:global(body.os-hero-top header[role="banner"]),
:global(body.os-hero-top .site-header),
:global(body.os-hero-top .app-header),
:global(body.os-hero-top .header),
:global(body.os-hero-top .navbar) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.28) !important;
}

:global(body.os-hero-top header *),
:global(body.os-hero-top header[role="banner"] *),
:global(body.os-hero-top .site-header *),
:global(body.os-hero-top .app-header *),
:global(body.os-hero-top .header *),
:global(body.os-hero-top .navbar *) {
  border-top: 0 !important;
  border-bottom: 0 !important;
  box-shadow: none !important;
}

:global(body.os-hero-top nav) {
  background: transparent !important;
  border: 0 !important;
  box-shadow: none !important;
}

:global(body.os-hero-top header::before),
:global(body.os-hero-top header::after),
:global(body.os-hero-top .site-header::before),
:global(body.os-hero-top .site-header::after),
:global(body.os-hero-top .app-header::before),
:global(body.os-hero-top .app-header::after),
:global(body.os-hero-top .navbar::before),
:global(body.os-hero-top .navbar::after),
:global(body.os-hero-top nav::before),
:global(body.os-hero-top nav::after) {
  border-top: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

:global(body.os-hero-top header *),
:global(body.os-hero-top .site-header *),
:global(body.os-hero-top .app-header *),
:global(body.os-hero-top .header *),
:global(body.os-hero-top .navbar *),
:global(body.os-hero-top nav *) {
  color: #fff !important;
}

:global(body.os-hero-top header svg),
:global(body.os-hero-top .site-header svg),
:global(body.os-hero-top .app-header svg),
:global(body.os-hero-top .header svg),
:global(body.os-hero-top .navbar svg),
:global(body.os-hero-top nav svg) {
  fill: #fff !important;
  stroke: #fff !important;
}

:global(body.os-hero-top header img),
:global(body.os-hero-top nav img),
:global(body.os-hero-top .site-header img),
:global(body.os-hero-top .app-header img),
:global(body.os-hero-top .navbar img),
:global(body.os-hero-top .header img),
:global(body.os-hero-top .logo-zoom img),
:global(body.os-hero-top .site-logo img),
:global(body.os-hero-top .brand-logo img),
:global(body.os-hero-top .header-logo img),
:global(body.os-hero-top .logo img),
:global(body.os-hero-top img[src*="/hero/os-logo-trans"]),
:global(body.os-hero-top img[src*="os-logo-trans"]) {
  filter: brightness(0) invert(1) contrast(1.05) !important;
  transition: filter 200ms ease;
}
</style>