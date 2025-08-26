<template>
    <div class="mx-auto max-w-7xl px-4 py-10">
        <div class="mb-8 flex items-baseline justify-between">
            <h1 class="text-3xl font-semibold">Case studies</h1>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <RouterLink v-for="p in caseStudies" :key="p.slug" :to="`/case-studies/${p.slug}`"
                class="block rounded-2xl border border-neutral-200 bg-[#EFE9DF] p-5 hover:shadow">
                <img :src="p.image" :alt="p.title" class="h-56 w-full rounded-xl object-cover" />
                <h3 class="mt-4 text-lg font-semibold">{{ p.title }}</h3>
                <p class="text-sm text-neutral-600">{{ p.sector }}</p>
            </RouterLink>
        </div>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { caseStudies } from '../data/caseStudies'
</script>
