<script setup>
import { computed } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

/* --- data -------------------------------------------------------------- */
const projects = [
    {
        title: 'Te Kura o Wairakei School',
        sector: 'Education',
        image: '/cases/te-kura-main.avif',
        material: '/cases/te-kura-material.avif',
    },
    {
        title: 'Anderson Lloyd - Christchurch',
        sector: 'Workplace',
        image: '/images/cases/anderson-lloyd-main.jpg',
        material: '/images/cases/anderson-lloyd-material.jpg',
    },
    {
        title: 'Motueka High School',
        sector: 'Education',
        image: '/images/cases/motueka-main.jpg',
        material: '/images/cases/motueka-material.jpg',
    },
    {
        title: 'Tākina Convention and Exhibition Centre',
        sector: 'Public buildings',
        image: '/images/cases/takina-main.jpg',
        material: '/images/cases/takina-material.jpg',
    },
    {
        title: 'Pic’s Peanut Butter World',
        sector: 'Public buildings',
        image: '/images/cases/pics-main.jpg',
        material: '/images/cases/pics-material.jpg',
    },
    {
        title: 'Te Waka Aorangi Child Wellness Centre',
        sector: 'Healthcare',
        image: '/images/cases/te-waka-main.jpg',
        material: '/images/cases/te-waka-material.jpg',
    },
]

/* slug + link helpers */
const slugify = (s) =>
    s
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

const list = computed(() =>
    projects.map((p) => ({
        ...p,
        slug: slugify(p.title),
        href: `https://localhost/case-studies/${slugify(p.title)}`,
    })),
)

const variant = (i) => (i % 3 === 0 ? 'is-v1' : i % 3 === 1 ? 'is-v2' : 'is-v3')
</script>

<template>
    <section class="rp-wrap">
        <div class="rp-header">
            <h2 class="rp-title">Recent projects</h2>
            <a class="rp-viewall" href="/case-studies">View all</a>
        </div>

        <Swiper class="rp-swiper" :modules="[Navigation, Autoplay]" :slides-per-view="1.05" :space-between="20"
            :speed="700" :autoplay="{ delay: 4000, disableOnInteraction: false }"
            :navigation="{ nextEl: '.rp-next', prevEl: '.rp-prev' }" :breakpoints="{
                640: { slidesPerView: 1.5, spaceBetween: 24 },
                960: { slidesPerView: 2.1, spaceBetween: 28 },
                1200: { slidesPerView: 2.8, spaceBetween: 32 }  // 2 + 80% of 3rd
            }">
            <SwiperSlide v-for="(p, i) in list" :key="p.slug">
                <a class="rp-card" :href="p.href">
                    <div class="rp-card-inner" :class="variant(i)">
                        <!-- square light-grey background -->
                        <div class="rp-bg"></div>

                        <!-- material swatch (small image) -->
                        <img class="rp-material" :src="p.material" :alt="`${p.title} material sample`" loading="lazy"
                            decoding="async" />

                        <!-- clipped main image (expands to full on hover) -->
                        <img class="rp-main" :src="p.image" :alt="p.title" loading="lazy" decoding="async" />
                    </div>

                    <div class="rp-footer">
                        <div class="rp-meta">
                            <div class="rp-case">{{ p.title }}</div>
                            <div class="rp-sector">{{ p.sector }}</div>
                        </div>
                        <div class="rp-cta">
                            <span class="rp-cta-label">View case study</span>
                            <span class="rp-arrow" aria-hidden>→</span>
                        </div>
                    </div>
                </a>
            </SwiperSlide>

            <!-- bottom-right nav (matches your reference) -->
            <button class="rp-prev" aria-label="Previous">←</button>
            <button class="rp-next" aria-label="Next">→</button>
        </Swiper>
    </section>
</template>

<style scoped>
/* ========== Layout ========== */
.rp-wrap {
    background: #f6f0e6;
    /* sand vibe */
    padding: 1.25rem 0 2.5rem;
}

.rp-header {
    max-width: 1280px;
    margin: 0 auto 1.25rem;
    padding: 0 1rem;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
}

.rp-title {
    font-size: clamp(1.75rem, 3vw, 2.6rem);
    font-weight: 800;
    line-height: 1.05;
    margin: 0;
}

.rp-viewall {
    text-decoration: underline;
    font-weight: 600;
}

/* ========== Swiper container ========== */
.rp-swiper {
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1rem 3.5rem;
}

/* ========== Card ========== */
.rp-card {
    display: block;
    background: transparent;
    color: inherit;
    text-decoration: none;
}

.rp-card-inner {
    position: relative;
    aspect-ratio: 1/1;
    /* square */
    border-radius: 10px;
    overflow: hidden;
    background: transparent;
    isolation: isolate;
}

/* variant styles for main image clipping */
.rp-card-inner.is-v1 .rp-main {
  inset: 14% 6% 6% 6%;
  clip-path: polygon(0 14%, 100% 14%, 100% 100%, 0 100%);
}
.rp-card-inner.is-v2 .rp-main {
  inset: 10% 8% 8% 8%;
  /* slightly thinner top band */
  clip-path: polygon(0 18%, 100% 18%, 100% 100%, 0 100%);
}
.rp-card-inner.is-v3 .rp-main {
  inset: 16% 6% 6% 6%;
  /* slightly deeper diagonal */
  clip-path: polygon(0 22%, 100% 22%, 100% 100%, 0 100%);
}

/* light grey panel */
.rp-bg {
    position: absolute;
    inset: 0;
    background: #eae5df;
}

/* material image */
.rp-material {
    position: absolute;
    width: clamp(80px, 14%, 140px);
    aspect-ratio: 1/1;
    object-fit: cover;
    border-radius: 9999px;
    top: clamp(16px, 2.6%, 22px);
    left: clamp(16px, 2.6%, 22px);
    z-index: 2;
}

.rp-card-inner.is-v2 .rp-material { display: none; }
.rp-card-inner.is-v3 .rp-material {
  top: auto;
  left: auto;
  right: clamp(16px, 2.6%, 22px);
  bottom: clamp(16px, 2.6%, 22px);
}

/* main image */
.rp-main {
    position: absolute;
    object-fit: cover;
    border-radius: 10px;
    transform: translateZ(0);
    transition:
        clip-path 500ms cubic-bezier(.2, .8, .2, 1),
        transform 500ms cubic-bezier(.2, .8, .2, 1);
    z-index: 1;
}

.rp-card:hover .rp-main,
.rp-card:focus-visible .rp-main {
    inset: 0;
    clip-path: inset(0 0 0 0 round 0);
    transform: scale(1.01);
}

/* ========== Footer ========== */
.rp-footer {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 0.9rem 0.25rem 0;
}

.rp-meta {
    min-width: 0;
}

.rp-case {
    font-weight: 700;
    font-size: clamp(1.05rem, 1.3vw, 1.2rem);
    line-height: 1.2;
}

.rp-sector {
    color: rgba(0, 0, 0, .65);
    margin-top: 0.25rem;
}

/* CTA */
.rp-cta {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    white-space: nowrap;
    font-weight: 600;
}

.rp-cta-label {
    text-decoration: underline;
}

.rp-arrow {
    display: inline-block;
    transition: transform .25s ease;
}

.rp-card:hover .rp-arrow,
.rp-card:focus-visible .rp-arrow {
    transform: translateX(3px);
}

/* ========== Nav buttons (bottom-right) ========== */
.rp-prev,
.rp-next {
    position: absolute;
    bottom: 0.25rem;
    background: transparent;
    border: none;
    font-size: 1.25rem;
    line-height: 1;
    padding: .6rem .8rem;
    border-radius: 9999px;
    cursor: pointer;
    transition: background-color .2s ease;
    z-index: 5;
}

.rp-next {
    right: 1rem;
}

.rp-prev {
    right: 3.25rem;
}

.rp-prev:hover,
.rp-next:hover {
    background-color: rgba(0, 0, 0, .06);
}

/* ========== Responsiveness ========== */
@media (max-width: 639.98px) {
    .rp-footer {
        padding-top: .75rem;
    }

    .rp-cta-label {
        display: none;
    }

    /* hide label on small screens */
}
</style>