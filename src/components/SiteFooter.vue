<!-- src/components/SiteFooter.vue -->
<script setup>
// Optional props if you want to swap the logo/brand text later
const props = defineProps({
    logoSrc: { type: String, default: '/hero/os-logo-trans.png' },
    brandName: { type: String, default: 'OfficeSolutions' },
})

const navColumns = [
    {
        links: [
            { label: 'Products', href: '/products' },
            { label: 'Applications', href: '/applications' },
            { label: 'Materials', href: '/materials' },
            { label: 'Brands', href: '/brands' },
            { label: 'Sectors', href: '/sectors' },
            { label: 'Case studies', href: '/case-studies' },
            { label: 'Files & downloads', href: '/resources' },
            { label: 'Our story', href: '/about' },
            { label: 'Sustainability', href: '/sustainability' },
        ],
    },
    {
        links: [
            { label: 'Designer\'s Choice', href: 'designers-choice' },
        ],
    },
    {
        links: [
            { label: 'Instagram', href: '#' },
            { label: 'Facebook', href: '#' },
            { label: 'LinkedIn', href: '#' },
            { label: 'Pinterest', href: '#' },
        ],
    },
]

// NEW: map link for “Get Direction”
const officeAddress = '405 , Nastaran Tower, Jaddaf Waterfront, Dubai, UAE'
const mapQuery = encodeURIComponent(`Office Solutions, ${officeAddress}`)
const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`
</script>

<template>
    <footer class="mt-20 bg-[#8C462C] text-white">
        <div class="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
            <div class="grid gap-10 lg:grid-cols-2 lg:gap-12">
                <!-- Left: Logo + Contact -->
                <div class="flex flex-col">
                    <!-- Logo -->
                    <div class="mb-12">
                        <div class="flex items-center gap-3 -ml-5">
                            <img
                                v-if="props.logoSrc"
                                :src="props.logoSrc"
                                :alt="props.brandName"
                                class="h-9 w-auto logo-zoom"
                            />
                            <span v-else class="text-3xl font-semibold tracking-tight">{{ props.brandName }}</span>
                        </div>
                    </div>

                    <!-- Contact details -->
                    <div class="space-y-2 text-[15px] leading-relaxed opacity-95">
                        <p>
                            Sales:
                            <a href="tel:+971559270050" class="underline hover:no-underline">+971 55 927 0050</a>
                        </p>
                        <p>
                            Office:
                            <a href="tel:+97148347643" class="underline hover:no-underline">+64 9 634 4455</a>
                        </p>
                        <p>
                            Email:
                            <a href="mailto:info@officesolutionsuae.com"
                                class="underline hover:no-underline">info@officesolutionsuae.com</a>
                        </p>
                    </div>

                    <div class="mt-8 text-[15px] leading-relaxed opacity-95">
                        <p class="font-medium">Head office</p>
                        <p>405 , Nastaran Tower</p>
                        <p>Jaddaf Waterfront</p>
                        <p>Dubai</p>
                        <p>UAE</p>

                        <!-- Get Direction -->
                        <a :href="mapUrl" target="_blank" rel="noopener noreferrer"
                            class="mt-3 inline-flex items-center gap-2 text-[14px] font-semibold underline underline-offset-4 hover:no-underline app-footer-subheading">
                            <!-- small pin icon -->
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <path d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z" />
                                <circle cx="12" cy="11" r="2.5" />
                            </svg>
                            Get Direction
                        </a>
                    </div>

                    <a href="/contact"
                        class="mt-8 inline-flex items-center gap-3 text-[15px] font-medium underline underline-offset-4 hover:no-underline">
                        Contact our team
                        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" stroke-linejoin="round">
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                        </svg>
                    </a>
                </div>

                <!-- Right: Newsletter + Links -->
                <div class="lg:border-l lg:border-white/25 lg:pl-12">
                    <div class="max-w-2xl">
                        <h3 class="text-[20px] font-semibold leading-snug sm:text-[22px]">
                            Explore the latest in flooring design and materials. Connect with our team today.
                        </h3>

                        <form class="mt-8 space-y-6" @submit.prevent>
                            <div class="grid gap-6 sm:grid-cols-2">
                                <label class="block">
                                    <span class="mb-2 block text-sm opacity-75">First name</span>
                                    <input type="text"
                                        class="w-full border-b border-white/50 bg-transparent p-2 outline-none placeholder-white/50 focus:border-white" />
                                </label>
                                <label class="block">
                                    <span class="mb-2 block text-sm opacity-75">Last name</span>
                                    <input type="text"
                                        class="w-full border-b border-white/50 bg-transparent p-2 outline-none placeholder-white/50 focus:border-white" />
                                </label>
                            </div>

                            <label class="block">
                                <span class="mb-2 block text-sm opacity-75">Email address</span>
                                <input type="email"
                                    class="w-full border-b border-white/50 bg-transparent p-2 outline-none placeholder-white/50 focus:border-white" />
                            </label>

                            <button type="submit"
                                class="group inline-flex w-full items-center justify-between rounded border border-white/60 px-5 py-3 text-[15px] font-semibold hover:bg-white hover:text-[#8C462C] sm:w-auto">
                                Connect
                                <span
                                    class="ml-4 inline-flex h-5 w-5 items-center justify-center rounded-full border border-current">
                                    <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor"
                                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M5 12h14" />
                                        <path d="m12 5 7 7-7 7" />
                                    </svg>
                                </span>
                            </button>
                        </form>

                        <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            <nav v-for="(col, idx) in navColumns" :key="idx" class="text-[15px] leading-8">
                                <ul>
                                    <li v-for="l in col.links" :key="l.label">
                                        <a :href="l.href" class="hover:underline">{{ l.label }}</a>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Bottom bar -->
            <div class="mt-12 border-t border-white/20 pt-6 text-sm">
                <div class="flex flex-col items-start justify-between gap-4 sm:flex-row">
                    <div class="flex flex-wrap items-center gap-x-6 gap-y-2 opacity-90">
                        <a href="/privacy" class="hover:underline">Privacy policy</a>
                        <a href="#" class="hover:underline">Site credit</a>
                    </div>
                    <div class="opacity-90">© 2025 Office Solutions</div>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
.logo-zoom {
    /* Keep the logo visually larger without shifting left past the column edge */
    transform: translateX(-2px) scale(6.0);
    transform-origin: left center;
    transition: filter 200ms ease;
}
input::placeholder {
    color: rgba(255, 255, 255, .6);
}
</style>
