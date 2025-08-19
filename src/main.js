
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

import Lenis from 'lenis'
const lenis = new Lenis({ smoothWheel: true })
function raf(t){ lenis.raf(t); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

createApp(App).mount('#app')
