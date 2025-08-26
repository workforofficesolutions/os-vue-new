<template>
    <section class="bg-[#F7F3EA]">
        <div class="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 md:py-24">

            <!-- ============ MOBILE (one slider) ============ -->
            <div class="md:hidden">
                <Swiper :modules="[Pagination]" :slides-per-view="1" :space-between="16"
                    :pagination="{ clickable: true }" class="mobile-values">
                    <SwiperSlide v-for="(v, i) in values" :key="'m' + i">
                        <figure class="relative w-full aspect-[16/10] overflow-hidden">
                            <img :src="v.image" :alt="v.title" class="absolute inset-0 w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black/35"></div>

                            <div class="absolute inset-x-4 bottom-4 text-white">
                                <h3 class="text-2xl font-semibold leading-tight">
                                    {{ v.title }}
                                </h3>
                                <p v-if="v.blurb" class="mt-2 text-sm text-white/90">
                                    {{ v.blurb }}
                                </p>
                                <div class="mt-4 flex items-center gap-4">
                                    <a href="/about/our-story"
                                        class="inline-flex items-center gap-2 bg-white text-black px-4 py-2 text-sm font-medium">
                                        <span>Our story</span><span aria-hidden>→</span>
                                    </a>
                                </div>
                            </div>
                        </figure>
                    </SwiperSlide>
                </Swiper>
            </div>

            <!-- ============ DESKTOP (two synced sliders) ============ -->
            <div class="hidden md:grid grid-cols-12 gap-10 lg:gap-14">
                <!-- Left numbers / titles (vertical swiper) -->
                <aside class="md:col-span-5 lg:col-span-4">
                    <div class="sticky top-24">
                        <Swiper ref="leftRef" :modules="[Mousewheel, Controller]" direction="vertical"
                            :slides-per-view="4" :space-between="18" :centeredSlides="true" :mousewheel="true"
                            class="h-[72vh]" @slideChange="onLeftChange">
                            <SwiperSlide v-for="(v, i) in values" :key="'l' + i">
                                <div class="grid grid-cols-12 items-start">
                                    <div class="col-span-3 pr-2 leading-none font-semibold select-none
                           text-[64px] lg:text-[80px]" :class="active === i ? 'text-black' : 'text-black/20'">
                                        {{ i + 1 }}
                                    </div>
                                    <div class="col-span-9 pl-5 border-l border-black/25">
                                        <h4 class="text-[22px] lg:text-[28px] font-semibold leading-snug
                             transition-opacity duration-200" :class="active === i ? 'opacity-100' : 'opacity-40'">
                                            {{ v.title }}
                                        </h4>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </aside>

                <!-- Right content (fade swiper) -->
                <div class="md:col-span-7 lg:col-span-8">
                    <Swiper ref="rightRef" :modules="[EffectFade, Controller]" effect="fade"
                        :fadeEffect="{ crossFade: true }" :slides-per-view="1" :space-between="0" class="values-right"
                        @slideChange="onRightChange">
                        <SwiperSlide v-for="(v, i) in values" :key="'r' + i">
                            <figure class="w-full aspect-[16/10] overflow-hidden">
                                <img :src="v.image" :alt="v.title" class="h-full w-full object-cover" />
                            </figure>

                            <p v-if="v.blurb" class="mt-4 md:mt-5 text-[15px] md:text-base text-black/70 max-w-3xl">
                                {{ v.blurb }}
                            </p>
                        </SwiperSlide>
                    </Swiper>

                    <div class="mt-6 flex items-center gap-5">
                        <a href="/about/our-story" class="inline-flex items-center gap-2 border border-black/20 px-5 py-3 text-[15px] font-medium
                     hover:bg-black hover:text-white transition-colors">
                            <span>Our story</span><span aria-hidden>→</span>
                        </a>
                        <a href="/about/our-team"
                            class="text-[15px] font-medium underline underline-offset-[6px] hover:no-underline">
                            Meet the team
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Controller, EffectFade, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

// ---- Data (swap images with your assets) ----
const values = [
    {
        title: 'Family values for enduring partnerships',
        blurb:
            "We're a multi-generational business. It’s in our DNA to treat clients, collaborators and suppliers like they’re part of the family.",
        image: '/about/values/1.avif'
    },
    {
        title: 'Curated—from front door to back of house',
        blurb:
            'From global brands to our own locally designed ranges, we carefully curate solutions for every kind of commercial building.',
        image: '/about/values/2.avif'
    },
    {
        title: 'We make flooring easy',
        blurb:
            'Clear advice, timely logistics and dependable installation partners help your project flow without surprises.',
        image: '/about/values/3.avif'
    },
    {
        title: 'From our factory floor to yours',
        blurb:
            'Local finishing and fabrication give us the agility to meet schedules, customise details and reduce waste.',
        image: '/about/values/4.avif'
    },
    {
        title: 'Industry-advancing flooring experts',
        blurb:
            'For decades we’ve been trusted by architects, designers and builders for depth of knowledge and technical reliability.',
        image: '/about/values/5.avif'
    }
]

// ---- Swiper syncing ----
const active = ref(0)
const leftRef = ref(null)
const rightRef = ref(null)

onMounted(() => {
    // link the two sliders both ways (keeps them perfectly in sync)
    const l = leftRef.value?.swiper
    const r = rightRef.value?.swiper
    if (l && r) {
        l.controller.control = r
        r.controller.control = l
        active.value = r.activeIndex || 0
    }
})

function onLeftChange(sw) {
    active.value = sw.activeIndex
}
function onRightChange(sw) {
    active.value = sw.activeIndex
}
</script>

<style scoped>
/* zero rounded corners, crisp look */
:where(img, figure) {
    border-radius: 0 !important;
}

/* mobile pagination dots a little lower */
.mobile-values :deep(.swiper-pagination) {
    bottom: 8px !important;
}
</style>
