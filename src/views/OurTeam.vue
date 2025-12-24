<template>
    <main class="w-full max-w-none">
        <!-- BLOCK 1 – HERO (full-screen video) -->
        <section ref="heroRef" class="relative w-full min-h-screen overflow-hidden">
            <video class="absolute inset-0 w-full h-full object-cover" :src="heroVideoSrc" autoplay muted loop
                playsinline preload="auto" />
            <div class="absolute inset-0 bg-black/45"></div>

            <div class="relative z-10 flex items-center justify-center text-center px-4 min-h-screen">
                <div class="max-w-4xl mx-auto">
                    <h1 class="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-white">
                        {{ heroTitle }}
                    </h1>
                    <div class="mt-6 w-14 h-px bg-white/70 mx-auto"></div>
                </div>
            </div>

            <!-- Minimal scroll cue -->
            <button type="button"
                class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/90"
                @click="scrollToMeet" aria-label="Scroll to meet the team">
                <span
                    class="text-[11px] sm:text-xs tracking-wide bg-black/30 border border-white/20 px-3 py-1 backdrop-blur-sm">
                    Scroll to meet the team
                </span>
                <span class="hero-arrow animate-bounce" aria-hidden="true">↓</span>
            </button>
        </section>

        <!-- CONTENT WRAP -->
        <section ref="meetRef" id="meet-the-team" class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
            style="padding-top: calc(var(--header-height, 72px) + var(--header-gap, 32px))">
            <div class="mx-auto max-w-6xl">
                <!-- BLOCK 2 – MEET THE TEAM -->
                <div class="mt-10 sm:mt-12 md:mt-16">
                    <div class="max-w-4xl mx-auto text-center">
                        <h2 class="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
                            {{ intro.heading }}
                        </h2>
                        <div class="w-12 h-px bg-neutral-700 mx-auto mt-4 mb-6"></div>

                        <div class="space-y-4">
                            <template v-for="(b, bi) in introBlocks" :key="`intro-b-${bi}`">
                                <p v-if="b.type === 'p'"
                                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                                    <template v-for="(t, ti) in b.tokens" :key="`intro-t-${bi}-${ti}`">
                                        <strong v-if="t.bold">{{ t.text }}</strong>
                                        <span v-else>{{ t.text }}</span>
                                    </template>
                                </p>
                                <ul v-else class="list-disc pl-5 text-left text-neutral-800 space-y-2">
                                    <li v-for="(it, ii) in b.items" :key="`intro-ul-${bi}-${ii}`">
                                        <template v-for="(t, ti) in it" :key="`intro-ul-t-${bi}-${ii}-${ti}`">
                                            <strong v-if="t.bold">{{ t.text }}</strong>
                                            <span v-else>{{ t.text }}</span>
                                        </template>
                                    </li>
                                </ul>
                            </template>
                        </div>
                    </div>

                    <div class="mt-10 sm:mt-12 grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                        <article v-for="(m, i) in team" :key="`t-${i}`"
                            class="border border-neutral-900/35 bg-transparent p-4">
                            <div class="relative w-full pt-[100%] overflow-hidden">
                                <img :src="m.image" :alt="m.name"
                                    class="team-photo absolute inset-0 w-full h-full object-cover" loading="lazy" />
                            </div>
                            <p class="mt-4 text-base font-semibold text-neutral-900">{{ m.name }}</p>
                            <p class="mt-1 text-sm text-neutral-700">{{ m.role }}</p>
                        </article>
                    </div>
                </div>
            </div>
        </section>

        <!-- BLOCK 4 – FULL-WIDTH TEAM PHOTO -->
        <section class="w-full max-w-none">
            <div class="relative w-full overflow-hidden">
                <div class="relative w-full h-[60vh] sm:h-[70vh]">
                    <img :src="teamPhoto" alt="Office Solutions team"
                        class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div class="absolute inset-0 bg-black/15"></div>
                </div>
            </div>
        </section>

        <!-- REST OF CONTENT -->
        <section class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16">
            <div class="mx-auto max-w-6xl">
                <!-- BLOCK 5 -->
                <div class="mt-12 sm:mt-14 md:mt-16">
                    <div class="max-w-4xl">
                        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                            {{ foundations.heading }}
                        </h2>
                        <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

                        <div class="space-y-4">
                            <template v-for="(b, bi) in foundationsBlocks" :key="`f-b-${bi}`">
                                <p v-if="b.type === 'p'"
                                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                                    <template v-for="(t, ti) in b.tokens" :key="`f-t-${bi}-${ti}`">
                                        <strong v-if="t.bold">{{ t.text }}</strong>
                                        <span v-else>{{ t.text }}</span>
                                    </template>
                                </p>
                                <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                                    <li v-for="(it, ii) in b.items" :key="`f-ul-${bi}-${ii}`">
                                        <template v-for="(t, ti) in it" :key="`f-ul-t-${bi}-${ii}-${ti}`">
                                            <strong v-if="t.bold">{{ t.text }}</strong>
                                            <span v-else>{{ t.text }}</span>
                                        </template>
                                    </li>
                                </ul>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- BLOCK 6 -->
                <div ref="keyFactsRef" class="mt-8 sm:mt-10 md:mt-12">
                    <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                        {{ keyFacts.heading }}
                    </h2>
                    <div class="w-12 h-px bg-neutral-700 mt-4 mb-8"></div>

                    <div class="grid gap-6 md:grid-cols-3">
                        <div v-for="(k, i) in keyFacts.items" :key="`kf-${i}`"
                            class="border border-neutral-900/35 bg-transparent text-center px-3 sm:px-4 py-10 flex flex-col items-center justify-between">
                            <!-- Number container -->
                            <div class="w-full flex items-center justify-center h-[72px] sm:h-[80px]">
                                <RollingNumber class="font-semibold tracking-tight text-neutral-900 leading-none"
                                    :class="i === 2 ? 'text-3xl sm:text-4xl md:text-[2.75rem]' : 'text-5xl sm:text-6xl'"
                                    :target="k.target" :suffix="k.suffix" :loops="k.loops" :duration="FACTS_DURATION"
                                    :start="factsStart" />
                            </div>

                            <!-- Label -->
                            <p class="mt-6 text-sm sm:text-base text-neutral-700 leading-snug">
                                {{ k.label }}
                            </p>
                        </div>
                    </div>
                </div>




                <!-- BLOCK 7 -->
                <div class="mt-12 sm:mt-14 md:mt-16">
                    <div class="max-w-4xl">
                        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                            {{ designIntent.heading }}
                        </h2>
                        <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

                        <div class="space-y-4">
                            <template v-for="(b, bi) in designIntentBlocks" :key="`di-b-${bi}`">
                                <p v-if="b.type === 'p'"
                                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                                    <template v-for="(t, ti) in b.tokens" :key="`di-t-${bi}-${ti}`">
                                        <strong v-if="t.bold">{{ t.text }}</strong>
                                        <span v-else>{{ t.text }}</span>
                                    </template>
                                </p>
                                <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                                    <li v-for="(it, ii) in b.items" :key="`di-ul-${bi}-${ii}`">
                                        <template v-for="(t, ti) in it" :key="`di-ul-t-${bi}-${ii}-${ti}`">
                                            <strong v-if="t.bold">{{ t.text }}</strong>
                                            <span v-else>{{ t.text }}</span>
                                        </template>
                                    </li>
                                </ul>
                            </template>
                        </div>
                    </div>
                </div>

                <!-- BLOCK 8 -->
                <div class="mt-12 sm:mt-14 md:mt-16 border-t border-neutral-200 pt-10 sm:pt-12">
                    <div class="max-w-4xl">
                        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
                            {{ join.heading }}
                        </h2>
                        <div class="w-12 h-px bg-neutral-700 mt-4 mb-6"></div>

                        <div class="space-y-4">
                            <template v-for="(b, bi) in joinBlocks" :key="`j-b-${bi}`">
                                <p v-if="b.type === 'p'"
                                    class="text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800">
                                    <template v-for="(t, ti) in b.tokens" :key="`j-t-${bi}-${ti}`">
                                        <strong v-if="t.bold">{{ t.text }}</strong>
                                        <span v-else>{{ t.text }}</span>
                                    </template>
                                </p>
                                <ul v-else class="list-disc pl-5 text-neutral-800 space-y-2">
                                    <li v-for="(it, ii) in b.items" :key="`j-ul-${bi}-${ii}`">
                                        <template v-for="(t, ti) in it" :key="`j-ul-t-${bi}-${ii}-${ti}`">
                                            <strong v-if="t.bold">{{ t.text }}</strong>
                                            <span v-else>{{ t.text }}</span>
                                        </template>
                                    </li>
                                </ul>
                            </template>
                        </div>

                        <!-- CTA (same sliding-black pattern style, no rounding) -->
                        <div class="mt-8">
                            <a :href="`mailto:${join.email}`"
                                class="relative overflow-hidden inline-flex items-center gap-3 border border-neutral-900 px-5 py-3 text-sm sm:text-base text-neutral-900 group">
                                <span
                                    class="absolute inset-0 bg-black translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300"></span>
                                <span class="relative z-10 group-hover:text-white transition-colors duration-300">Let’s
                                    connect</span>
                                <span
                                    class="relative z-10 group-hover:text-white transition-colors duration-300">→</span>
                            </a>

                            <p class="mt-3 text-sm text-neutral-700">
                                Or email us at
                                <a class="underline underline-offset-4" :href="`mailto:${join.email}`">{{ join.email
                                    }}</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </main>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// --- Rich text helpers (same idea as ProductDetail.vue / CaseStudy.vue) ---
// Supports:
// - **bold** tokens inline
// - blocks separated by blank line (\n\n)
// - within a block: multiple lines => bullet list, single line => paragraph

const parseInlineBold = (text = '') => {
    const s = String(text)
    if (!s) return []

    // Split and keep **...** tokens
    const parts = s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean)

    return parts.map((p) => {
        const bold = p.startsWith('**') && p.endsWith('**') && p.length >= 4
        return { text: bold ? p.slice(2, -2) : p, bold }
    })
}

const richTextBlocks = (raw = '') => {
    const s = String(raw || '')
    if (!s.trim()) return []

    const blocks = s
        .split(/\n\s*\n/g)
        .map((b) => b.trim())
        .filter(Boolean)

    return blocks.map((b) => {
        const lines = b
            .split(/\n+/g)
            .map((x) => x.trim())
            .filter(Boolean)

        if (lines.length > 1) {
            return {
                type: 'ul',
                items: lines.map((l) => parseInlineBold(l.replace(/^[-•]\s+/, '').trim())),
            }
        }

        return {
            type: 'p',
            tokens: parseInlineBold(lines[0] || ''),
        }
    })
}

const initials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean)
    const a = parts[0]?.[0] || ''
    const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] || '') : ''
    return (a + b).toUpperCase()
}

const RollingNumber = defineComponent({
    name: 'RollingNumber',
    props: {
        target: { type: Number, required: true },
        suffix: { type: String, default: '' },
        duration: { type: Number, default: 1800 },
        loops: { type: Number, default: 12 },
        start: { type: Boolean, default: false },
    },
    setup(props) {
        const measureRef = ref(null)
        const digitH = ref(0)
        const animate = ref(false)

        const formatNumber = (n) => Math.round(Number(n || 0)).toLocaleString('en-US')
        const formatted = computed(() => formatNumber(props.target))
        const chars = computed(() => Array.from(formatted.value))

        const stack = computed(() => {
            const total = (Number(props.loops) + 1) * 10
            return Array.from({ length: total }, (_, i) => String(i % 10))
        })

        const isDigit = (c) => c >= '0' && c <= '9'

        const digitIndex = (c) => {
            if (!isDigit(c)) return 0
            const d = Number(c)
            if (!animate.value) return 0
            return Number(props.loops) * 10 + d
        }

        const stackStyle = (c) => {
            const idx = digitIndex(c)
            const hgt = digitH.value || 0
            const y = hgt ? -(idx * hgt) : 0
            return {
                transform: `translateY(${y}px)`,
                transitionProperty: 'transform',
                transitionDuration: animate.value ? `${props.duration}ms` : '0ms',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }
        }

        const windowStyle = computed(() => (digitH.value ? { height: `${digitH.value}px` } : { height: '1em' }))

        const startAnim = (v) => {
            if (!v || animate.value) return
            requestAnimationFrame(() => {
                animate.value = true
            })
        }

        watch(() => props.start, (v) => startAnim(v), { immediate: true })

        onMounted(() => {
            requestAnimationFrame(() => {
                const el = measureRef.value
                if (!el) return
                const rect = el.getBoundingClientRect()
                if (rect?.height) digitH.value = rect.height
            })
        })

        return () => {
            const children = []

            // Hidden measuring digit
            children.push(h('span', { ref: measureRef, class: 'roll-digit-row roll-measure' }, '0'))

            // Main characters
            chars.value.forEach((c, i) => {
                if (isDigit(c)) {
                    children.push(
                        h(
                            'span',
                            { key: `c-${i}`, class: 'roll-digit-window', style: windowStyle.value },
                            [
                                h(
                                    'span',
                                    { class: 'roll-digit-stack', style: stackStyle(c) },
                                    stack.value.map((d, di) =>
                                        h('span', { key: `d-${i}-${di}`, class: 'roll-digit-row' }, d)
                                    )
                                ),
                            ]
                        )
                    )
                } else {
                    children.push(h('span', { key: `c-${i}`, class: 'roll-sep' }, c))
                }
            })

            if (props.suffix) {
                children.push(h('span', { class: 'roll-suffix' }, props.suffix))
            }

            return h('span', { class: 'roll-number inline-flex items-baseline justify-center' }, children)
        }
    },
})

// --- Page content (Office Solutions copy) ---

const heroTitle = 'Our Team'
const FACTS_DURATION = 4200

// IMPORTANT:
// Download the Google Drive video and place it in:
//   /public/about/our-team/our-team.mp4
// (Google Drive "view" links won’t stream reliably as <video src="">)
const heroVideoSrc = '/about/our-team/our-team.mp4'

const intro = {
    heading: 'Meet the team',
    body:
        "At Office Solutions, our strength lies in our people. Each member brings unique expertise, a collaborative spirit, and a shared passion for transforming spaces through exceptional flooring solutions. Get to know the faces behind the brand.",
}

const team = [
    { name: 'Lena Anas Saliah', role: 'Finance Operational Manager', image: '/about/our-team/team/lena.jpg' },
    { name: 'Sooraj Subramanyam', role: 'Senior Accountant', image: '/about/our-team/team/sooraj.jpeg' },
    { name: 'Suhail Hussain', role: 'Client Success Strategist', image: '/about/our-team/team/suhail.jpeg' },
    { name: 'Zalique Jayah', role: 'Regional Specifications Manager', image: '/about/our-team/team/zalique.jpeg' },
    { name: 'Dawood Ali Mirza', role: 'Regional Head', image: '/about/our-team/team/dawood.jpeg' },
    { name: 'Kimberley Dsouza', role: 'Hospitality Flooring Specialist', image: '/about/our-team/team/kimberley.jpeg' },
    { name: 'Naseer Ahmed', role: 'Site Operations Supervisor', image: '/about/our-team/team/naseer.jpeg' },
    { name: 'Idris Omar', role: 'Business Development Manager', image: '/about/our-team/team/idris.png' },
    { name: 'Julia Akopova', role: 'Specifications Manager', image: '/about/our-team/team/yulia.JPG' },
    { name: 'Sheema Riyal', role: 'Interior Designer', image: '/about/our-team/team/sheema.jpeg' },
]

// Block 4 team photo
// Download + place here:
//   /public/about/our-team/team-photo.webp
const teamPhoto = '/about/our-team/team-photo.jpg'

const foundations = {
    heading: 'Unbeatable Foundations.',
    body:
        "At Office Solutions, flooring is more than just a product — it’s a promise. As a trusted partner in the UAE’s design and construction landscape, we bring decades of hands-on experience, industry insight, and a collaborative spirit to every project. We treat our team, clients, and collaborators as one ecosystem — growing stronger together. Just as floors ground and define a space, relationships ground and define our business. They are the true foundation we build on — with care, consistency, and commitment.",
}

const keyFacts = {
    heading: 'Key facts',
    items: [
        { target: 10, suffix: '+', loops: 8, label: 'Years of flooring solutions' },
        { target: 2000, suffix: '+', loops: 12, label: 'Projects completed across UAE' },
        { target: 1000000, suffix: '+ SQFT', loops: 18, label: 'Flooring installed' },
    ],
}

const designIntent = {
    heading: 'Design with intent',
    body:
        "At Office Solutions, we’re committed to sourcing and delivering flooring solutions responsibly. Sustainability is not just a goal — it’s part of our practice. Whether through our partnerships with environmentally conscious brands or our material recommendations tailored for long-term performance, we aim to reduce impact while elevating design. We actively contribute to the communities we serve — from the region’s thriving architecture and design network to the neighbourhoods where we live, work, and collaborate.",
}

const join = {
    heading: 'Join our team',
    body:
        "We take pride in being dependable, solution-oriented, and collaborative. We value people who are proactive, professional, and passionate about making a difference — in projects and in relationships. If that sounds like you, let’s connect.",
    email: 'info@officesolutions.ae',
}

const introBlocks = computed(() => richTextBlocks(intro.body))
const foundationsBlocks = computed(() => richTextBlocks(foundations.body))
const designIntentBlocks = computed(() => richTextBlocks(designIntent.body))
const joinBlocks = computed(() => richTextBlocks(join.body))

const heroRef = ref(null)
const meetRef = ref(null)
const keyFactsRef = ref(null)
const factsStart = ref(false)

const scrollToMeet = () => {
    const el = meetRef.value
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

let io = null
let factsIo = null
const BODY_CLASS = 'page-our-team'
const HERO_CLASS = 'os-hero-top'

onMounted(() => {
    document.title = 'Our Team – Office Solutions'

    // Mark body so we can style the global header as transparent ONLY while hero is in view.
    document.body.classList.add(BODY_CLASS)

    const heroEl = heroRef.value
    if (heroEl && typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(
            ([entry]) => {
                document.body.classList.toggle(HERO_CLASS, !!entry?.isIntersecting)
            },
            { threshold: 0.6 }
        )
        io.observe(heroEl)
    } else {
        // Fallback: keep hero header styling on if IO isn’t available
        document.body.classList.add(HERO_CLASS)
    }
    const factsEl = keyFactsRef.value
    if (factsEl && typeof IntersectionObserver !== 'undefined') {
        factsIo = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    factsStart.value = true
                    try { factsIo && factsIo.disconnect() } catch (_) { }
                }
            },
            { threshold: 0.35 }
        )
        factsIo.observe(factsEl)
    }
})

onBeforeUnmount(() => {
    try {
        if (io) io.disconnect()
    } catch (_) {
        // no-op
    }

    try {
        if (factsIo) factsIo.disconnect()
    } catch (_) {
        // no-op
    }

    document.body.classList.remove(HERO_CLASS)
    document.body.classList.remove(BODY_CLASS)
})
</script>

<style scoped>
.hero-arrow {
    font-size: 18px;
    line-height: 1;
    padding: 2px 10px;
    border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(6px);
}

/*
  Transparent header wiring:
  Apply ONLY while the hero is in view (body.os-hero-top).
  - Header background must be transparent
  - ONE thin bottom border only (no top border)
  - All header/nav text + icons must be white
  - Logo must be white by default on hero, and revert to normal after scroll
*/
/* 
  Transparent header wiring (updated):
  - Remove all borders/shadows everywhere
  - Add a single bottom line via box-shadow (not border)
*/
:global(body.os-hero-top header),
:global(body.os-hero-top header[role="banner"]),
:global(body.os-hero-top .site-header),
:global(body.os-hero-top .app-header),
:global(body.os-hero-top .header),
:global(body.os-hero-top .navbar) {
    background: transparent !important;
    /* remove any existing borders/shadows so we don't get two lines */
    border: 0 !important;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.28) !important;
}

/* Some implementations add their own dividers inside the header/nav */
:global(body.os-hero-top header *),
:global(body.os-hero-top header[role="banner"] *),
:global(body.os-hero-top .site-header *),
:global(body.os-hero-top .app-header *),
:global(body.os-hero-top .header *),
:global(body.os-hero-top .navbar *) {
    border-top: 0 !important;
    border-bottom: 0 !important;
    box-shadow: none !important;
}

/* Also ensure nav itself doesn't draw a second divider line */
:global(body.os-hero-top nav) {
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
}

/* Some header implementations draw extra lines via pseudo elements */
:global(body.os-hero-top header::before),
:global(body.os-hero-top header::after),
:global(body.os-hero-top .site-header::before),
:global(body.os-hero-top .site-header::after),
:global(body.os-hero-top .app-header::before),
:global(body.os-hero-top .app-header::after),
:global(body.os-hero-top .navbar::before),
:global(body.os-hero-top .navbar::after),
:global(body.os-hero-top nav::before),
:global(body.os-hero-top nav::after) {
    border-top: 0 !important;
    border-bottom: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
}

/* Force all header text to white while hero is active */
:global(body.os-hero-top header *),
:global(body.os-hero-top .site-header *),
:global(body.os-hero-top .app-header *),
:global(body.os-hero-top .header *),
:global(body.os-hero-top .navbar *),
:global(body.os-hero-top nav *) {
    color: #fff !important;
}

:global(body.os-hero-top header svg),
:global(body.os-hero-top .site-header svg),
:global(body.os-hero-top .app-header svg),
:global(body.os-hero-top .header svg),
:global(body.os-hero-top .navbar svg),
:global(body.os-hero-top nav svg) {
    fill: #fff !important;
    stroke: #fff !important;
}

/*
  Logo: in your header, the logo is an <img>. On the hero we want it WHITE.
  Using brightness(0) + invert(1) is reliable for black PNG/SVG logos.
*/
:global(body.os-hero-top header img),
:global(body.os-hero-top nav img),
:global(body.os-hero-top .site-header img),
:global(body.os-hero-top .app-header img),
:global(body.os-hero-top .navbar img),
:global(body.os-hero-top .header img),
:global(body.os-hero-top .logo-zoom img),
:global(body.os-hero-top .site-logo img),
:global(body.os-hero-top .brand-logo img),
:global(body.os-hero-top .header-logo img),
:global(body.os-hero-top .logo img),
:global(body.os-hero-top img[src*="/hero/os-logo-trans"]),
:global(body.os-hero-top img[src*="os-logo-trans"]) {
    filter: brightness(0) invert(1) contrast(1.05) !important;
    transition: filter 200ms ease;
}

/* Team headshot framing: zoom out slightly + keep faces visible */
.team-photo {
    transform: scale(0.9);
    transform-origin: center;
    object-position: center 20%;
}

/* Rolling number (casino-style) */
:global(.roll-number) {
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
}

:global(.roll-measure) {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    line-height: 1.05;
}

:global(.roll-digit-window) {
    display: inline-block;
    overflow: hidden;
    vertical-align: baseline;
    line-height: 1.05;
}

:global(.roll-digit-stack) {
    display: flex;
    flex-direction: column;
    will-change: transform;
}

:global(.roll-digit-row) {
    line-height: 1.05;
}

:global(.roll-sep) {
    display: inline-block;
    padding: 0 0.05em;
}

:global(.roll-suffix) {
    display: inline-block;
    margin-left: 0.08em;
    white-space: nowrap;
    font-size: 0.82em;
    /* helps long suffixes like “+ SQFT” fit neatly */
}
</style>