<template>
    <section class="bg-white">
        <div class="mx-auto max-w-[1440px] px-4 sm:px-6 py-16 md:py-24">
            <!-- ===== MOBILE (simple slider) ===== -->
            <div class="md:hidden">
                <Swiper :modules="[Autoplay, Pagination]" :slides-per-view="1" :space-between="16" :autoplay="autoplay"
                    :loop="true" :speed="1200" :pagination="{ clickable: true }" class="mobile-values">
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

            <!-- ===== DESKTOP (two synced sliders) ===== -->
            <div class="hidden md:grid grid-cols-12 gap-10 lg:gap-14">
                <!-- Left rail (vertical list) -->
                <aside class="md:col-span-6">
                    <div class="sticky top-24">
                        <Swiper ref="leftRef" :modules="[Mousewheel]" direction="vertical" :loop="true" :speed="1200"
                            :slides-per-view="3.1" :centeredSlides="true" :mousewheel="true" :allowTouchMove="true"
                            class="h-[72vh]" @slideChange="syncFromLeft">
                            <SwiperSlide v-for="(v, i) in values" :key="'l' + i">
                                <div class="grid grid-cols-12 items-start will-change-transform"
                                    :class="i === active ? 'opacity-100' : 'opacity-40'">
                                    <div class="col-span-3 pr-2 leading-none font-semibold select-none text-[64px] lg:text-[80px]"
                                        :class="i === active ? 'text-black' : 'text-black/25'">
                                        {{ i + 1 }}
                                    </div>

                                    <div class="col-span-9 pl-6 border-l border-black/20">
                                        <h4
                                            class="text-[22px] lg:text-[28px] font-semibold leading-snug max-w-[16ch] transition-opacity duration-200">
                                            {{ v.title }}
                                        </h4>
                                    </div>
                                </div>
                            </SwiperSlide>
                        </Swiper>
                    </div>
                </aside>

                <!-- Right (image + blurb). Right AUTOPLAYS and drives both rails -->
                <div class="md:col-span-6">
                    <Swiper ref="rightRef" :modules="[Autoplay, EffectFade]" effect="fade"
                        :fadeEffect="{ crossFade: true }" :slides-per-view="1" :loop="true" :speed="1200"
                        :allowTouchMove="false" :autoplay="autoplay" class="values-right" @slideChange="syncFromRight">
                        <SwiperSlide v-for="(v, i) in values" :key="'r' + i">
                            <figure class="w-full aspect-[5/6] overflow-hidden">
                                <img :src="v.image" :alt="v.title" class="h-full w-full object-cover" />
                            </figure>
                            <p v-if="v.blurb"
                                class="mt-4 md:mt-5 text-[15px] md:text-base text-black/60 leading-relaxed max-w-2xl">
                                {{ v.blurb }}
                            </p>
                        </SwiperSlide>
                    </Swiper>

                    <div class="mt-6 flex items-center gap-5">
                        <a href="/about/our-story"
                            class="inline-flex items-center gap-2 border border-black/20 px-5 py-3 text-[15px] font-medium hover:bg-black hover:text-white transition-colors">
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
import { Mousewheel, EffectFade, Autoplay, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

const autoplay = {
    delay: 3800,
    disableOnInteraction: false,
    pauseOnMouseEnter: false
}

const values = [
    {
        title: 'Family values for enduring partnerships',
        blurb:
            "Advance is a multi-generational family business. Flooring is in our DNA. That’s why we treat our people, partners, collaborators, and clients like they’re part of the family.",
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
            "Responding quickly, solving problems, building genuine relationships, and making good on our promises. Easy, elevated service—it's how we move flooring forward.",
        image: '/about/values/3.avif'
    },
    {
        title: 'From our factory floor to yours',
        blurb:
            'We create entry flooring solutions of a global standard while keeping it local. The only company designing, engineering and manufacturing under one roof.',
        image: '/about/values/4.avif'
    },
    {
        title: 'Industry-advancing flooring experts',
        blurb:
            'For decades we’ve been trusted by architects, designers and builders for our depth of knowledge and technical reliability.',
        image: '/about/values/5.avif'
    }
]

const active = ref(0)
const leftRef = ref(null)
const rightRef = ref(null)

onMounted(() => {
    // ensure we begin on the first item in both rails
    const r = rightRef.value?.swiper
    const l = leftRef.value?.swiper
    if (r && l) {
        r.slideToLoop(0, 0) // jump without anim
        l.slideToLoop(0, 0)
    }
})

/** When the RIGHT (autoplay) changes, drive the LEFT by realIndex */
function syncFromRight(sw) {
    const i = sw.realIndex
    const l = leftRef.value?.swiper
    if (l) l.slideToLoop(i, sw.params.speed, false)
    active.value = i
}

/** If the user wheels/drags the LEFT, keep RIGHT in step */
function syncFromLeft(sw) {
    const i = sw.realIndex
    const r = rightRef.value?.swiper
    if (r) r.slideToLoop(i, sw.params.speed, false)
    active.value = i
}
</script>

<style scoped>
/* crisp corners */
:where(img, figure) {
    border-radius: 0 !important;
}

/* mobile dots a tad lower */
.mobile-values :deep(.swiper-pagination) {
    bottom: 8px !important;
}
</style>