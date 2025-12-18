<script setup>
import { onMounted, nextTick } from 'vue'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

/**
 * Split only TEXT NODES into word spans, keep existing elements (e.g. a
 * <span class="earthy-muted">…</span>) intact so we can style parts of the
 * sentence without the splitter mangling them.
 */
function wrapWords(rootEl) {
  if (!rootEl) return
  const pieces = []

  rootEl.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const parts = (node.textContent ?? '').split(/(\s+)/) // keep spaces
      parts.forEach(p => {
        if (!p) return
        pieces.push(p.trim()
          ? `<span class="earthy-word">${p}</span>`
          : p /* original spaces */)
      })
    } else {
      // keep element nodes (like <span class="earthy-muted">...</span>) as-is
      pieces.push(node.outerHTML)
    }
  })

  rootEl.innerHTML = pieces.join('')
}

onMounted(async () => {
  const copy = document.querySelector('.earthy-copy')
  wrapWords(copy)
  await nextTick()

  // Word-by-word reveal with batching (smooth + performant)
  ScrollTrigger.batch('.earthy-word', {
    start: 'top 92%',
    onEnter: batch => {
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        ease: 'power2.out',
        stagger: 0.012,
        overwrite: true
      })
    },
    onLeaveBack: batch => {
      gsap.to(batch, {
        opacity: 0.35,
        y: 6,
        duration: 0.2,
        overwrite: true
      })
    }
  })

  // Subtle entrance for the whole block (image + text)
  gsap.from('.earthy-block', {
    scrollTrigger: { trigger: '.earthy-block', start: 'top 80%' },
    y: 24,
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  })
})
</script>

<template>
  <section class="bg-earthy text-white py-12 md:py-24">
    <!-- 12-col container for precise ratios -->
    <div class="earthy-block mx-auto max-w-[1440px] px-6 grid md:grid-cols-12 gap-8 md:gap-12 items-start">
      <!-- Left (image) — md:5 / 12, taller on big screens -->
      <div class="md:col-span-5">
        <div class="overflow-hidden shadow-lg h-[360px] sm:h-[420px] md:h-[520px] lg:h-[620px]">
          <img src="/hero/block2.jpg" alt="Earthy closeup" class="w-full h-full object-cover" />
        </div>
      </div>

      <!-- Right (copy) — md:7 / 12, aligned to image top -->
      <div class="md:col-span-7 self-start">
        <h2 class="earthy-copy leading-tight text-[clamp(24px,4vw,46px)] font-semibold max-w-[760px]">
          From globally renowned partners to specialised flooring systems, Office Solutions offers a comprehensive range designed to support the needs of residential,
          <span class="earthy-muted"> commercial, and institutional projects.</span>
        </h2>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The spans are injected via innerHTML, so target them globally with :deep */
:deep(.earthy-word) {
  display: inline-block;
  /* keeps tiny translateY crisp without breaking flow */
  opacity: 0.35;
  transform: translateY(6px);
  will-change: transform, opacity;
}

/* Optional: nicer line wrapping where supported */
:deep(.text-balance) {
  text-wrap: balance;
}

/* Optional: tame super-wide screens a touch */
@media (min-width: 1536px) {
  .earthy-block {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>