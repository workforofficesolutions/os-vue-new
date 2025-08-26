<script setup>
const props = defineProps({
    image: { type: String, default: '/images/our-story.jpg' },
    imageAlt: { type: String, default: 'Office Solutions lobby' },

    copy: {
        type: String,
        default:
            `Office Solutions has been at the forefront of UAE’s entrance matting and flooring industry since 1976. For decades, we have been trusted by architects, designers, installers and builders for our industry-advancing expertise, depth of knowledge, and the reliability of our people and products.`,
    },

    storyHref: { type: String, default: 'https://www.officesolutions.uae/about/our-story' },
    teamHref: { type: String, default: 'https://www.officesolutions.uae/about/our-team' },

    // desktop min-heights (image drives overall block height)
    minHmd: { type: Number, default: 720 },
    minHlg: { type: Number, default: 780 },
    minHxl: { type: Number, default: 860 },
})
</script>

<template>
    <section class="bg-[#F2F2F2]">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
            <div class="grid grid-cols-1 md:grid-cols-2 items-stretch relative">
                <!-- LEFT: media (height driver on desktop) -->
                <div class="pr-0 md:pr-8">
                    <figure class="w-full overflow-hidden">
                        <!-- Mobile/tablet -->
                        <div class="md:hidden aspect-[4/3]">
                            <img :src="image" :alt="imageAlt" class="h-full w-full object-cover" loading="lazy" />
                        </div>
                        <!-- Desktop+: pass CSS vars; rules live in <style scoped> -->
                        <div class="hidden md:block w-full media-wrap" :style="{
                            '--minH-md': `${minHmd}px`,
                            '--minH-lg': `${minHlg}px`,
                            '--minH-xl': `${minHxl}px`
                        }">
                            <div class="media-minH">
                                <img :src="image" :alt="imageAlt" class="h-full w-full object-cover" loading="lazy" />
                            </div>
                        </div>
                    </figure>
                </div>

                <!-- RIGHT: text + CTAs -->
                <div class="pl-0 md:pl-8 relative">
                    <span class="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-black/10"></span>

                    <div class="py-6 md:py-8 lg:py-10">
                        <div class="max-w-[62ch]">
                            <h2 class="text-2xl md:text-3xl font-semibold leading-snug">
                                {{ copy }}
                            </h2>

                            <div class="mt-6 flex items-center gap-6">
                                <a :href="storyHref"
                                    class="inline-flex items-center gap-3 px-5 py-3 border border-black/15 bg-white hover:bg-black/5 transition-colors">
                                    <span class="font-semibold ">Our story</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="h-4 w-4"
                                        fill="none">
                                        <path d="M3 8h9M8 3l4 5-4 5" stroke="currentColor" stroke-width="1.5"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                </a>

                                <a :href="teamHref"
                                    class="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity">
                                    Meet the team
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>

<style scoped>
/* drive the media height via CSS variables passed from template */
.media-wrap .media-minH {
    min-height: var(--minH-md);
}

@media (min-width: 1024px) {
    .media-wrap .media-minH {
        min-height: var(--minH-lg);
    }
}

@media (min-width: 1280px) {
    .media-wrap .media-minH {
        min-height: var(--minH-xl);
    }
}

/* keep straight corners */
:where(.rounded, .rounded-sm, .rounded-md, .rounded-lg, .rounded-xl) {
    border-radius: 0 !important;
}
</style>
