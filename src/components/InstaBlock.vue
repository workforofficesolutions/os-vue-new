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
            <a
                href="https://www.instagram.com/officesolutionsuae"
                target="_blank"
                rel="noopener"
                class="inline-block border border-black px-6 py-3 text-sm uppercase tracking-widest font-semibold text-black rounded-full hover:bg-[#DD4912] hover:text-white transform hover:scale-105 transition-all duration-300"
            >
                Follow us on Instagram
            </a>
        </div>


    </section>
</template>


<style scoped>

</style>
