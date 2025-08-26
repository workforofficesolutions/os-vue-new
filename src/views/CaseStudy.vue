<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { getCaseStudyBySlug } from '../data/caseStudies'

const route = useRoute()
const study = computed(() => getCaseStudyBySlug(route.params.slug))

if (study.value) document.title = `${study.value.title} – Case Study`
</script>

<template>
    <div class="mx-auto max-w-5xl px-4 py-10">
        <RouterLink to="/case-studies" class="text-sm underline underline-offset-4">← All case studies</RouterLink>

        <div v-if="study">
            <h1 class="mt-3 text-3xl font-semibold">{{ study.title }}</h1>
            <p class="mt-1 text-neutral-600">{{ study.sector }}</p>

            <div class="mt-8 grid gap-6 md:grid-cols-3">
                <img :src="study.image" :alt="study.title" class="md:col-span-2 w-full rounded-xl object-cover" />
                <img :src="study.material" :alt="`${study.title} material`" class="w-full rounded-xl object-cover" />
            </div>
        </div>

        <div v-else class="py-20 text-center">
            <h2 class="text-xl font-medium">Case study not found.</h2>
            <RouterLink to="/case-studies" class="mt-3 inline-block underline">Back to list</RouterLink>
        </div>
    </div>
</template>
