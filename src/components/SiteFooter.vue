<script setup>
// Optional props if you want to swap the logo/brand text later
const props = defineProps({
    logoSrc: { type: String, default: '/hero/os-logo.png' },
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
            { label: 'MasterSpec', href: '#' },
            { label: 'EBOSS', href: '#' },
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
</script>

<template>
    <footer class="mt-20 bg-[#8C462C] text-white">
        <div class="mx-auto max-w-7xl px-4 py-14 sm:py-16 lg:py-20">
            <div class="grid gap-10 lg:grid-cols-2 lg:gap-12">
                <!-- Left: Logo + Contact -->
                <div class="flex flex-col">
                    <!-- Logo -->
                    <div class="mb-12">
                        <div class="flex items-center gap-3">
                            <img v-if="props.logoSrc" :src="props.logoSrc" :alt="props.brandName" class="h-9 w-auto" />
                            <span v-else class="text-3xl font-semibold tracking-tight">{{ props.brandName }}</span>
                        </div>
                    </div>

                    <!-- Contact details -->
                    <div class="space-y-2 text-[15px] leading-relaxed opacity-95">
                        <p>
                            New Zealand:
                            <a href="tel:0508238262" class="underline hover:no-underline">0508 238 262</a>
                        </p>
                        <p>
                            International:
                            <a href="tel:+6496344455" class="underline hover:no-underline">+64 9 634 4455</a>
                        </p>
                        <p>
                            Email:
                            <a href="mailto:sales@officesolutions.uae"
                                class="underline hover:no-underline">sales@officesolutions.uae</a>
                        </p>
                    </div>

                    <div class="mt-8 text-[15px] leading-relaxed opacity-95">
                        <p class="font-medium">Head office</p>
                        <p>10 Harbour Ridge Drive</p>
                        <p>Wiri, Auckland 2104</p>
                        <p>Aotearoa New Zealand</p>
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
                            Stay up to date with the latest advances in
                            flooring design and materials. Sign up to
                            our 6-weekly newsletter below:
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
                                Sign up
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
input::placeholder {
    color: rgba(255, 255, 255, .6);
}
</style>
