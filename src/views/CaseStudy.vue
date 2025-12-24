<script setup>
import { computed, watchEffect, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getCaseStudyBySlug } from '../data/caseStudies'

const route = useRoute()

// Gallery (one image at a time)
const galleryIndex = ref(0)
const galleryTotal = computed(() => (study.value?.gallery || []).length)
const galleryCurrent = computed(() => (study.value?.gallery || [])[galleryIndex.value] || '')

const nextGallery = () => {
  if (!galleryTotal.value) return
  galleryIndex.value = (galleryIndex.value + 1) % galleryTotal.value
}

const prevGallery = () => {
  if (!galleryTotal.value) return
  galleryIndex.value = (galleryIndex.value - 1 + galleryTotal.value) % galleryTotal.value
}

// Reset gallery on route change
watch(
  () => String(route.params.slug || ''),
  () => {
    galleryIndex.value = 0
  }
)

const rawStudy = computed(() => getCaseStudyBySlug(String(route.params.slug || '')))

// Parse inline bold markers: **bold** (no v-html needed)
const parseInlineBold = (text = '') => {
  const s = String(text)
  if (!s) return []

  // Split and keep **...** tokens
  const parts = s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((p) => {
    const bold = p.startsWith('**') && p.endsWith('**') && p.length >= 4
    return { text: bold ? p.slice(2, -2) : p, bold }
  })
}

// Split by blank lines into blocks; within a block:
// - multiple lines => bullet list
// - single line => paragraph
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

    // Bullet list
    if (lines.length > 1) {
      return {
        type: 'ul',
        items: lines.map((l) => parseInlineBold(l.replace(/^[-•]\s+/, '').trim())),
      }
    }

    // Paragraph
    return {
      type: 'p',
      tokens: parseInlineBold(lines[0] || ''),
    }
  })
}

// Normalize to support BOTH shapes:
// 1) Flat fields (legacy)
// 2) Nested `detail` structure (hero/overview/flooring/challenges/outcomes/gallery/closingCta)
const study = computed(() => {
  const s = rawStudy.value
  if (!s) return null

  const d = s.detail || {}

  const hero = d.hero || {}
  const overview = d.overview || {}
  const meta = overview.meta || {}

  const flooring = d.flooring || {}
  const challenges = d.challenges || {}
  const outcomes = d.outcomes || {}
  const gallery = d.gallery || {}

  // Some older shapes may use `cta`, while the new structure uses `closingCta`.
  const closingCta = s.cta || d.closingCta || (d.cta && d.cta.text) || ''

  return {
    ...s,

    // HERO
    title: s.title || hero.title || '',
    heroImage: s.heroImage || hero.heroImage || s.image || '',
    sector: s.sector || hero.sector || '',
    subSector: s.subSector || hero.subSector || '',

    // OVERVIEW
    overviewHeading: overview.heading || 'Project Overview',
    overviewBody: s.overview || overview.intro || '',
    client: s.client || meta.client || '',
    designFirm: s.designFirm || meta.designFirm || '',
    completed: s.completed || meta.completed || '',
    size: s.size || meta.size || '',
    location: s.location || meta.location || '',

    // FLOORING
    flooringHeading: flooring.heading || 'Flooring Solution Provided',
    flooringBody: s.flooringRationale || flooring.body || '',
    productsUsed: s.productsUsed || flooring.productsUsed || [],
    flooringMaterial: s.flooringMaterial || flooring.flooringMaterial || '',
    brands: s.brands || flooring.brands || [],

    // CHALLENGES
    challengesHeading: challenges.heading || 'Challenges & Solutions',
    challengesBody: s.challenges || challenges.body || '',

    // OUTCOMES
    outcomesHeading: outcomes.heading || 'Project Outcomes',
    outcomes: s.outcomes || outcomes.bullets || [],

    // GALLERY
    galleryHeading: gallery.heading || 'Image Gallery',
    gallery: s.gallery || gallery.images || [],

    // CTA
    closingCta,
  }
})

const overviewBlocks = computed(() => richTextBlocks(study.value?.overviewBody || ''))
const flooringBlocks = computed(() => richTextBlocks(study.value?.flooringBody || ''))
const challengesBlocks = computed(() => richTextBlocks(study.value?.challengesBody || ''))
const closingCtaBlocks = computed(() => richTextBlocks(study.value?.closingCta || ''))

const outcomesTokens = (o) => parseInlineBold(o)
const tokensFromText = (t) => parseInlineBold(t)

watchEffect(() => {
  if (study.value) document.title = `${study.value.title} – Case Study`
})
</script>

<template>
  <main class="w-full max-w-none pb-16">
    <div v-if="study">
      <!-- BLOCK 1 – HERO (full-frame backdrop) -->
      <section class="relative w-full overflow-hidden" :style="{ minHeight: '100vh' }">
        <img
          :src="study.heroImage"
          :alt="study.title"
          class="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-black/45"></div>

        <div class="relative z-10 flex items-center justify-center text-center px-4" :style="{ minHeight: '100vh' }">
          <div class="max-w-4xl mx-auto">
            <div v-if="study.subSector" class="mb-4">
              <span class="inline-flex items-center rounded-none border border-white/35 bg-white/10 px-3 py-1 text-xs sm:text-sm text-white">
                {{ study.subSector }}
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
              {{ study.title }}
            </h1>

            <div v-if="study.sector" class="mt-4">
              <span class="inline-flex items-center rounded-none border border-white/35 bg-white/10 px-3 py-1 text-xs sm:text-sm text-white">
                <span class="font-semibold">{{ study.sector }}</span>
              </span>
            </div>
          </div>
        </div>
      </section>
      <div class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <div class="mx-auto max-w-6xl">
          <!-- BLOCK 2 – PROJECT OVERVIEW -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <div class="grid gap-8 md:grid-cols-3">
              <div class="md:col-span-2">
                <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                  {{ study.overviewHeading }}
                </h2>
                <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

                <div class="space-y-4">
                  <template v-for="(b, bi) in overviewBlocks" :key="`ov-b-${bi}`">
                    <p
                      v-if="b.type === 'p'"
                      class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                    >
                      <template v-for="(t, ti) in b.tokens" :key="`ov-t-${bi}-${ti}`">
                        <strong v-if="t.bold">{{ t.text }}</strong>
                        <span v-else>{{ t.text }}</span>
                      </template>
                    </p>

                    <ul
                      v-else
                      class="list-disc pl-6 space-y-2 text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                    >
                      <li v-for="(item, ii) in b.items" :key="`ov-li-${bi}-${ii}`">
                        <template v-for="(t, ti) in item" :key="`ov-li-t-${bi}-${ii}-${ti}`">
                          <strong v-if="t.bold">{{ t.text }}</strong>
                          <span v-else>{{ t.text }}</span>
                        </template>
                      </li>
                    </ul>
                  </template>
                </div>
              </div>

              <!-- FACTS -->
              <aside class="md:col-span-1">
                <div class="border border-neutral-900/25 bg-transparent rounded-none p-5">
                  <p class="text-sm font-semibold text-neutral-900 mb-4">Project Details</p>
                  <dl class="space-y-3 text-sm text-neutral-800">
                    <div v-if="study.client" class="flex justify-between gap-4">
                      <dt class="text-neutral-600">Client</dt>
                      <dd class="text-right">{{ study.client }}</dd>
                    </div>
                    <div v-if="study.designFirm" class="flex justify-between gap-4">
                      <dt class="text-neutral-600">Design firm</dt>
                      <dd class="text-right">{{ study.designFirm }}</dd>
                    </div>
                    <div v-if="study.completed" class="flex justify-between gap-4">
                      <dt class="text-neutral-600">Completed</dt>
                      <dd class="text-right">{{ study.completed }}</dd>
                    </div>
                    <div v-if="study.size" class="flex justify-between gap-4">
                      <dt class="text-neutral-600">Size</dt>
                      <dd class="text-right">{{ study.size }}</dd>
                    </div>
                    <div v-if="study.location" class="flex justify-between gap-4">
                      <dt class="text-neutral-600">Location</dt>
                      <dd class="text-right">{{ study.location }}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </div>
          </section>

          <!-- BLOCK 3 – FLOORING SOLUTION PROVIDED -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {{ study.flooringHeading }}
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <div class="space-y-4">
              <template v-for="(b, bi) in flooringBlocks" :key="`fl-b-${bi}`">
                <p
                  v-if="b.type === 'p'"
                  class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                >
                  <template v-for="(t, ti) in b.tokens" :key="`fl-t-${bi}-${ti}`">
                    <strong v-if="t.bold">{{ t.text }}</strong>
                    <span v-else>{{ t.text }}</span>
                  </template>
                </p>

                <ul
                  v-else
                  class="list-disc pl-6 space-y-2 text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                >
                  <li v-for="(item, ii) in b.items" :key="`fl-li-${bi}-${ii}`">
                    <template v-for="(t, ti) in item" :key="`fl-li-t-${bi}-${ii}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </li>
                </ul>
              </template>
            </div>

            <div class="mt-6 grid gap-6 md:grid-cols-2">
              <div class="border border-neutral-900/25 bg-transparent rounded-none p-5">
                <p class="text-sm font-semibold text-neutral-900 mb-2">Products used</p>
                <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-800">
                  <li v-for="(p, i) in (study.productsUsed || [])" :key="`pu-${i}`">
                    <template v-for="(t, ti) in tokensFromText(p)" :key="`pu-t-${i}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </li>
                </ul>
              </div>

              <div class="border border-neutral-900/25 bg-transparent rounded-none p-5">
                <p class="text-sm font-semibold text-neutral-900 mb-2">Flooring material</p>
                <p class="text-sm text-neutral-800 leading-relaxed">
                  {{ study.flooringMaterial || '—' }}
                </p>

                <div v-if="(study.brands || []).length" class="mt-4">
                  <p class="text-sm font-semibold text-neutral-900 mb-2">Brands</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(b, i) in study.brands"
                      :key="`br-${i}`"
                      class="inline-flex items-center rounded-none border border-neutral-200 bg-transparent px-3 py-1 text-xs text-neutral-800"
                    >
                      {{ b }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- BLOCK 4 – CHALLENGES & SOLUTIONS -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {{ study.challengesHeading }}
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <div v-if="challengesBlocks.length" class="space-y-4">
              <template v-for="(b, bi) in challengesBlocks" :key="`ch-b-${bi}`">
                <p
                  v-if="b.type === 'p'"
                  class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                >
                  <template v-for="(t, ti) in b.tokens" :key="`ch-t-${bi}-${ti}`">
                    <strong v-if="t.bold">{{ t.text }}</strong>
                    <span v-else>{{ t.text }}</span>
                  </template>
                </p>

                <ul
                  v-else
                  class="list-disc pl-6 space-y-2 text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                >
                  <li v-for="(item, ii) in b.items" :key="`ch-li-${bi}-${ii}`">
                    <template v-for="(t, ti) in item" :key="`ch-li-t-${bi}-${ii}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </li>
                </ul>
              </template>
            </div>
          </section>

          <!-- BLOCK 5 – PROJECT OUTCOMES -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {{ study.outcomesHeading }}
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <ul class="list-disc pl-6 space-y-2 text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
              <li
                v-for="(o, i) in (study.outcomes || [])"
                :key="`out-${i}`"
              >
                <template v-for="(t, ti) in outcomesTokens(o)" :key="`out-t-${i}-${ti}`">
                  <strong v-if="t.bold">{{ t.text }}</strong>
                  <span v-else>{{ t.text }}</span>
                </template>
              </li>
            </ul>
          </section>

          <!-- BLOCK 6 – IMAGE GALLERY -->
          <section v-if="(study.gallery || []).length" class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              {{ study.galleryHeading }}
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <!-- One image at a time (aligned with content container) -->
            <div class="group relative w-full border border-neutral-900/25 bg-transparent overflow-hidden rounded-none">
              <!-- 4:3 aspect ratio -->
              <div class="relative w-full pt-[75%]">
                <img
                  :src="galleryCurrent"
                  :alt="`${study.title} gallery image ${galleryIndex + 1}`"
                  class="absolute inset-0 w-full h-full object-cover block"
                  loading="lazy"
                />
              </div>

              <!-- Nav buttons (transparent, hover turns black) -->
              <button
                type="button"
                aria-label="Previous image"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-neutral-900/30 bg-transparent text-neutral-900 transition-colors hover:bg-black hover:text-white hover:border-black"
                @click="prevGallery"
              >
                <span class="text-xl leading-none">‹</span>
              </button>

              <button
                type="button"
                aria-label="Next image"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center border border-neutral-900/30 bg-transparent text-neutral-900 transition-colors hover:bg-black hover:text-white hover:border-black"
                @click="nextGallery"
              >
                <span class="text-xl leading-none">›</span>
              </button>
              <!-- Helper hint (buttons are subtle by default) -->
              <div
                class="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] sm:text-xs tracking-wide text-white/90 bg-black/40 border border-white/20 px-3 py-1 backdrop-blur-sm transition-opacity duration-300 animate-pulse group-hover:opacity-0"
              >
                Click the arrows to see more
              </div>
            </div>
          </section>

          <!-- BLOCK 7 – CLOSING CTA -->
          <section v-if="closingCtaBlocks.length" class="mt-12 sm:mt-14 md:mt-16 border-t border-neutral-200 pt-10 sm:pt-12">
            <div class="mx-auto max-w-4xl text-center space-y-4">
              <template v-for="(b, bi) in closingCtaBlocks" :key="`cta-b-${bi}`">
                <p
                  v-if="b.type === 'p'"
                  class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
                >
                  <template v-for="(t, ti) in b.tokens" :key="`cta-t-${bi}-${ti}`">
                    <strong v-if="t.bold">{{ t.text }}</strong>
                    <span v-else>{{ t.text }}</span>
                  </template>
                </p>

                <ul
                  v-else
                  class="list-disc pl-6 space-y-2 text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800 text-left"
                >
                  <li v-for="(item, ii) in b.items" :key="`cta-li-${bi}-${ii}`">
                    <template v-for="(t, ti) in item" :key="`cta-li-t-${bi}-${ii}-${ti}`">
                      <strong v-if="t.bold">{{ t.text }}</strong>
                      <span v-else>{{ t.text }}</span>
                    </template>
                  </li>
                </ul>
              </template>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div
      v-else
      class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 py-20 text-center"
    >
      <h2 class="text-xl font-medium text-neutral-900">Case study not found.</h2>
      <RouterLink
        to="/case-studies"
        class="mt-3 inline-block underline underline-offset-4 text-neutral-900"
      >
        Back to list
      </RouterLink>
    </div>
  </main>
</template>
