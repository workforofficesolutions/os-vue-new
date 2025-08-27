<!-- components/PageLoader.vue -->
<template>
    <Transition name="fade">
        <div v-if="isVisible" class="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
            aria-label="Loading" role="status">
            <img :src="logoSrc" alt="Logo" class="w-40 h-auto object-contain heartbeat" />
        </div>
    </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
    /** Milliseconds to show the loader (default 3000 = 3s) */
    duration: { type: Number, default: 3000 },
    /** Path to your logo */
    logoSrc: { type: String, default: '/hero/os-logo.png' },
    /**
     * Optional control (v-model). If provided, you control visibility.
     * If omitted, the component auto-hides after `duration`.
     */
    modelValue: { type: Boolean, default: undefined },
})

const emit = defineEmits(['update:modelValue', 'done'])

const internal = ref(true) // internal visibility when uncontrolled

const controlled = computed(() => props.modelValue !== undefined)
const isVisible = computed({
    get: () => (controlled.value ? props.modelValue : internal.value),
    set: v => {
        if (controlled.value) emit('update:modelValue', v)
        else internal.value = v
    },
})

onMounted(() => {
    // Auto-hide after `duration` only in uncontrolled mode
    if (!controlled.value) {
        setTimeout(() => {
            isVisible.value = false
            emit('done')
        }, props.duration)
    }
})
</script>

<style scoped>
/* quick fade */
.fade-enter-active,
.fade-leave-active {
    transition: opacity .2s ease
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0
}

/* heartbeat */
@keyframes heartbeat {

    0%,
    100% {
        transform: scale(1)
    }

    25%,
    75% {
        transform: scale(1.15)
    }

    50% {
        transform: scale(1)
    }
}

.heartbeat {
    animation: heartbeat 1.8s ease-in-out infinite
}
</style>
