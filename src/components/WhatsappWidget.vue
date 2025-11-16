<script setup>
import { ref, onMounted } from 'vue'

// ✅ WhatsApp number & default message
const phoneNumber = '+971559270050'
const defaultWhatsAppMessage =
    "Hello Office Solutions 👋,\nI’m interested in learning more about your flooring solutions. Could you please share details on your product ranges, in‑stock options, lead times, and pricing for supply and installation? Thank you! 🧩✨"

const isVisible = ref(true)

// Open WhatsApp chat
const openWhatsApp = () => {
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultWhatsAppMessage)}`
    window.open(whatsappLink, '_blank')
}

// Hide button + remember state
const hideButton = () => {
    isVisible.value = false
    localStorage.setItem('whatsappHidden', 'true')

    // Re-show after 10 seconds
    setTimeout(() => {
        isVisible.value = true
        localStorage.removeItem('whatsappHidden')
    }, 10000)
}

// On page load, check if hidden
onMounted(() => {
    if (localStorage.getItem('whatsappHidden') === 'true') {
        isVisible.value = false
        // Auto re-show after 10 seconds
        setTimeout(() => {
            isVisible.value = true
            localStorage.removeItem('whatsappHidden')
        }, 10000)
    }
})
</script>

<template>
    <div v-if="isVisible" class="whatsapp-container">
        <button class="whatsapp-widget" @click="openWhatsApp" aria-label="Chat with us on WhatsApp">
            <!-- WhatsApp icon -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" class="w-8 h-8 fill-white">
                <path
                    d="M16.001 2.998C8.27 2.998 2 9.27 2 16.999c0 2.493.652 4.912 1.892 7.049L2 30l6.179-1.865a13.93 13.93 0 007.822 2.3c7.732 0 14.001-6.271 14.001-14.001S23.733 2.998 16.001 2.998zm0 25.738c-2.391 0-4.726-.656-6.748-1.898l-.485-.289-3.662 1.105 1.13-3.567-.316-.508a11.99 11.99 0 01-1.835-6.58c0-6.627 5.373-12.002 12.002-12.002 6.628 0 12.003 5.375 12.003 12.002s-5.375 12.002-12.003 12.002zm6.555-8.63c-.356-.178-2.104-1.038-2.429-1.154-.325-.119-.562-.178-.8.178-.239.355-.917 1.154-1.125 1.392-.207.237-.414.267-.77.089-.356-.178-1.504-.555-2.865-1.77-1.059-.943-1.77-2.104-1.977-2.46-.207-.355-.022-.546.156-.724.16-.16.356-.415.534-.622.178-.207.237-.355.356-.592.119-.237.06-.445-.03-.623-.089-.178-.8-1.925-1.095-2.635-.287-.689-.578-.595-.8-.606l-.684-.012c-.237 0-.623.089-.95.444-.325.355-1.243 1.215-1.243 2.964s1.273 3.445 1.451 3.683c.178.237 2.503 3.823 6.064 5.361.848.367 1.508.586 2.022.75.849.27 1.622.232 2.233.141.681-.102 2.104-.861 2.402-1.693.297-.831.297-1.544.208-1.693-.089-.149-.326-.237-.682-.415z" />
            </svg>

            <!-- Cancel icon -->
            <span class="close-btn" @click.stop="hideButton" aria-label="Hide WhatsApp Button">
                ✕
            </span>
        </button>
    </div>
</template>

<style scoped>
.whatsapp-container {
    position: fixed;
    bottom: 40px;
    right: 16px;
    z-index: 1000;
}

.whatsapp-widget {
    background-color: #25d366;
    border-radius: 50%;
    padding: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    position: relative;
}

.whatsapp-widget:hover {
    background-color: #20b857;
}

/* Small cancel button */
.close-btn {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #ff4d4f;
    color: white;
    font-size: 10px;
    font-weight: bold;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.close-btn:hover {
    background: #d9363e;
}
</style>
