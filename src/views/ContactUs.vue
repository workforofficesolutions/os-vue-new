<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const subject = ref('General Enquiry')

// Parallax for the right-rail image (desktop only)
const contactSection = ref(null)
const parallaxY = ref(0)
let rafId = 0
let mediaQuery
let mqHandler

function updateParallax() {
  if (!contactSection.value) return
  const rect = contactSection.value.getBoundingClientRect()
  const vh = window.innerHeight
  const maxScroll = Math.max(rect.height - vh, 1)
  const scrolled = Math.min(Math.max(-rect.top, 0), maxScroll)
  const progress = scrolled / maxScroll
  const range = 90 // px of travel
  parallaxY.value = Math.round((progress - 0.5) * range)
}

function onScrollParallax() {
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(updateParallax)
}

onMounted(() => {
  mediaQuery = window.matchMedia('(min-width: 1024px)')
  mqHandler = () => {
    if (mediaQuery.matches) {
      onScrollParallax()
      window.addEventListener('scroll', onScrollParallax, { passive: true })
      window.addEventListener('resize', onScrollParallax)
    } else {
      window.removeEventListener('scroll', onScrollParallax)
      window.removeEventListener('resize', onScrollParallax)
      parallaxY.value = 0
    }
  }
  mediaQuery.addEventListener('change', mqHandler)
  mqHandler()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScrollParallax)
  window.removeEventListener('resize', onScrollParallax)
  if (mediaQuery && mqHandler) mediaQuery.removeEventListener('change', mqHandler)
  cancelAnimationFrame(rafId)
})

function goProducts() {
    router.push('/products')
}
</script>

<template>
    <main class="pt-16 pb-0 bg-[#F4EFE7] text-black">
        <!-- Two-column visiting-card layout -->
        <section ref="contactSection" class="grid grid-cols-1 lg:grid-cols-2 w-full">
            <!-- LEFT: details + form -->
            <div class="pl-4 pr-6 sm:pl-6 sm:pr-8 lg:pl-10 lg:pr-12 py-10 lg:py-12 min-w-0 break-words">
                <h1 class="text-[clamp(28px,4vw,44px)] font-semibold tracking-tight mb-6">
                    Enquiry details
                </h1>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <p class="text-[13px] sm:text-[14px] leading-6 text-black/70">
                        We’re based in Tāmaki Makaurau Auckland, supporting specifiers and installers around the
                        country. Get in touch for product and design support, samples, installation manuals and
                        catalogues.
                    </p>
                    <div class="text-[15px] leading-relaxed text-black/80">
                        <p><strong>New Zealand:</strong> 0508 238 262</p>
                        <p><strong>International:</strong> +64 9 634 4455</p>
                        <p>
                            <strong>Email:</strong>
                            <a href="mailto:sales@advanceflooring.co.nz"
                                class="underline break-all">sales@advanceflooring.co.nz</a>
                        </p>
                        <div class="mt-4">
                            <p class="font-medium">Head office</p>
                            <p>
                                10 Harbour Ridge Drive<br />
                                Wiri, Auckland 2104<br />
                                Aotearoa New Zealand
                            </p>
                        </div>
                    </div>
                </div>

                <!-- FORM -->
                <form class="space-y-7">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">First
                                name*</label>
                            <input
                                class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2" />
                        </div>
                        <div>
                            <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Last
                                name*</label>
                            <input
                                class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2" />
                        </div>
                    </div>

                    <div>
                        <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Your email
                            address*</label>
                        <input type="email"
                            class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2" />
                    </div>

                    <div>
                        <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Company
                            name*</label>
                        <input
                            class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2" />
                    </div>

                    <div>
                        <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Phone</label>
                        <input type="tel"
                            class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2" />
                    </div>

                    <div>
                        <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Subject*</label>
                        <select v-model="subject"
                            class="w-full bg-transparent border-b border-black/40 focus:border-black outline-none py-2">
                            <option>General Enquiry</option>
                            <option>Samples</option>
                            <option>Technical support</option>
                            <option>Sales</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[13px] md:text-[12px] tracking-wide uppercase font-semibold text-black mb-3">Message</label>
                        <textarea rows="6"
                            class="w-full bg-transparent border border-black/30 focus:border-black outline-none p-3"></textarea>
                    </div>

                    <div class="flex items-center gap-4">
                        <button type="button" class="px-3 py-2 border text-[13px]">Upload files</button>
                        <label class="inline-flex items-center gap-2 text-[13px]">
                            <input type="checkbox" class="accent-black" />
                            <span>Subscribe to our 6-weekly newsletter</span>
                        </label>
                    </div>

                    <div>
                        <button type="submit" class="btn-slide-black px-5 py-2">
                            <span>Send</span>
                            <span aria-hidden>→</span>
                        </button>
                    </div>
                </form>
            </div>

            <!-- RIGHT: sticky rail with centered landscape image, equal breathing, darker beige bg -->
            <div class="hidden lg:block bg-[#E1D8C8] overflow-hidden min-w-0">
              <!-- Stick below the header; use the remaining viewport height and center the image vertically -->
              <div class="sticky top-16">
                <div class="h-[calc(100vh-4rem)] flex items-center px-6 py-8">
                  <div
                    class="relative w-full aspect-[16/9] overflow-hidden group cursor-pointer"
                    :style="{ transform: `translateY(${parallaxY}px)`, willChange: 'transform' }"
                    role="link"
                    aria-label="Explore products"
                    tabindex="0"
                    @click="goProducts"
                    @keyup.enter="goProducts"
                  >
                    <img src="/cases/anderson-main.avif" alt="Project image" class="absolute inset-0 w-full h-full object-cover" />
                    <!-- Bottom overlay: left label, right arrow -->
                    <div class="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 sm:p-6 pointer-events-none">
                      <span class="text-white text-[18px] font-medium select-none underline-offset-4 group-hover:underline">Explore products</span>
                      <span aria-hidden class="text-white text-2xl leading-none select-none">→</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </section>
    </main>
</template>

<style scoped>
/* (Intentionally minimal – typography inherits your site scale) */
</style>