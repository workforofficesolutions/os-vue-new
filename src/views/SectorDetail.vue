<template>
    <main v-if="sector" class="w-full px-3 sm:px-4 md:px-6 lg:px-8 pb-20"
        style="padding-top: calc(var(--header-height,72px) + var(--header-gap,24px))">
        <!-- Hero -->
        <section ref="heroRef" class="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] overflow-hidden">
            <div class="relative min-h-[480px]"
                style="height: calc(100vh - (var(--header-height,72px) + var(--header-gap,24px)))">
                <img :src="sector.image" :alt="sector.heroAlt || sector.title"
                    class="absolute inset-0 h-full w-full object-cover"
                    :style="sector.pos ? `object-position:${sector.pos}` : ''" />
                <div class="absolute inset-0 bg-black/30"></div>

                <!-- Centered title -->
                <div class="absolute inset-0 flex items-center justify-center text-center">
                    <h1 class="text-white font-bold tracking-tight
                   text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
                        {{ sector.title }}
                    </h1>
                </div>

                <!-- Bottom-left blurb -->
                <p class="absolute left-3 sm:left-6 bottom-3 sm:bottom-5
                 text-white/90 max-w-[66ch]
                 text-sm sm:text-base md:text-lg leading-snug">
                    {{ sector.blurb }}
                </p>
            </div>
        </section>

        <!-- Designer quote -->
        <section class="py-10 md:py-14">
            <div class="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6 md:gap-10 items-start">
                <div class="text-sm text-neutral-600">
                    <p class="font-medium text-neutral-800">{{ sector.designer?.name }}</p>
                    <p>{{ sector.designer?.role }}</p>
                </div>

                <blockquote class="font-semibold leading-tight
                 text-2xl sm:text-3xl md:text-4xl">
                    “{{ sector.designer?.quote }}”
                </blockquote>
            </div>
        </section>

        <!-- Consult with our expert -->
        <section class="py-10 md:py-16">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <div>
                    <h2 class="font-bold tracking-tight text-3xl md:text-4xl mb-4">
                        Consult with our {{ sector.title.toLowerCase() }} sector expert
                    </h2>
                    <p class="text-neutral-600 max-w-prose">
                        Talk to a specialist about material selection, durability, and installation
                        details for your next {{ sector.title.toLowerCase() }} project.
                    </p>
                    <RouterLink to="/contact"
                        class="inline-flex items-center justify-center mt-6 border border-neutral-900 bg-neutral-900 text-white px-5 py-3">
                        Enquire now <span aria-hidden="true" class="ml-2">→</span>
                    </RouterLink>
                </div>

                <div>
                    <div
                        class="w-full overflow-hidden border border-neutral-200 bg-white aspect-[16/11] md:aspect-[3/2]">
                        <img :src="sector.expert?.photo || '/sectors/experts/default.jpg'"
                            :alt="sector.expert?.name || 'Sector expert photo'" class="h-full w-full object-cover"
                            loading="lazy" />
                    </div>

                    <div class="mt-5 space-y-1">
                        <p class="font-semibold text-lg">{{ sector.expert?.name }}</p>
                        <p class="text-neutral-600 text-sm">{{ sector.expert?.role }}</p>
                        <p class="text-sm">
                            <a class="underline"
                                :href="sector.expert?.phone ? `tel:${sector.expert.phone}` : undefined">
                                {{ sector.expert?.phone }}
                            </a>
                        </p>
                        <p class="text-sm">
                            <a class="underline"
                                :href="sector.expert?.email ? `mailto:${sector.expert.email}` : undefined">
                                {{ sector.expert?.email }}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Featured case studies (reuse your component) -->
        <section class="py-8 md:py-12">
            <h2 class="font-bold tracking-tight text-3xl md:text-4xl mb-6">
                Featured case studies
            </h2>
            <!-- Adjust the import/path/props to match your implementation -->
            <RecentProjects />
        </section>
    </main>

    <section v-else class="p-12 text-center">
        <p>Sector not found.</p>
        <RouterLink class="underline" to="/sectors/workplace">Back to sectors</RouterLink>
    </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import SECTORS, { findSectorBySlug, slugify as slugifySector } from '../data/sectors.js';
import RecentProjects from '../components/RecentProjects.vue'; // ensure this path/component exists

const route = useRoute();
const wantedSlug = computed(() => String(route.params.slug || '').toLowerCase());
const sector = computed(() => findSectorBySlug(wantedSlug.value));

// --- Header transparency on hero (match SiteHeader behaviour) ---
const heroRef = ref(null);
let headerObserver = null;
let headerEl = null;

function setHeaderMode(isOnHero) {
    const root = document.documentElement;
    // Toggle classes on <html> so global CSS can react
    root.classList.toggle('header--on-hero', isOnHero);
    root.classList.toggle('header--scrolled', !isOnHero);

    // Also toggle classes directly on the header element for maximum compatibility
    if (!headerEl) {
        headerEl = document.querySelector('.site-header, .app-header, header');
    }
    if (headerEl) {
        headerEl.classList.toggle('header--transparent', isOnHero);
        headerEl.classList.toggle('header--solid', !isOnHero);
    }
}

onMounted(() => {
    if (sector.value?.title) {
        document.title = `${sector.value.title} – Sectors`;
    }

    // Ensure initial state assumes hero is visible until observed
    setHeaderMode(true);

    // Observe the hero to flip header style when it leaves the viewport
    const target = heroRef.value;
    if (target && 'IntersectionObserver' in window) {
        headerObserver = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                setHeaderMode(entry.isIntersecting);
            },
            {
                // Start switching a bit before the hero fully leaves/enters
                rootMargin: '-80px 0px 0px 0px',
                threshold: 0.2,
            }
        );
        headerObserver.observe(target);
    } else {
        // Fallback: simple scroll handler
        const onScroll = () => {
            const rect = target ? target.getBoundingClientRect() : { bottom: 0 };
            setHeaderMode(rect.bottom > 80);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
        // store cleanups on the element to detach later
        target && (target.__onScrollCleanup = () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        });
    }
});

onUnmounted(() => {
    if (headerObserver) {
        headerObserver.disconnect();
        headerObserver = null;
    }
    if (heroRef.value && heroRef.value.__onScrollCleanup) {
        heroRef.value.__onScrollCleanup();
    }
    if (headerEl) {
        headerEl.classList.remove('header--transparent', 'header--solid');
    }
    // Always restore header to solid when leaving the page
    setHeaderMode(false);
});
// --- end header transparency logic ---
</script>
<style>
/* Header transparency behaviour over hero
   Works with headers that use .site-header, .app-header, or plain <header>. */

/* When hero is in view: transparent header + white content */
html.header--on-hero .site-header,
html.header--on-hero .app-header,
html.header--on-hero header,
.header--transparent {
    background-color: transparent !important;
    color: #ffffff !important;
    border-color: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
}

/* Force inner items (links/icons) to white as well */
html.header--on-hero .site-header *,
html.header--on-hero .app-header *,
html.header--on-hero header *,
.header--transparent * {
    color: #ffffff !important;
    fill: #ffffff !important;
    stroke: #ffffff !important;
}

/* When scrolled past hero: solid white header + dark text */
html.header--scrolled .site-header,
html.header--scrolled .app-header,
html.header--scrolled header,
.header--solid {
    background-color: #ffffff !important;
    color: #111827 !important;
    /* neutral-900 */
    border-color: rgba(0, 0, 0, 0.06) !important;
}

html.header--scrolled .site-header a,
html.header--scrolled .app-header a,
html.header--scrolled header a,
.header--solid a {
    color: inherit !important;
}
</style>