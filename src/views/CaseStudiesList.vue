<template>
  <main
    class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
    style="padding-top: calc(var(--header-height,72px) + var(--header-gap,32px))"
  >
    <!-- HERO / INTRO (match Designers' Choice styling) -->
    <section class="max-w-4xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
        Case studies
      </h1>
      <div class="w-12 h-px bg-neutral-700 mx-auto mb-6"></div>
      <p class="mx-auto max-w-2xl text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
        A curated selection of projects and applications that show how our materials perform in real spaces.
      </p>
    </section>

    <!-- GRID -->
    <section class="w-full mx-auto px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:gap-x-10 lg:gap-y-14">
        <article
          v-for="p in caseStudies"
          :key="p.slug"
          class="group text-left"
        >
          <RouterLink
          :to="`/case-studies/${p.slug}`"
          class="block"
          >
            <div class="relative w-full pt-[70%] border border-neutral-200 bg-white overflow-hidden">
              <img
                :src="p.image"
                :alt="p.title"
                class="absolute inset-0 w-full h-full object-cover block transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>

            <p class="mt-4 text-base md:text-lg font-semibold text-neutral-900">
              {{ p.title }}
            </p>
            <p class="text-sm text-neutral-700">
              {{ p.subSector }}
            </p>
            <p class="text-sm font-semibold text-neutral-900">
              {{ p.sector }}
            </p>
          </RouterLink>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { caseStudies } from '../data/caseStudies'
</script>
