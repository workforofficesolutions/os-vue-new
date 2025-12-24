<!-- src/components/Sustainability.vue -->
<template>
    <section class="relative min-h-[64vh] lg:min-h-[72vh] overflow-hidden bg-white"><!-- CHANGED -->
        <!-- Backdrop wrapper with desktop gutters -->
        <div class="absolute top-0 bottom-0 left-0 right-0 md:left-6 md:right-6 lg:left-12 lg:right-12">
            <img :src="bg" alt="" class="h-full w-full object-cover select-none" draggable="false" />
            <div class="absolute inset-0 bg-black/20 pointer-events-none" />
        </div>

        <div class="relative mx-auto max-w-[1440px] px-4 sm:px-6 py-6 md:py-8 lg:py-10">
            <!-- Sticky desktop heading -->
            <h2 class="hidden md:block sticky top-6 sm:top-8 text-white text-3xl sm:text-4xl font-semibold z-10 mb-4">
                Responsible citizens
            </h2>

            <!-- Centered card -->
            <div class="grid place-items-center min-h-[56vh] md:min-h-[60vh] lg:min-h-[62vh]"><!-- CHANGED -->
                <div
                    class="grid grid-cols-1 md:grid-cols-12 bg-white shadow-xl ring-1 ring-black/10 rounded-none md:max-w-[880px] lg:max-w-[920px] w-full mx-auto">
                    <!-- Mobile title -->
                    <div class="md:hidden col-span-1 bg-white text-white px-4 py-3 text-xl font-semibold">
                        Responsible citizens
                    </div>

                    <!-- Left image -->
                    <div class="md:col-span-6">
                        <figure class="relative w-full aspect-[16/11] md:aspect-auto md:h-full overflow-hidden">
                            <img :src="cardImage" :alt="cardAlt"
                                class="absolute md:static inset-0 h-full w-full object-cover select-none"
                                draggable="false" />
                        </figure>
                    </div>

                    <!-- Right copy + CTAs pinned to bottom -->
                    <div class="md:col-span-6 p-5 sm:p-6 lg:p-8 grid md:grid-rows-[1fr_auto] gap-6"><!-- CHANGED -->
                        <p class="text-[12px] leading-relaxed text-black/75"><!-- CHANGED (readability) -->
                            We strive to source, design, and manufacture sustainably, and are
                            active contributors to the communities we are a part of, from the
                            wider architecture and design industry to the local neighbourhoods
                            where we live, work, and play.
                        </p>

                        <!-- CTAs live in the 'auto' row (bottom) -->
                        <div class="mt-2 md:mt-0 pt-2 md:pt-6 flex items-center gap-5 flex-wrap"><!-- CHANGED -->
                            <a :href="`${host}/about/sustainability`"
                                class="inline-flex items-center gap-2 px-5 py-3 text-[15px] font-medium bg-black text-white hover:bg-black/90 transition-colors">
                                Sustainability
                            </a>

                            <a :href="`${host}/about/community-support`"
                                class="inline-flex items-center text-[15px] font-medium underline underline-offset-[6px] hover:no-underline">
                                Community support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <!-- /Centered card -->
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    bg: {
        type: String,
        default:
            'https://cdn.sanity.io/images/0q894uzm/production/ffac81dea1d30f83e2046df800b5d5b4bafe4b0c-2000x1333.jpg',
    },
    cardImage: {
        type: String,
        default: '/cases/sustainability-heli.avif',
    },
    cardAlt: {
        type: String,
        default: 'Westpac rescue helicopter over forest',
    },
    host: {
        type: String,
        default: '/',
    },
})

const { bg, cardImage, cardAlt, host } = props
</script>

<style scoped>
:where(img, figure) {
    border-radius: 0 !important;
}
</style>
