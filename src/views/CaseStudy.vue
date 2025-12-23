<script setup>
import { computed, watchEffect } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getCaseStudyBySlug } from '../data/caseStudies'

const route = useRoute()

const rawStudy = computed(() => getCaseStudyBySlug(String(route.params.slug || '')))

// Normalize to support BOTH shapes:
// 1) Flat fields (current template)
// 2) Nested `detail` structure (hero/overview/flooring/challenges/outcomes/gallery/cta)
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
  const cta = d.cta || {}

  return {
    ...s,

    // HERO
    title: s.title || hero.title,
    heroImage: s.heroImage || hero.heroImage,
    sector: s.sector || hero.sector,
    subSector: s.subSector || hero.subSector,

    // OVERVIEW
    overview: s.overview || overview.text,
    client: s.client || meta.client,
    designFirm: s.designFirm || meta.designFirm,
    completed: s.completed || meta.completed,
    size: s.size || meta.size,
    location: s.location || meta.location,

    // FLOORING
    flooringIntro: s.flooringIntro || flooring.intro,
    productsUsed: s.productsUsed || flooring.productsUsed,
    flooringRationale: s.flooringRationale || flooring.rationale,

    // CHALLENGES
    challenges: s.challenges || challenges.text,

    // OUTCOMES
    outcomes: s.outcomes || outcomes.bullets,

    // GALLERY
    gallery: s.gallery || gallery.images,

    // CTA
    cta: s.cta || cta.text,
  }
})

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
          :src="study.heroImage || study.image"
          :alt="study.title"
          class="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div class="absolute inset-0 bg-black/45"></div>

        <div class="relative z-10 flex items-center justify-center text-center px-4" :style="{ minHeight: '100vh' }">
          <div class="max-w-4xl mx-auto">
            <div v-if="study.subSector" class="mb-4">
              <span class="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs sm:text-sm text-white">
                {{ study.subSector }}
              </span>
            </div>

            <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white">
              {{ study.title }}
            </h1>

            <div v-if="study.sector" class="mt-4">
              <span class="inline-flex items-center rounded-full border border-white/35 bg-white/10 px-3 py-1 text-xs sm:text-sm text-white">
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
                  Project Overview
                </h2>
                <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

                <p class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                  {{ study.overview || '' }}
                </p>
              </div>

              <!-- FACTS -->
              <aside class="md:col-span-1">
                <div class="border border-neutral-200 bg-white rounded-xl p-5">
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
              Flooring Solution Provided
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <p
              v-if="study.flooringIntro"
              class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
            >
              {{ study.flooringIntro }}
            </p>

            <div class="mt-6 grid gap-6 md:grid-cols-2">
              <div class="border border-neutral-200 bg-white rounded-xl p-5">
                <p class="text-sm font-semibold text-neutral-900 mb-2">Products used</p>
                <ul class="list-disc pl-5 space-y-1 text-sm text-neutral-800">
                  <li v-for="(p, i) in (study.productsUsed || [])" :key="`pu-${i}`">{{ p }}</li>
                </ul>
              </div>

              <div class="border border-neutral-200 bg-white rounded-xl p-5">
                <p class="text-sm font-semibold text-neutral-900 mb-2">Why it worked</p>
                <p class="text-sm text-neutral-800 leading-relaxed">
                  {{ study.flooringRationale || '' }}
                </p>
              </div>
            </div>
          </section>

          <!-- BLOCK 4 – CHALLENGES & SOLUTIONS -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Challenges &amp; Solutions
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <p
              v-if="study.challenges"
              class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
            >
              {{ study.challenges }}
            </p>
          </section>

          <!-- BLOCK 5 – PROJECT OUTCOMES -->
          <section class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Project Outcomes
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <ul class="grid gap-3 sm:grid-cols-2">
              <li
                v-for="(o, i) in (study.outcomes || [])"
                :key="`out-${i}`"
                class="border border-neutral-200 bg-white rounded-xl p-4 text-sm text-neutral-800 leading-relaxed"
              >
                {{ o }}
              </li>
            </ul>
          </section>

          <!-- BLOCK 6 – IMAGE GALLERY -->
          <section v-if="(study.gallery || []).length" class="mt-10 sm:mt-12 md:mt-16">
            <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
              Image Gallery
            </h2>
            <div class="w-12 h-px bg-neutral-700 mt-3 mb-6"></div>

            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div
                v-for="(img, i) in study.gallery"
                :key="`g-${i}`"
                class="relative w-full border border-neutral-200 bg-white overflow-hidden rounded-xl"
              >
                <img
                  :src="img"
                  :alt="`${study.title} gallery image ${i + 1}`"
                  class="w-full h-full object-cover block"
                  loading="lazy"
                />
              </div>
            </div>
          </section>

          <!-- BLOCK 7 – CLOSING CTA -->
          <section class="mt-12 sm:mt-14 md:mt-16 border-t border-neutral-200 pt-10 sm:pt-12">
            <p
              class="mx-auto max-w-4xl text-center text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800"
            >
              {{
                study.cta ||
                'This project is one of many examples of our expertise in shaping spaces that balance aesthetic vision with practical performance. Explore more of our case studies to learn how we support a diverse range of projects.'
              }}
            </p>

            <div class="mt-6 text-center">
              <RouterLink
                to="/case-studies"
                class="inline-flex items-center gap-2 underline underline-offset-4 text-neutral-900"
              >
                Explore more case studies
                <span aria-hidden="true">→</span>
              </RouterLink>
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
