<script setup lang="ts">
import InstagramFeed from './InstagramFeed.vue';

</script>

<template>
    <section class="bg-[#F9F3EB] py-8 px-4 sm:px-8 md:px-12 lg:px-24">
        <h2 class="text-3xl md:text-4xl font-semibold text-center mb-8 header-font text-black">
            Let the magic slide into the DMs.
        </h2>

        <div class="mt-10 max-w-5xl mx-auto">
            <InstagramFeed />
        </div>

        <div class="mt-10 text-center">
            <a href="https://www.instagram.com/officesolutionsuae" target="_blank" rel="noopener"
                class="relative overflow-hidden inline-flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
                style="background-color: #E8E2D7; color: #111;">
                <span class="relative z-10 transition-colors duration-300 group-hover:text-white">
                    Follow us on Instagram
                </span>
                <span class="relative z-10 transition-colors duration-300 group-hover:text-white" aria-hidden>→</span>

                <span
                    class="absolute inset-0 bg-black translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></span>
            </a>
        </div>


    </section>
</template>


<style scoped></style>
