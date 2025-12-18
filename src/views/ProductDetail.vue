<template>
  <main
    v-if="product"
    class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
    style="padding-top: calc(var(--header-height,72px) + var(--header-gap,32px))"
  >
    <!-- Breadcrumbs (simple, static-style) -->
    <nav class="text-xs sm:text-sm text-neutral-500 flex gap-2 items-center mb-4 sm:mb-5">
      <RouterLink to="/products">All products</RouterLink>
      <span aria-hidden="true">›</span>
      <span>{{ product.title }}</span>
    </nav>

    <!-- HERO -->
    <section class="grid grid-cols-1 lg:grid-cols-[1.05fr_.95fr] gap-6 md:gap-8 items-start mb-10 md:mb-12">
      <!-- Meta: Title + Brand (always first) -->
      <div class="order-1 lg:order-first">
        <h1
          class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-1"
          style="scroll-margin-top: calc(var(--header-height,72px) + 24px)"
        >
          {{ product.title }}
        </h1>
        <p class="text-neutral-600 text-sm sm:text-base">
          Part of <span class="underline font-semibold lowercase">{{ product.brand }}</span>
        </p>
      </div>

      <!-- Image: second on mobile, right column on desktop -->
      <div class="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <img :src="product.image" :alt="`${product.title} hero image`" class="w-full h-auto block" />
      </div>

      <!-- Details: Description, actions, and swatches. Third on mobile; left column on desktop. -->
      <div class="order-3 lg:order-none space-y-4">
        <div class="text-neutral-900 leading-relaxed text-[0.95rem] sm:text-base md:text-lg">
          <template v-for="(block, i) in descriptionBlocks" :key="i">
            <p v-if="block.type === 'p'" class="mt-4 first:mt-0">
              <template v-for="(seg, j) in parseInlineBold(block.text)" :key="j">
                <span :class="seg.bold ? 'font-semibold' : ''">{{ seg.text }}</span>
              </template>
            </p>

            <ul v-else class="mt-4 first:mt-0 list-disc pl-5 space-y-1">
              <li v-for="(line, j) in block.items" :key="j">
                <template v-for="(seg, k) in parseInlineBold(line)" :key="k">
                  <span :class="seg.bold ? 'font-semibold' : ''">{{ seg.text }}</span>
                </template>
              </li>
            </ul>
          </template>
        </div>

        <div class="flex gap-3 mt-5 mb-3 sm:mb-4">
          <button
            @click="scrollToColours"
            class="inline-flex items-center border border-neutral-900 bg-neutral-900 text-white px-4 py-2 cursor-pointer text-sm sm:text-base"
          >
            Order sample
          </button>
          <button
            class="inline-flex items-center border border-neutral-900 bg-transparent text-neutral-900 px-4 py-2 cursor-pointer text-sm sm:text-base"
          >
            Info & downloads
          </button>
        </div>

        <div class="mt-3 sm:mt-4" v-if="product.variants && product.variants.length">
          <p class="font-semibold text-base md:text-lg mb-2">Available colours</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="v in product.variants"
              :key="v.name"
              class="w-4 h-4 sm:w-5 sm:h-5 border border-black/15"
              :style="{ backgroundColor: v.swatch || '#ddd' }"
              :title="v.name"
              aria-label="Colour swatch"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ROOMSHOTS -->
    <section class="mt-8 md:mt-10" v-if="product.roomshots && product.roomshots.length">
      <h2
        class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
        style="scroll-margin-top: calc(var(--header-height,72px) + 24px)"
      >
        Roomshots
      </h2>
      <div class="relative">
        <!-- Left arrow -->
        <button
          @click="prevShot"
          aria-label="Previous image"
          class="flex absolute left-2 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center
                 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20
                 bg-transparent text-white"
        >
          <span class="inline-block select-none leading-none text-2xl md:text-4xl lg:text-6xl xl:text-7xl">&lt;</span>
        </button>
        <!-- Right arrow -->
        <button
          @click="nextShot"
          aria-label="Next image"
          class="flex absolute right-2 sm:right-3 md:right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center
                 w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20
                 bg-transparent text-white"
        >
          <span class="inline-block select-none leading-none text-2xl md:text-4xl lg:text-6xl xl:text-7xl">&gt;</span>
        </button>

        <div ref="roomshotsTrack" class="flex overflow-x-auto gap-6 md:gap-8 lg:gap-10 snap-x snap-mandatory pb-2">
          <div
            v-for="(src, i) in product.roomshots"
            :key="i"
            class="shrink-0 w-[320px] sm:w-[420px] md:w-[560px] lg:w-[680px] xl:w-[760px] snap-start"
          >
            <div class="relative w-full pt-[66.6667%] border border-neutral-200 bg-white">
              <img :src="src" :alt="`${product.title} room ${i + 1}`" class="absolute inset-0 w-full h-full object-cover block" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
      <div class="mt-2 sm:mt-3">
        <a :href="product.roomshots[currentShot]" download class="text-xs sm:text-sm underline">Download this image</a>
      </div>
    </section>

    <!-- COLOURS (compact square swatch grid) -->
    <section
      ref="coloursRef"
      id="colours"
      class="mt-8 md:mt-10"
      v-if="product.variants && product.variants.length"
      style="scroll-margin-top: calc(var(--header-height,72px) + 24px)"
    >
      <h2
        class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
        style="scroll-margin-top: calc(var(--header-height,72px) + 24px)"
      >
        Colours
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:gap-x-10 lg:gap-y-14">
        <div v-for="v in product.variants" :key="v.name" class="group">
          <div
            class="relative w-full pt-[100%] border border-neutral-200 bg-white overflow-hidden"
            @mouseenter="ensureHoverLoaded(v)"
            @focusin="ensureHoverLoaded(v)"
            @touchstart.passive="ensureHoverLoaded(v)"
          >
            <!-- Primary (default) image -->
            <img
              :src="v.image"
              :alt="v.name"
              class="absolute inset-0 w-full h-full object-cover block transition-opacity duration-200 group-hover:opacity-0"
              loading="lazy"
              decoding="async"
            />

            <!-- Hover image (lazy preloaded on first interaction) -->
            <img
              v-if="hoverReady[v.image]"
              :src="hoverSrc[v.image] || hoverImage(v.image)"
              :alt="v.name"
              class="absolute inset-0 w-full h-full object-cover block opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              loading="lazy"
              decoding="async"
            />
          </div>
          <p class="mt-2 text-base md:text-lg font-semibold text-neutral-900">{{ v.name }}</p>
          <a :href="v.image" :download="v.name" class="text-xs md:text-sm underline text-neutral-800">Download image</a>
        </div>
      </div>
    </section>
  </main>

  <!-- Fallback if product not found -->
  <section v-else class="p-12 text-center">
    <p>Product not found.</p>
    <RouterLink class="link" to="/products">Back to all products</RouterLink>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import CATALOG, { findProductBySlug, slugify as slugifyCatalog } from '../data/catalog.js'

const route = useRoute()

// Use the catalog's slugify so URLs match explicit slugs (e.g., "cambridge-and").
const slugify = (s) => slugifyCatalog(s)

// Slug from route (normalized) and product lookup via catalog helper
const wantedSlug = computed(() => slugify(route.params.slug || ''))
const product = computed(() => findProductBySlug(wantedSlug.value))

// Parse inline bold markers: **bold** (no v-html needed)
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

const descriptionBlocks = computed(() => {
  const raw = product.value?.productDescription || ''

  // Blocks are separated by a blank line (paragraph break)
  const blocks = raw
    .split(/\n\s*\n/g)
    .map((b) => b.trim())
    .filter(Boolean)

  return blocks.map((b) => {
    const lines = b
      .split(/\n+/g)
      .map((s) => s.trim())
      .filter(Boolean)

    // If a block contains multiple lines, treat it as a bullet list.
    // Supports optional '-' or '•' prefixes.
    if (lines.length > 1) {
      return {
        type: 'ul',
        items: lines.map((l) => l.replace(/^[-•]\s+/, '').trim()),
      }
    }

    return {
      type: 'p',
      text: lines[0] || '',
    }
  })
})

const roomshotsTrack = ref(null)
const currentShot = ref(0)
const coloursRef = ref(null)

// Hover image support (Amtico convention: hover image has `h-` prefix)
const hoverReady = ref({})
const hoverSrc = ref({})

const hoverImage = (img) => {
  if (!img) return img
  const parts = String(img).split('/')
  const file = parts.pop()
  return [...parts, `h-${file}`].join('/')
}

const ensureHoverLoaded = (v) => {
  const key = v?.image
  if (!key) return
  if (hoverReady.value[key]) return

  const hover = hoverImage(key)
  if (!hover) return

  // Preload once; if the hover image (h-*) doesn't exist, fall back to the primary image.
  const pre = new Image()
  pre.onload = () => {
    hoverSrc.value = { ...hoverSrc.value, [key]: hover }
    hoverReady.value = { ...hoverReady.value, [key]: true }
  }
  pre.onerror = () => {
    // Fallback: treat primary as hover so UI still works for brands without hover assets
    hoverSrc.value = { ...hoverSrc.value, [key]: key }
    hoverReady.value = { ...hoverReady.value, [key]: true }
  }
  pre.src = hover
}

const scrollToShot = (i) => {
  const container = roomshotsTrack.value
  if (!container) return
  const child = container.children?.[i]
  if (!child) return
  container.scrollTo({ left: child.offsetLeft, behavior: 'smooth' })
}

const nextShot = () => {
  const total = product.value?.roomshots?.length || 0
  if (!total) return
  currentShot.value = (currentShot.value + 1) % total
  scrollToShot(currentShot.value)
}

const prevShot = () => {
  const total = product.value?.roomshots?.length || 0
  if (!total) return
  currentShot.value = (currentShot.value - 1 + total) % total
  scrollToShot(currentShot.value)
}

const scrollToColours = () => {
  const el = coloursRef.value
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  // Update the URL hash without reloading (optional but nice)
  try {
    const url = new URL(window.location.href)
    url.hash = 'colours'
    history.replaceState(null, '', url)
  } catch (_) { /* no-op */ }
}

onMounted(() => {
  if (product.value?.title) {
    document.title = `${product.value.title} – Products`
  }
})
</script>