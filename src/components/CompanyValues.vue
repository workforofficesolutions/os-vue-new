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
        title: 'Flooring expertise you can trust',
        blurb:
            "Office Solutions has guided architects, developers, and corporate clients across the UAE since 2012, offering reliable advice, precise installation, and high-quality flooring products.",
        image: '/about/values/1.jpg'
    },
    {
        title: 'Solutions for every space',
        blurb:
            'From commercial to engineering, education to healthcare, our range covers all flooring requirements for every sector, combining durability, practical design, and functionality.',
        image: '/about/values/2.jpg'
    },
    {
        title: 'Global brands with compatible insights',
        blurb:
            "We partner with internationally recognised brands such as Modulyss, Amtico, Unitile, and to deliver products that meet global standards while serving UAE projects effectively.",
        image: '/about/values/3.jpg'
    },
    {
        title: 'Support from planning to completion',
        blurb:
            'Our team provides project consultation, professional installation, and ongoing support to make flooring selection and delivery simple and reliable.',
        image: '/about/values/4.jpg'
    },
    {
        title: 'Flooring designed for sustainability',
        blurb:
            'We select products that are durable and environmentally responsible, including recyclable carpet tiles, vinyl, and other resilient solutions that promote greener building practices.',
        image: '/about/values/5.jpg'
    },
    {
        title: 'Performance and adaptability',
        blurb:
            'Our flooring solutions suit offices, schools, healthcare, and industrial spaces, offering comfort, acoustic control, and strength to endure daily use.',
        image: '/about/values/6.jpg'
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