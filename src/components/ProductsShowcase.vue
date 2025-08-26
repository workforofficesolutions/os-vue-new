<script setup>
import { ref, computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, A11y } from 'swiper/modules'
import 'swiper/css'

const groups = {
    categories: {
        title: 'Categories',
        blurb:
            "From recyclable aluminium to advanced vinyl, carpet, Kinetex or rubber, our flooring categories are carefully selected, bringing performance, ethics and aesthetics to every space.",
        queryKey: 'productCategory',
        ctaText: 'Explore materials',
        items: [
            {
                title: 'Entrance systems',
                image: '/block3/block3-entrancesystems.jpg',
                blurb:
                    'Alongside our very own aluminium Architectural Series, we offer a wide variety of entry carpets designed to trap dirt and moisture at the door, ensuring cleaner, safer interiors.',
            },
            { title: 'Carpet flooring', image: '/block3/block3-carpetflooring.jpg', blurb: '' },
            { title: 'Vinyl flooring', image: '/block3/block3-vinylflooring.jpg', blurb: '' },
            { title: 'Rubber flooring', image: '/block3/block3-rubberflooring.jpg', blurb: '' },
            { title: 'Kinetex® flooring', image: '/block3/block3-kinetexflooring.jpg', blurb: '' },
        ],
    },
    applications: {
        title: 'Applications',
        blurb:
            'From hospitality to healthcare, offices to education, we stock flooring solutions for every industry, covering everything from the front door to the back of house.',
        queryKey: 'applications',
        ctaText: 'Explore applications',
        items: [
            { title: 'Entrance', image: '/products/applications/entrance.jpg', blurb: '' },
            { title: 'Common & high traffic areas', image: '/products/applications/high-traffic.jpg', blurb: '' },
            { title: 'Healthcare areas', image: '/products/applications/healthcare.jpg', blurb: '' },
            { title: 'Sports', image: '/products/applications/sports.jpg', blurb: '' },
            { title: 'Kitchen & bathrooms', image: '/products/applications/kitchens.jpg', blurb: '' },
            { title: 'Service areas', image: '/products/applications/service.jpg', blurb: '' },
            { title: 'Stairways', image: '/products/applications/stairs.jpg', blurb: '' },
        ],
    },
    brands: {
        title: 'Brands',
        blurb:
            'From trusted global names to our own innovative products, our flooring range offers quality, architectural integrity and creative solutions for every project.',
        queryKey: 'brand',
        ctaText: 'Explore brands',
        items: [
            { title: 'Advance Flooring', image: '/products/brands/advance.jpg', blurb: '' },
            { title: 'J+J', image: '/products/brands/jj.jpg', blurb: '' },
            { title: 'Neoflex', image: '/products/brands/neoflex.jpg', blurb: '' },
            { title: 'Grabo', image: '/products/brands/grabo.jpg', blurb: '' },
            { title: 'Tretford', image: '/products/brands/tretford.jpg', blurb: '' },
            { title: 'BLOQ', image: '/products/brands/bloq.jpg', blurb: '' },
            { title: 'Voxflor', image: '/products/brands/voxflor.jpg', blurb: '' },
        ],
    },
}

const tabs = ['categories', 'applications', 'brands']
const activeTab = ref('categories')

const tab = computed(() => groups[activeTab.value])
const queryUrl = (t) => `/products?${tab.value.queryKey}=${encodeURIComponent(t)}`
const viewAllUrl = computed(() => `/products?${tab.value.queryKey}=*`)

const swiperRef = ref(null)
const onSwiper = (s) => (swiperRef.value = s)
const next = () => swiperRef.value?.slideNext()
const prev = () => swiperRef.value?.slidePrev()
</script>

<template>
    <section class="bg-white py-14 md:py-20">
        <div
            class="mx-auto max-w-[1440px] px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 md:items-stretch">
            <!-- Left rail (slightly wider) + divider line -->
            <aside class="md:col-span-5 lg:col-span-4 md:pr-4 lg:pr-6 md:border-r md:border-black/10 flex flex-col">
                <h2 class="text-4xl md:text-5xl font-semibold mb-6">Our products</h2>

                <nav aria-label="Product group" class="space-y-6">
                    <div v-for="key in tabs" :key="key">
                        <button class="text-left w-full group"
                            :class="activeTab === key ? 'text-black' : 'text-black/50 hover:text-black'"
                            @click="activeTab = key">
                            <p class="text-lg font-semibold">{{ groups[key].title }}</p>
                            <p v-if="activeTab === key"
                                class="mt-2 text-[13px] leading-snug text-black/70 max-w-[46ch]">
                                {{ groups[key].blurb }}
                            </p>
                        </button>
                    </div>
                </nav>

                <!-- CTAs: stay under blurb on mobile, lock to bottom on desktop -->
                <div class="mt-10 md:mt-auto md:pt-8 flex flex-wrap items-center gap-4">
                    <a class="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-300 group"
                        :href="viewAllUrl" style="background-color: #E8E2D7; color: #111;">
                        <!-- text stays above the sliding bg -->
                        <span class="relative z-10 transition-colors duration-300 group-hover:text-white">
                            {{ tab.ctaText }}
                        </span>
                        <span class="relative z-10 transition-colors duration-300 group-hover:text-white"
                            aria-hidden>→</span>

                        <!-- sliding black bg -->
                        <span
                            class="absolute inset-0 bg-black translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
                    </a>
                    <a class="underline text-sm" href="/products">View all products</a>
                </div>
            </aside>

            <!-- Right / slider (slightly tighter + a touch of left padding to hug divider) -->
            <div class="min-w-0 md:col-span-7 lg:col-span-8
          pl-[6px] sm:pl-[10px] md:pl-[12px] lg:pl-[14px] xl:pl-[16px]">
                <Swiper :modules="[Navigation, A11y]" :slides-per-view="1.02" :space-between="8" :centeredSlides="false"
                    :breakpoints="{
                        375: { slidesPerView: 1.04, spaceBetween: 10 },
                        640: { slidesPerView: 1.10, spaceBetween: 14 },
                        768: { slidesPerView: 1.16, spaceBetween: 16 },
                        1024: { slidesPerView: 1.20, spaceBetween: 18 },
                        1280: { slidesPerView: 1.22, spaceBetween: 20 }
                    }" @swiper="onSwiper" class="">
                    <SwiperSlide v-for="(item, i) in tab.items" :key="i" class="min-w-0">
                        <a :href="queryUrl(item.title)" class="group block">
                            <!-- Card image: 4:3 on mobile, 3:2 on sm+ -->
                            <figure class="relative w-full aspect-[4/3] sm:aspect-[3/2] overflow-hidden">
                                <img :src="item.image" :alt="item.title" loading="lazy"
                                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-[800ms] group-hover:scale-[1.03]" />
                                <div
                                    class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                                <!-- (kept, but hidden) old hover chip inside image -->
                                <div class="hidden pointer-events-none absolute left-4 bottom-4 sm:left-6 sm:bottom-6">
                                    <span
                                        class="inline-flex items-center gap-2 rounded-full bg-white/90 text-black text-[13px] px-3 py-1">
                                        <span>View products</span>
                                        <span aria-hidden>→</span>
                                    </span>
                                </div>
                            </figure>

                            <!-- Caption below image -->
                            <div class="caption-row pt-3 sm:pt-4 md:pt-5 lg:pt-6 min-w-0">
                                <div class="grid md:grid-cols-12 gap-3 md:gap-5 items-start">
                                    <!-- Title + new hover text (outside image) -->
                                    <div class="md:col-span-5 min-w-0">
                                        <h3 class="text-xl md:text-2xl font-semibold leading-snug min-w-0">
                                            {{ item.title }}
                                        </h3>
                                        <!-- NEW: plain hover text under title -->
                                        <span class="typing-mask block text-[12px] tracking-wide font-semibold mt-1
         opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
         transition-all duration-300 text-black uppercase">
                                            View products →
                                        </span>
                                    </div>

                                    <p v-if="item.blurb"
                                        class="md:col-span-7 text-[13px] leading-snug text-black/70 min-w-0">
                                        {{ item.blurb }}
                                    </p>
                                </div>
                            </div>
                        </a>
                    </SwiperSlide>
                </Swiper>

                <!-- Slider nav -->
                <div class="mt-4 flex items-center justify-end gap-2">
                    <button class="h-9 w-9 rounded-full border border-black/15 hover:bg-black/5" aria-label="Previous"
                        @click="prev">
                        ←
                    </button>
                    <button class="h-9 w-9 rounded-full border border-black/15 hover:bg-black/5" aria-label="Next"
                        @click="next">
                        →
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
:deep(.swiper) {
    padding-bottom: 0.25rem;
}

/* keep the caption neat */
:deep(.caption-row) {
    margin-top: 0.25rem;
}

/* Fast type-in effect (no caret) */
.typing-mask {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    max-width: 0ch;
    /* starting point */
}

.group:hover .typing-mask {
    /* ~0.32s for a quick, smooth type-in */
    animation: type-in 320ms steps(18, end) forwards;
}

@keyframes type-in {
    from {
        max-width: 0ch;
    }

    to {
        max-width: 18ch;
    }

    /* fits "VIEW PRODUCTS →"; tweak if label changes */
}
</style>