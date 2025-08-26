// src/main.js
import { createApp, nextTick } from 'vue'
import App from './App.vue'
import router from './router'
import './index.css'

import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// avoid browser restoring scroll on SPA routes (Lenis handles it)
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

// Lenis init
const lenis = new Lenis({ smoothWheel: true })

// keep ScrollTrigger in sync with Lenis
lenis.on('scroll', () => ScrollTrigger.update())

// you can keep your rAF loop, but Syncing via GSAP ticker is more stable:
gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// After every route navigation: go to top & refresh measurements
router.afterEach(async () => {
    await nextTick()
    lenis.scrollTo(0, { immediate: true })
    // wait 1 frame, then refresh to ensure sizes are final
    requestAnimationFrame(() => ScrollTrigger.refresh())
})

createApp(App).use(router).mount('#app')
