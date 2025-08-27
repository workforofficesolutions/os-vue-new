<!-- src/components/Articles.vue -->
<template>
    <section class="bg-white">
        <div class="mx-auto max-w-[1440px] px-4 sm:px-6 py-10 sm:py-12">
            <!-- Header -->
            <div class="flex items-baseline justify-between mb-6 sm:mb-8">
                <h2 class="text-[28px] sm:text-[34px] md:text-[38px] font-semibold tracking-tight">
                    Featured articles
                </h2>
                <a href="/articles"
                    class="hidden sm:inline-block text-[15px] underline underline-offset-4 hover:no-underline">
                    View all
                </a>
            </div>

            <!-- Mobile: slider -->
            <div class="md:hidden">
                <Swiper :modules="[Pagination]" :slides-per-view="1.15" :space-between="12" class="overflow-visible">
                    <SwiperSlide v-for="(a, i) in list" :key="'m' + i">
                        <a :href="articleHref(a)" class="group block h-full">
                            <article class="border border-black/10 bg-white h-full flex flex-col">
                                <!-- Media -->
                                <figure class="relative overflow-hidden">
                                    <img :src="a.img" :alt="a.title"
                                        class="w-full h-[260px] object-cover transition-transform duration-500 group-hover:scale-[1.05] select-none"
                                        draggable="false" />
                                    <div
                                        class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    </div>

                                    <!-- badge -->
                                    <span
                                        class="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] px-2 py-1 uppercase tracking-wide">
                                        {{ a.type }}
                                    </span>

                                    <!-- VIEW → -->
                                    <div
                                        class="absolute bottom-2 right-2 flex items-center text-white text-[12px] font-medium">
                                        <span class="view-typed mr-1">VIEW</span>
                                        <span
                                            class="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                                    </div>
                                </figure>

                                <!-- Text -->
                                <div class="p-4 flex-1 flex flex-col">
                                    <h3 class="text-[16px] font-semibold leading-snug">
                                        {{ a.title }}
                                    </h3>
                                    <p class="mt-2 text-[13px] text-black/70 leading-relaxed">
                                        {{ a.desc }}
                                    </p>
                                </div>
                            </article>
                        </a>
                    </SwiperSlide>
                </Swiper>

                <!-- Mobile view all -->
                <div class="mt-4 sm:hidden">
                    <a href="/articles" class="inline-block text-[15px] underline underline-offset-4">
                        View all
                    </a>
                </div>
            </div>

            <!-- Desktop: 4-up grid -->
            <div class="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-[10px]">
                <a v-for="(a, i) in list" :key="'d' + i" :href="articleHref(a)" class="group block h-full">
                    <article class="border border-black/10 bg-white h-full flex flex-col">
                        <!-- Media -->
                        <figure class="relative overflow-hidden">
                            <img :src="a.img" :alt="a.title"
                                class="w-full h-[280px] lg:h-[300px] object-cover transition-transform duration-500 group-hover:scale-[1.05] select-none"
                                draggable="false" />
                            <div
                                class="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            </div>

                            <!-- badge -->
                            <span
                                class="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] px-2 py-1 uppercase tracking-wide">
                                {{ a.type }}
                            </span>

                            <!-- VIEW → -->
                            <div class="absolute bottom-2 right-2 flex items-center text-white text-[12px] font-medium">
                                <span class="view-typed mr-1">VIEW</span>
                                <span
                                    class="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                            </div>
                        </figure>

                        <!-- Text -->
                        <div class="p-4 sm:p-5 flex-1 flex flex-col">
                            <h3 class="text-[16px] sm:text-[17px] font-semibold leading-snug">
                                {{ a.title }}
                            </h3>
                            <p class="mt-2 text-[13px] text-black/70 leading-relaxed">
                                {{ a.desc }}
                            </p>
                        </div>
                    </article>
                </a>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

/* Optional prop: pass your own 4 articles */
const props = defineProps({
    items: {
        type: Array,
        default: () => []
    }
})

/* Fallback demo content (replace images with your assets) */
const fallback = [
    {
        type: 'News',
        title: 'More than a sports floor: VariUse by Grabo',
        desc:
            "In today’s education and community spaces, gyms need to do more than just host sports. Maximising use across events, assemblies, teaching and more, VariUse by Grabo is a versatile sports floor at a good price point.",
        img: '/articles/more-than-a-sports.avif'
    },
    {
        type: 'Expert Advice',
        title: 'A guide to slip resistance in flooring in access routes',
        desc:
            'Helping you understand the New Zealand Building Code and practical slip-resistance choices for busy access routes.',
        img: '/articles/a-guide-to-slip.avif'
    },
    {
        type: 'Expert Advice',
        title: 'Flooring’s role in acoustic comfort',
        desc:
            'Why flooring can be a critical contributor to better acoustic outcomes in learning and work environments.',
        img: '/articles/floorings-role.avif'
    },
    {
        type: 'News',
        title: 'New digital tools for designers',
        desc:
            'We’ve launched tools to streamline product selection, spark creativity and speed up specification.',
        img: '/articles/new-digital-tools.avif'
    }
]

const list = computed(() => (props.items && props.items.length ? props.items : fallback))

function slugify(s) {
    return String(s)
        .toLowerCase()
        .trim()
        .replace(/['"]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

function articleHref(a) {
    return `/articles/${slugify(a.title)}`
}
</script>

<style scoped>
/* Typewriter reveal for VIEW (no cursor) */
.view-typed {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
        "Courier New", monospace;
    display: inline-block;
    overflow: hidden;
    white-space: nowrap;
    width: 0ch;
    /* keep it hidden until hover */
    opacity: 0;
    transform: translateX(6px);
    transition: opacity 120ms ease, transform 220ms ease;
}

.group:hover .view-typed {
    animation: type-in 240ms steps(4, end) forwards;
    opacity: 1;
    transform: translateX(0);
}

@keyframes type-in {
    from {
        width: 0ch;
    }

    to {
        width: 4ch;
    }

    /* "VIEW" = 4 characters */
}
</style>
