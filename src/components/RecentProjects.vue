<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, A11y } from 'swiper/modules'
import 'swiper/css'

/* Props */
const props = defineProps({
    projects: { type: Array, required: true },
    basePath: { type: String, default: '/case-studies' },
    viewAllHref: { type: String, default: '/case-studies' },
})

/* slug + list */
const slugify = (s) =>
    s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

const list = computed(() =>
    (props.projects || []).map(p => ({
        largeShape: 'cut-br',        // sensible defaults if missing
        smallShape: 'circle',
        ...p,
        slug: slugify(p.title),
        href: `${props.basePath}/${slugify(p.title)}`
    }))
)

/* swiper controls */
const sw = ref(null)
const onSwiper = (inst) => (sw.value = inst)
const prev = () => sw.value?.slidePrev()
const next = () => sw.value?.slideNext()

/* helper for the small tile start position (outside, then slides in) */
const smallPosClass = (shape) => {
    switch (shape) {
        case 'cut-tl': return 'top-3 left-3 -translate-x-[18%] -translate-y-[18%] group-hover:translate-x-0 group-hover:translate-y-0'
        case 'cut-tr': return 'top-3 right-3 translate-x-[18%] -translate-y-[18%] group-hover:translate-x-0 group-hover:translate-y-0'
        case 'cut-bl': return 'bottom-3 left-3 -translate-x-[18%] translate-y-[18%] group-hover:translate-x-0 group-hover:translate-y-0'
        case 'cut-br':
        default: return 'bottom-3 right-3 translate-x-[18%] translate-y-[18%] group-hover:translate-x-0 group-hover:translate-y-0'
    }
}
</script>

<template>
    <section class="py-12 sm:py-14">
        <!-- Header -->
        <div class="mx-auto max-w-7xl px-4 flex items-baseline justify-between">
            <h2 class="text-[32px] sm:text-[40px] md:text-[52px] leading-none font-semibold tracking-[-.02em]">
                Recent projects
            </h2>
            <RouterLink :to="viewAllHref" class="text-[15px] font-semibold underline underline-offset-4">
                View all
            </RouterLink>
        </div>

        <!-- Slider -->
        <div class="mx-auto max-w-7xl px-4 relative pb-12">
            <Swiper :modules="[Navigation, A11y]" :slides-per-view="1" :space-between="18" :centered-slides="false"
                :slides-per-group="1" :speed="500" :breakpoints="{
                    640: { slidesPerView: 1.2, spaceBetween: 20 },
                    768: { slidesPerView: 2, spaceBetween: 22 },
                    1024: { slidesPerView: 3, spaceBetween: 24 },
                    1280: { slidesPerView: 3, spaceBetween: 28 }
                }" @swiper="onSwiper" class="mt-6">
                <SwiperSlide v-for="p in list" :key="p.slug" class="min-w-0">
                    <RouterLink :to="p.href" class="group block select-none">
                        <!-- Card: fixed aspect → all slides same height; straight edges -->
                        <figure class="relative w-full aspect-[3/2] bg-[#EDE5DA] overflow-hidden">

                            <!-- BIG IMAGE: cut-corner -> full square on hover -->
                            <div class="absolute inset-0 z-0 transition-[clip-path] duration-500 ease-out rp-shape"
                                :class="[
                                    p.largeShape === 'cut-tl' ? 'rp-cut-tl' :
                                        p.largeShape === 'cut-tr' ? 'rp-cut-tr' :
                                            p.largeShape === 'cut-bl' ? 'rp-cut-bl' : 'rp-cut-br'
                                ]" style="--cut:16%;">
                                <img :src="p.image" :alt="p.title"
                                    class="absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] group-hover:scale-[1.02]"
                                    loading="lazy" />
                            </div>

                            <!-- SMALL MATERIAL TILE: no border; slides in fast + fades out -->
                            <div class="absolute z-10 transition-all ease-out will-change-transform"
                                :class="['opacity-100 group-hover:opacity-0 duration-150', smallPosClass(p.largeShape)]"
                                :style="{ width: '150px', height: '150px' }" aria-hidden="true">
                                <img :src="p.material" :alt="`${p.title} material`" class="h-full w-full object-cover"
                                    :class="p.smallShape === 'circle' ? 'rounded-full' : ''" />
                            </div>
                        </figure>

                        <!-- Caption (no borders). Hover text reveal like ProductsShowcase -->
                        <div class="pt-4 sm:pt-5 md:pt-6">
                            <div class="grid md:grid-cols-12 gap-3 md:gap-5 items-start">
                                <div class="md:col-span-8 min-w-0">
                                    <h3 class="text-xl md:text-2xl font-semibold leading-snug min-w-0">
                                        {{ p.title }}
                                    </h3>
                                    <span class="typing-mask block text-[12px] tracking-wide font-semibold mt-1
                           opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                           transition-all duration-300 uppercase">
                                        View case study →
                                    </span>
                                </div>

                                <p class="md:col-span-4 text-[13px] leading-snug text-black/70 min-w-0">
                                    {{ p.sector }}
                                </p>
                            </div>
                        </div>
                    </RouterLink>
                </SwiperSlide>
            </Swiper>

            <!-- Bottom-right nav (square, no rounding) -->
            <div class="absolute right-4 bottom-0 translate-y-full flex items-center gap-2">
                <button class="h-9 w-9 border border-black/20 hover:bg-black/5" aria-label="Previous"
                    @click="prev">←</button>
                <button class="h-9 w-9 border border-black/20 hover:bg-black/5" aria-label="Next"
                    @click="next">→</button>
            </div>
        </div>
    </section>
</template>

<style scoped>
/* --- Large-image cut corners (use --cut for size) ------------------------ */
.rp-shape {
    clip-path: inset(0);
}

.rp-cut-tl {
    clip-path: polygon(0 var(--cut), var(--cut) 0, 100% 0, 100% 100%, 0 100%);
}

.rp-cut-tr {
    clip-path: polygon(0 0, 100% 0, 100% var(--cut), calc(100% - var(--cut)) 0, 0 0, 0 100%, 0 0);
}

.rp-cut-bl {
    clip-path: polygon(0 0, 100% 0, 100% 100%, var(--cut) 100%, 0 calc(100% - var(--cut)));
}

.rp-cut-br {
    clip-path: polygon(0 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%);
}

/* On hover, remove cut → full square */
.group:hover .rp-shape {
    clip-path: inset(0);
}

/* kill any accidental rounding inside this component */
:where(.rounded, .rounded-md, .rounded-lg, .rounded-xl, .rounded-2xl) {
    border-radius: 0 !important;
}

/* Keep layout crisp – no borders between slides, just spacing from Swiper */
</style>
