<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

const solid = ref(false)
const open = ref(false)
const route = useRoute()
const router = useRouter()

// ===== Products Mega Menu State =====
const productsOpen = ref(false)
const hoveredTop = ref(null) // null until user hovers: 'categories' | 'applications' | 'brands'
const hoveredItem = ref(null)
let closeTimer = null

// Centralized menu manager
function closeAllMenus() {
  productsOpen.value = false
  sectorsOpen.value = false
  resourcesOpen.value = false
  aboutOpen.value = false
  resetProductsMenu()
  resetSectorsMenu()
  resetResourcesMenu()
  resetAboutMenu()
  cancelClose()
}

function scheduleCloseMenu() {
  cancelClose()
  closeTimer = setTimeout(() => closeAllMenus(), 120)
}

let handleScroll = null

// ===== Sectors Mega Menu State =====
const sectorsOpen = ref(false)
const hoveredSector = ref(null)

// ===== Resources Mega Menu State =====
const resourcesOpen = ref(false)
const hoveredResource = ref(null)

// ===== About Mega Menu State =====
const aboutOpen = ref(false)
const hoveredAbout = ref(null)

// ===== Mobile Drawer State =====
const mobileStage = ref('root') // 'root' | 'products' | 'products-level2' | 'sectors' | 'resources' | 'about'
const mobileHistory = ref([])
const mobileTopKey = ref(null) // holds 'categories' | 'applications' | 'brands' when in products-level2

function openMobile() {
  closeAllMenus()
  open.value = true
  mobileStage.value = 'root'
  mobileHistory.value = []
  mobileTopKey.value = null
}
function mobileGo(stage) {
  mobileHistory.value.push(mobileStage.value)
  mobileStage.value = stage
}
function mobileBack() {
  const prev = mobileHistory.value.pop()
  if (prev) {
    mobileStage.value = prev
  } else {
    open.value = false
    mobileStage.value = 'root'
  }
}
function openProductsMobile() { mobileTopKey.value = null; mobileGo('products') }
function openSectorsMobile() { mobileGo('sectors') }
function openResourcesMobile() { mobileGo('resources') }
function openAboutMobile() { mobileGo('about') }
function chooseTopMobile(key) { mobileTopKey.value = key; mobileGo('products-level2') }
const mobileCurrentGroup = computed(() => (mobileTopKey.value ? groups[mobileTopKey.value] : null))

// Header should be solid (light) if page is scrolled enough OR products OR sectors OR resources OR about menu is open
const headerSolid = computed(() => solid.value || productsOpen.value || sectorsOpen.value || resourcesOpen.value || aboutOpen.value)
// Sectors content for the Sectors mega menu
const sectors = [
  { title: 'Workplace', image: '/block4/block4-workplace.jpg', blurb: 'Comfortable, durable flooring designed for productivity and a wide range of patterns.' },
  { title: 'Education', image: '/block4/block4-education.jpg', blurb: 'Robust, acoustic and easy-care finishes for learning environments.' },
  { title: 'Healthcare', image: '/block4/block4-healthcare.jpg', blurb: 'Hygienic, cleanable and resilient solutions for clinical settings.', pos: '40% 50%' },
  { title: 'Public buildings', image: '/block4/block4-publicbuildings.jpg', blurb: 'Hard-wearing finishes for civic and community spaces.' },
  { title: 'Aged care', image: '/block4/block4-agedcare.jpg', blurb: 'Comfort, safety and dignity with practical maintenance in mind.' },
  { title: 'Shopping & showrooms', image: '/block4/block4-shopping.jpg', blurb: 'Brand-forward surfaces that stand up to traffic and look great.' },
  { title: 'Sport', image: '/block4/block4-sport.jpg', blurb: 'Performance underfoot with shock absorption and durability.' },
]
function slugify(txt) {
  return txt.toLowerCase().replace(/&/g, 'and').replace(/®/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}
function goToSector(item) {
  if (!item) return
  router.push({ path: `/sectors/${slugify(item.title)}` })
  closeSectors()
}
function resetSectorsMenu() { hoveredSector.value = null }

function openSectors() {
  if (sectorsOpen.value) { closeAllMenus(); return }
  closeAllMenus()
  sectorsOpen.value = true
  cancelClose()
}

function closeSectors() { closeAllMenus() }

// ===== Resources content & helpers =====
const resources = [
  { title: 'Files & downloads', path: '/files-and-downloads' },
  { title: 'News & articles', path: '/articles' },
]

function resetResourcesMenu() { hoveredResource.value = null }

function openResources() {
  if (resourcesOpen.value) { closeAllMenus(); return }
  closeAllMenus()
  resourcesOpen.value = true
  cancelClose()
}

function closeResources() { closeAllMenus() }

function goToResource(item) {
  if (!item) return
  router.push(item.path)
  closeResources()
}

// ===== About content & helpers =====
const aboutItems = [
  { title: 'Our story', path: '/about/our-story' },
  { title: 'Our team', path: '/about/our-team' },
  { title: 'Sustainability', path: '/about/sustainability' },
  { title: 'Contact us', path: '/contact' },
]

function resetAboutMenu() { hoveredAbout.value = null }

function openAbout() {
  if (aboutOpen.value) { closeAllMenus(); return }
  closeAllMenus()
  aboutOpen.value = true
  cancelClose()
}

function closeAbout() { closeAllMenus() }

function goToAbout(item) {
  if (!item) return
  router.push(item.path)
  closeAbout()
}

function goToAboutCTA() {
  router.push('/about/community-support')
  closeAbout()
}

function goToCaseStudies() {
  router.push('/case-studies')
  closeAllMenus()
}

function goToContact() {
  router.push('/contact')
  closeAllMenus()
}

// Even stronger vignette (desktop only): global dim + heavier radial focus on left/top
const vignetteBg = computed(() =>
  'linear-gradient(rgba(0,0,0,0.28), rgba(0,0,0,0.28)), radial-gradient(160% 180% at 10% 10%, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.48) 55%, rgba(0,0,0,0.68) 100%)'
)

// Three top levels shown in the first drawer
const TOPS = [
  { key: 'categories', label: 'By category' },
  { key: 'applications', label: 'By application' },
  { key: 'brands', label: 'By brand' },
  { key: 'availability', label: 'By availability' },
]

// Scalable content model for the drawers
const groups = {
  categories: {
    title: 'Categories',
    blurb:
      'From recyclable aluminium to advanced vinyl, carpet, Kinetex or rubber, our flooring categories are selected for performance, ethics and aesthetics.',
    queryKey: 'productCategory',
    ctaText: 'Explore materials',
    items: [
      {
        title: 'Entrance systems',
        image: '/block3/block3-entrancesystems.jpg',
        blurb:
          'Aluminium Architectural Series and entry carpets that trap dirt and moisture for cleaner, safer interiors.',
      },
      { title: 'Carpet flooring', image: '/block3/block3-carpetflooring.jpg', blurb: 'Durable, acoustic and expressive carpet solutions for commercial spaces.' },
      { title: 'Vinyl flooring', image: '/block3/block3-vinylflooring.jpg', blurb: 'Versatile, affordable and tough vinyl for a wide range of settings.' },
      { title: 'Rubber flooring', image: '/block3/block3-rubberflooring.jpg', blurb: 'Shock-absorbing, durable EPDM and reclaimed rubber with a modern aesthetic.' },
      { title: 'Kinetex® flooring', image: '/block3/block3-kinetexflooring.jpg', blurb: 'Soft-surface performance flooring: durable, cleanable and comfortable.' },
    ],
  },
  applications: {
    title: 'Applications',
    blurb:
      'From hospitality to healthcare, offices to education, we stock flooring for every industry—from front door to back of house.',
    queryKey: 'applications',
    ctaText: 'Explore applications',
    items: [
      { title: 'Entrance', image: '/products/applications/entrance.jpg', blurb: 'Stop dirt at the door and protect interiors.' },
      { title: 'Common & high traffic areas', image: '/products/applications/high-traffic.jpg', blurb: 'Hard-wearing surfaces for busy spaces.' },
      { title: 'Healthcare areas', image: '/products/applications/healthcare.jpg', blurb: 'Hygienic, easily cleanable finishes for clinical settings.' },
      { title: 'Sports', image: '/products/applications/sports.jpg', blurb: 'Shock absorption and performance underfoot.' },
      { title: 'Kitchens & bathrooms', image: '/products/applications/kitchens.jpg', blurb: 'Slip-resistant, cleanable options for wet areas.' },
      { title: 'Service areas', image: '/products/applications/service.jpg', blurb: 'Durable, low-maintenance back-of-house solutions.' },
      { title: 'Stairways', image: '/products/applications/stairs.jpg', blurb: 'Safe treads and finishes for vertical circulation.' },
    ],
  },
  brands: {
    title: 'Brands',
    blurb:
      'Trusted global names and our own innovations—quality, architectural integrity and creative solutions for every project.',
    queryKey: 'brand',
    ctaText: 'Explore brands',
    items: [
      { title: 'Modulyss', image: '/brand/modulyss/products/artus.webp', blurb: 'Design-led carpet tiles with circularity in mind.' },
      { title: 'Amtico', image: '/products/brands/amtico.jpg', blurb: 'Premium LVT with outstanding design flexibility.' },
      { title: 'Unitile', image: '/products/brands/unitile.jpg', blurb: 'Accessible raised access flooring for modern workplaces.' },
      { title: 'Armstrong', image: '/products/brands/armstrong.jpg', blurb: 'Design-led carpet tiles with durability in mind.' },
    ],
  },
  availability: {
    title: 'Availability',
    blurb:
      'Jump straight to our in-stock ranges for faster delivery and simpler selections.',
    queryKey: 'availability',
    // No CTA path for now, this group just sends users to dedicated in-stock pages.
    items: [
      {
        title: 'Modulyss – In stock',
        image: '/brand/modulyss/products/artus.webp',
        blurb: 'See our current in-stock Modulyss carpet tile ranges for quick turnaround projects.',
        brandSlug: 'modulyss',
      },
      {
        title: 'Amtico – In stock',
        image: '/products/brands/amtico.jpg',
        blurb: 'View Amtico LVT designs we currently hold in stock for faster delivery.',
        brandSlug: 'amtico',
      },
      {
        title: 'Unitile – In stock',
        image: '/products/brands/unitile.jpg',
        blurb: 'Browse Unitile raised access flooring panels available ex-stock for your projects.',
        brandSlug: 'unitile',
      },
    ],
  },
}

const currentGroup = computed(() => (hoveredTop.value ? groups[hoveredTop.value] : null))
// No default preview — Drawer 3 opens only when a middle item is hovered

// Helper for current group's base path
const currentGroupPath = computed(() => (hoveredTop.value ? `/${hoveredTop.value}` : '#'))

function goPath(path) {
  if (!path || path === '#') return
  router.push(path)
  closeProducts()
}

watch(hoveredTop, () => {
  // Reset the preview when switching top-level or when leaving it
  hoveredItem.value = null
})

function resetProductsMenu() {
  hoveredTop.value = null
  hoveredItem.value = null
}

function openProducts() {
  if (productsOpen.value) { closeAllMenus(); return }
  closeAllMenus()
  productsOpen.value = true
  cancelClose()
}

function closeProducts() { closeAllMenus() }

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

function goTo(item, group) {
  if (!item || !group) return

  // Special routing for Availability → dedicated in-stock pages
  if (group.queryKey === 'availability') {
    const slug = (item.brandSlug || '').toString().toLowerCase().trim()
    if (slug) {
      router.push({ path: `/products/instock/${slug}` })
      closeProducts()
      return
    }
  }

  const key = group.queryKey

  // Base query: clicked dimension + default view
  const base = { view: 'grid', [key]: item.title }

  // NOTE:
  // We no longer pass hero image or blurb via query params.
  // The /products page will resolve hero content locally
  // based on the incoming `productCategory`, `applications`, or `brand`.

  const merged = {
    ...base,
    ...(group?.defaultQuery || {}),
    ...(item?.defaultQuery || {}),
    ...(group?.query || {}),
    ...(item?.query || {}),
  }

  router.push({ path: '/products', query: merged })
  closeProducts()
}

// Close on route change or ESC/scroll
watch(() => route.fullPath, () => closeAllMenus())
function onKey(e) { if (e.key === 'Escape') closeAllMenus() }
onMounted(() => {
  window.addEventListener('keydown', onKey)
  handleScroll = () => closeAllMenus()
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey)
  if (handleScroll) window.removeEventListener('scroll', handleScroll)
})

let headerTrigger = null

function killTrigger() {
  if (headerTrigger) {
    headerTrigger.kill()
    headerTrigger = null
  }
}

function createTrigger(hero) {
  solid.value = false

  const endDistance = () => {
    const h = hero.getBoundingClientRect().height || hero.offsetHeight || window.innerHeight
    return Math.max(h, window.innerHeight * 0.6) * 0.5
  }

  // hysteresis thresholds
  const SOLID_ON = 0.92   // become solid when past 92% of the range
  const SOLID_OFF = 0.85   // go back to transparent below 85%
  let isSolid = false

  headerTrigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: () => `+=${endDistance()}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (!isSolid && self.progress >= SOLID_ON) {
        isSolid = true
        solid.value = true
      } else if (isSolid && self.progress <= SOLID_OFF) {
        isSolid = false
        solid.value = false
      }
    },
    onLeaveBack: () => { isSolid = false; solid.value = false },
  })

  ScrollTrigger.refresh()
}


function setupHeaderTriggerWithRetry(retries = 0) {
  killTrigger()

  const hero = document.getElementById('hero')

  if (!hero) {
    // Give router-view time to mount; try a few times before concluding “no hero”
    if (retries < 10) {
      setTimeout(() => setupHeaderTriggerWithRetry(retries + 1), 50)
      return
    }
    // No hero on this route → keep header solid
    solid.value = true
    return
  }

  createTrigger(hero)
}

onMounted(async () => {
  await nextTick()
  // first run (home may not be mounted yet)
  setupHeaderTriggerWithRetry()
})

// Re-init when route changes
watch(() => route.fullPath, async () => {
  await nextTick()
  setupHeaderTriggerWithRetry()
})

onBeforeUnmount(killTrigger)
</script>




<template>
  <header id="site-header" class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
    :class="headerSolid ? 'bg-white border-b border-black/10 text-black' : 'bg-transparent border-b border-white/25 text-white'">
    <div class="w-full px-4 sm:px-6" @mouseenter="cancelClose" @mouseleave="scheduleCloseMenu">

      <!-- ===========================
           MOBILE TOP BAR (ADDED)
           =========================== -->
      <div class="flex lg:hidden items-center justify-between h-16">
        <button class="font-medium" @click="openMobile">Menu</button>

        <!-- Center brand text for now (you'll swap to logo later) -->
        <!-- Mobile logo -->
        <!-- Centered mobile logo that also touches the bottom line -->
        <a href="/" aria-label="Office Solutions" class="h-full pb-px flex items-stretch">
          <img src="/hero/os-logo.png" alt="Office Solutions" class="block h-full w-auto" />
        </a>

        <button aria-label="Search" class="inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 15" width="20" height="20" fill="none">
            <path
              d="M9.40431 9.79815L13.0002 13.7494M11.1891 6.2C11.1891 9.07188 8.86094 11.4 5.98906 11.4C3.11718 11.4 0.789062 9.07188 0.789062 6.2C0.789062 3.32812 3.11718 1 5.98906 1C8.86094 1 11.1891 3.32812 11.1891 6.2Z"
              stroke="currentColor" stroke-width="1.7" />
          </svg>
        </button>
      </div>

      <!-- Desktop bar (unchanged) -->
      <div class="hidden lg:grid grid-cols-3 items-center h-16">
        <nav class="flex items-center gap-8">
          <button type="button" class="nav-link" @click="openProducts">Products</button>
          <button type="button" class="nav-link" @click="openSectors">Sectors</button>
          <button type="button" class="nav-link" @click="openResources">Resources</button>
          <button type="button" class="nav-link" @click="openAbout">About</button>
        </nav>
        <!-- Desktop centered logo -->
        <!-- CENTERED LOGO (constrained) -->
        <div class="flex items-stretch justify-center h-16">
          <a href="/" aria-label="Office Solutions" class="h-full pb-px flex items-stretch">
            <img src="/hero/os-logo.png" alt="Office Solutions" class="block h-full w-auto" />
          </a>
        </div>
        <nav class="flex items-center gap-8 justify-end">
          <button type="button" class="nav-link" @click="goToCaseStudies">Case studies</button>
          <button type="button" class="nav-link" @click="goToContact">Contact</button>
          <!-- Search = text + icon in ONE clickable element, dims together -->
          <a href="#" class="nav-link nav-link--flex" aria-label="Search">
            <span>Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 15" class="nav-link--icon" fill="none">
              <path
                d="M9.40431 9.79815L13.0002 13.7494M11.1891 6.2C11.1891 9.07188 8.86094 11.4 5.98906 11.4C3.11718 11.4 0.789062 9.07188 0.789062 6.2C0.789062 3.32812 3.11718 1 5.98906 1C8.86094 1 11.1891 3.32812 11.1891 6.2Z"
                stroke="currentColor" stroke-width="1.7" />
            </svg>
          </a>
        </nav>
      </div>

      <!-- ===== SECTORS MEGA MENU (Desktop) ===== -->
      <div v-if="sectorsOpen" class="hidden lg:block">
        <div class="fixed left-0 right-0 top-16 bottom-0 text-black border-t border-black/10 shadow-xl"
          @click="closeSectors" :style="{ background: vignetteBg }">
          <div class="max-w-[1440px] grid" @click.stop
            :class="hoveredSector ? 'ml-0 mr-auto grid-cols-[400px_560px] w-max' : 'ml-0 mr-auto grid-cols-[400px] w-max'"
            style="min-height: calc(100vh - 4rem);">
            <!-- Drawer 1: Sectors list -->
            <div class="bg-[#EDE6DB] text-black p-6 h-full border-r border-black/10">
              <div @mouseleave="hoveredSector = null">
                <ul class="space-y-2 md:space-y-3">
                  <li v-for="it in sectors" :key="it.title">
                    <button type="button" @mouseenter="hoveredSector = it" @click="goToSector(it)"
                      :class="['block text-left py-1 type-drawer2 transition-colors', (!hoveredSector || hoveredSector.title === it.title) ? 'text-black' : 'text-black/50']">
                      {{ it.title }}
                    </button>
                  </li>
                </ul>
              </div>
              <hr class="my-5 border-black/10">
              <a href="/sectors" @click.prevent="goPath('/sectors')"
                class="block type-utility text-black/80 hover:text-black">
                <span class="underline-sweep">Explore sectors</span>
              </a>
            </div>
            <!-- Drawer 2: Preview (looks like Products drawer 3) -->
            <div v-if="hoveredSector" class="bg-white text-black p-6 h-full" @mouseenter="cancelClose">
              <div class="flex flex-col items-start gap-3 h-full max-w-[520px]">
                <img :src="hoveredSector.image" alt=""
                  class="w-full aspect-[4/3] object-cover rounded border border-black/10"
                  :style="{ objectPosition: hoveredSector.pos || 'center' }" />
                <p class="type-blurb font-light leading-relaxed tracking-wide text-black/70">{{ hoveredSector.blurb }}
                </p>
                <button type="button" class="mt-1 underline underline-offset-2 inline-flex items-center gap-1"
                  @click="goToSector(hoveredSector)">See all</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== RESOURCES MEGA MENU (Desktop) ===== -->
      <div v-if="resourcesOpen" class="hidden lg:block">
        <div class="fixed left-0 right-0 top-16 bottom-0 text-black border-t border-black/10 shadow-xl"
          @click="closeResources" :style="{ background: vignetteBg }">
          <div class="max-w-[1440px] grid ml-0 mr-auto grid-cols-[400px] w-max" @click.stop
            style="min-height: calc(100vh - 4rem);">
            <!-- Drawer 1: Resources list (single column) -->
            <div class="bg-[#EDE6DB] text-black p-6 h-full border-r border-black/10">
              <ul @mouseleave="hoveredResource = null" class="space-y-2 md:space-y-3">
                <li v-for="it in resources" :key="it.title">
                  <button type="button" @mouseenter="hoveredResource = it" @click="goToResource(it)"
                    :class="['block text-left py-1 type-drawer2 transition-colors', (!hoveredResource || hoveredResource.title === it.title) ? 'text-black' : 'text-black/50']">
                    {{ it.title }}
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== ABOUT MEGA MENU (Desktop) ===== -->
      <div v-if="aboutOpen" class="hidden lg:block">
        <div class="fixed left-0 right-0 top-16 bottom-0 text-black border-t border-black/10 shadow-xl"
          @click="closeAbout" :style="{ background: vignetteBg }">
          <div class="max-w-[1440px] grid ml-0 mr-auto grid-cols-[400px] w-max" @click.stop
            style="min-height: calc(100vh - 4rem);">
            <!-- Drawer 1: About list (single column) -->
            <div class="bg-[#EDE6DB] text-black p-6 h-full border-r border-black/10">
              <ul @mouseleave="hoveredAbout = null" class="space-y-2 md:space-y-3">
                <li v-for="it in aboutItems" :key="it.title">
                  <button type="button" @mouseenter="hoveredAbout = it" @click="goToAbout(it)"
                    :class="['block text-left py-1 type-drawer2 transition-colors', (!hoveredAbout || hoveredAbout.title === it.title) ? 'text-black' : 'text-black/50']">
                    {{ it.title }}
                  </button>
                </li>
              </ul>
              <hr class="my-5 border-black/10">
              <a href="/about/community-support" @click.prevent="goToAboutCTA"
                class="block type-utility text-black/80 hover:text-black">
                <span class="underline-sweep">Community support</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== PRODUCTS MEGA MENU (Desktop) ===== -->
      <div v-if="productsOpen" class="hidden lg:block">
        <div class="fixed left-0 right-0 top-16 bottom-0 text-black border-t border-black/10 shadow-xl"
          @click="closeProducts" :style="{ background: vignetteBg }">
          <div class="max-w-[1440px] grid" @click.stop :class="!hoveredTop
            ? 'ml-0 mr-auto grid-cols-[400px] w-max'
            : (hoveredItem
              ? 'ml-0 mr-auto grid-cols-[400px_420px_560px] w-max'
              : 'ml-0 mr-auto grid-cols-[400px_420px] w-max')" style="min-height: calc(100vh - 4rem);">
            <!-- Drawer 1: Top levels -->
            <div class="bg-[#EDE6DB] text-black p-6 h-full border-r border-black/10" @mouseenter="hoveredItem = null">
              <ul class="space-y-1">
                <li v-for="t in TOPS" :key="t.key">
                  <button type="button" class="w-full flex items-center justify-between py-1.5 text-left"
                    @mouseenter="hoveredTop = t.key">
                    <span :class="[
                      'type-drawer1',
                      (!hoveredTop || hoveredTop === t.key) ? 'text-black' : 'text-black/50'
                    ]">{{ t.label }}</span>
                    <span class="text-black/40">›</span>
                  </button>
                </li>
              </ul>
              <hr class="my-5 border-black/10">
              <nav class="space-y-2 text-sm">
                <a href="/products" class="block type-utility text-black/80 hover:text-black">
                  <span class="underline-sweep">View all products</span>
                </a>
                <a href="/designers-choice" class="block type-utility text-black/80 hover:text-black">
                  <span class="underline-sweep">Designer’s choice</span>
                </a>
                <a href="#" class="block type-utility text-black/80 hover:text-black">
                  <span class="underline-sweep">Ramps and trims</span>
                </a>
                <a href="#" class="block type-utility text-black/80 hover:text-black">
                  <span class="underline-sweep">Materials</span>
                </a>
                <a href="#" class="block type-utility text-black/80 hover:text-black">
                  <span class="underline-sweep">Bespoke</span>
                </a>
              </nav>
            </div>

            <!-- Drawer 2: Items of the selected top level -->
            <div v-if="currentGroup" class="bg-white text-black p-6 h-full border-r border-black/10">
              <ul @mouseleave="hoveredItem = null" class="space-y-2 md:space-y-3">
                <li v-for="it in currentGroup.items" :key="it.title">
                  <button type="button" @mouseenter="hoveredItem = it" @click="goTo(it, currentGroup)" :class="[
                    'block text-left py-1 type-drawer2 transition-colors',
                    (!hoveredItem || hoveredItem?.title === it.title) ? 'text-black' : 'text-black/50'
                  ]">
                    {{ it.title }}
                  </button>
                </li>
              </ul>
              <hr class="my-5 border-black/10">
              <a :href="currentGroupPath" @click.prevent="goPath(currentGroupPath)"
                class="block type-utility text-black/80 hover:text-black">
                <span class="underline-sweep">{{ currentGroup.ctaText }}</span>
              </a>
            </div>

            <!-- Drawer 3: Preview -->
            <div v-if="hoveredItem" class="bg-white text-black p-6 h-full" @mouseenter="cancelClose"
              @mouseleave="scheduleCloseMenu">
              <div class="flex flex-col items-start gap-3 h-full max-w-[520px]">
                <img :src="hoveredItem.image" alt=""
                  class="w-full aspect-[4/3] object-cover rounded border border-black/10" />
                <p class="type-blurb font-light leading-relaxed tracking-wide text-black/70">{{ hoveredItem.blurb }}</p>
                <button type="button" class="mt-1 underline underline-offset-2 inline-flex items-center gap-1"
                  @click="goTo(hoveredItem, currentGroup)">See all</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===========================
         MOBILE DRAWER (ENHANCED)
         =========================== -->
    <div v-if="open" class="lg:hidden">
      <div class="fixed inset-0 bg-black/40" @click="open = false"></div>

      <aside class="fixed inset-0 w-screen bg-[#EDE6DB] text-black shadow-xl flex flex-col">
        <!-- Drawer header -->
        <div class="flex items-center justify-between h-14 px-4 border-b border-black/10">
          <button v-if="mobileStage !== 'root'" class="inline-flex items-center gap-2 type-mobile-utility"
            @click="mobileBack" aria-label="Go back">
            <span aria-hidden="true">←</span><span>Go back</span>
          </button>
          <div v-else class="type-mobile-utility font-medium">Menu</div>
          <button class="type-mobile-utility" aria-label="Close" @click="open = false">✕</button>
        </div>

        <!-- Drawer body -->
        <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <!-- Stage: root -->
          <div v-if="mobileStage === 'root'" class="space-y-4">
            <button type="button" class="w-full flex items-center justify-between type-mobile-item"
              @click="openProductsMobile">
              <span>Products</span><span class="text-black/50">›</span>
            </button>
            <button type="button" class="w-full flex items-center justify-between type-mobile-item"
              @click="openSectorsMobile">
              <span>Sectors</span><span class="text-black/50">›</span>
            </button>
            <button type="button" class="w-full flex items-center justify-between type-mobile-item"
              @click="openResourcesMobile">
              <span>Resources</span><span class="text-black/50">›</span>
            </button>
            <button type="button" class="w-full flex items-center justify-between type-mobile-item"
              @click="openAboutMobile">
              <span>About</span><span class="text-black/50">›</span>
            </button>
            <!-- Direct links (same visual weight, no chevron) -->
            <button type="button" class="w-full text-left type-mobile-item"
              @click="() => { goToCaseStudies(); open = false }">
              Case studies
            </button>
            <button type="button" class="w-full text-left type-mobile-item"
              @click="() => { goToContact(); open = false }">
              Contact
            </button>
          </div>

          <!-- Stage: products (tops) -->
          <div v-else-if="mobileStage === 'products'" class="space-y-6">
            <button v-for="t in TOPS" :key="t.key" type="button"
              class="w-full flex items-center justify-between type-mobile-item" @click="chooseTopMobile(t.key)">
              <span>{{ t.label }}</span><span class="text-black/50">›</span>
            </button>

            <hr class="my-2 border-black/10">

            <button
              type="button"
              class="block text-left type-mobile-link"
              @click="() => { router.push('/products'); open = false }"
            >
              View all products
            </button>
            <button
              type="button"
              class="block text-left type-mobile-link"
              @click="() => { router.push('/designers-choice'); open = false }"
            >
              Designer’s choice
            </button>
            <button type="button" class="block text-left type-mobile-link">Ramps and trims</button>
            <button type="button" class="block text-left type-mobile-link">Materials</button>
            <button type="button" class="block text-left type-mobile-link">Bespoke</button>
          </div>

          <!-- Stage: products-level2 (items under a top) -->
          <div v-else-if="mobileStage === 'products-level2'" class="space-y-4">
            <template v-if="mobileCurrentGroup">
              <button v-for="it in mobileCurrentGroup.items" :key="it.title" type="button"
                class="w-full text-left type-mobile-item" @click="() => { goTo(it, mobileCurrentGroup); open = false }">
                {{ it.title }}
              </button>

              <hr class="my-2 border-black/10">

              <button v-if="mobileCurrentGroup?.ctaText" type="button" class="block text-left type-mobile-link"
                @click="() => { goPath(currentGroupPath); open = false }">
                {{ mobileCurrentGroup.ctaText }}
              </button>
            </template>
          </div>

          <!-- Stage: sectors list -->
          <div v-else-if="mobileStage === 'sectors'" class="space-y-4">
            <button v-for="s in sectors" :key="s.title" type="button" class="w-full text-left type-mobile-item"
              @click="() => { goToSector(s); open = false }">
              {{ s.title }}
            </button>
          </div>

          <!-- Stage: resources list -->
          <div v-else-if="mobileStage === 'resources'" class="space-y-4">
            <button v-for="r in resources" :key="r.title" type="button" class="w-full text-left type-mobile-item"
              @click="() => { goToResource(r); open = false }">
              {{ r.title }}
            </button>
          </div>

          <!-- Stage: about list -->
          <div v-else-if="mobileStage === 'about'" class="space-y-4">
            <button v-for="a in aboutItems" :key="a.title" type="button" class="w-full text-left type-mobile-item"
              @click="() => { goToAbout(a); open = false }">
              {{ a.title }}
            </button>
            <hr class="my-2 border-black/10">
            <button type="button" class="block text-left type-mobile-link"
              @click="() => { goToAboutCTA(); open = false }">Community support</button>
          </div>
        </div>
      </aside>
    </div>
    <!-- =========================== -->
  </header>
</template>

<style scoped>
/* Centralized link behavior — tweak here and it updates everywhere */
.nav-link {
  @apply transition-opacity duration-200;
}

.nav-link:hover {
  opacity: 0.6;
  /* change to .5 or .7 to taste */
}

/* Search (or any link with icon) */
.nav-link--flex {
  @apply inline-flex items-center gap-2;
}

.nav-link--icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  /* Follows text color via stroke="currentColor" in the SVG */
}

/* (Optional) If you later need the mobile button styling again
.search-btn svg { width: 20px; height: 20px; }
.search-btn:hover svg { opacity: 0.6; }
*/
/* Fluid, responsive type scales for drawers */
.type-drawer1 {
  /* Top-level items (By category / application / brand) */
  font-size: clamp(18px, 16px + 0.65vw, 22px);
  line-height: 1.15;
  font-weight: 500;
  /* medium */
}

.type-drawer2 {
  /* Middle-level items (Categories list) */
  font-size: clamp(17px, 15px + 0.55vw, 21px);
  line-height: 1.2;
  /* snug-ish */
  font-weight: 500;
}

.type-utility {
  /* Small utility links under Drawer 1 */
  font-size: clamp(13px, 12px + 0.25vw, 15px);
  line-height: 1.3;
}

.type-blurb {
  /* Drawer 3 description copy */
  font-size: clamp(12px, 11px + 0.25vw, 14px);
}

/* Left→Right underline animation (confined to text width) */
.underline-sweep {
  position: relative;
  display: inline-block;
}

.underline-sweep::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -2px;
  width: 100%;
  height: 1px;
  /* sleek, thin */
  background: currentColor;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 180ms ease;
}

/* Trigger the line when the parent link is hovered/focused */
a:hover .underline-sweep::after,
a:focus-visible .underline-sweep::after {
  transform: scaleX(1);
}

/* Mobile drawer typography */
.type-mobile-item {
  font-size: clamp(20px, 4.8vw, 26px);
  line-height: 1.25;
  font-weight: 600;
}

.type-mobile-link,
.type-mobile-utility {
  font-size: clamp(15px, 3.8vw, 18px);
  line-height: 1.3;
  font-weight: 500;
}
</style>
