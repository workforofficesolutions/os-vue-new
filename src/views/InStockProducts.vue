<template>
    <main class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
        style="padding-top: calc(var(--header-height,72px) + var(--header-gap,32px))">
        <!-- Heading -->
        <header class="mb-4 sm:mb-6">
            <h1 class="text-center text-2xl sm:text-3xl md:text-4xl font-semibold">
                {{ currentBrandName }} In-Stock Products
            </h1>
        </header>

        <!-- Quick filter + sort strip -->
        <section class="border-b border-neutral-200 mb-6 bg-[#f5f0e6]">
            <div
                class="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 py-3">
                <!-- Mobile: Filter & sort trigger -->
                <div class="flex items-center justify-between w-full sm:hidden">
                    <button type="button" class="inline-flex items-center gap-2 text-sm" @click="openMobileFilter">
                        <span class="inline-block w-4 h-4 relative">
                            <span class="block absolute inset-x-0 top-0 h-[2px] bg-neutral-800"></span>
                            <span
                                class="block absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-neutral-800"></span>
                            <span class="block absolute inset-x-0 bottom-0 h-[2px] bg-neutral-800"></span>
                        </span>
                        <span>Filter and sort</span>
                    </button>
                    <span class="text-sm text-neutral-600">
                        {{ variantsCount }} products
                    </span>
                </div>

                <!-- Desktop: Filters on left -->
                <div class="hidden sm:flex flex-wrap items-center gap-4 text-sm">
                    <span class="uppercase tracking-wide text-[11px] text-neutral-600">Filter:</span>

                    <!-- Availability dropdown -->
                    <div class="relative" ref="availabilityRef">
                        <button type="button"
                            class="flex items-center gap-1 px-3 py-1 border border-neutral-300 bg-[#f5f0e6] text-sm"
                            @click="toggleAvailability">
                            <span>Availability</span>
                            <span class="inline-block w-3 h-3">
                                <svg viewBox="0 0 10 6" class="w-full h-full" aria-hidden="true">
                                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </button>
                        <div v-if="isAvailabilityOpen"
                            class="absolute z-20 mt-2 w-56 bg-white border border-neutral-200 shadow-lg p-3">
                            <label class="inline-flex items-center gap-2 text-sm">
                                <input type="checkbox" v-model="showInStock" class="form-checkbox" />
                                <span>In stock only</span>
                            </label>
                        </div>
                    </div>

                    <!-- Price dropdown -->
                    <div class="relative" ref="priceRef">
                        <button type="button"
                            class="flex items-center gap-1 px-3 py-1 border border-neutral-300 bg-[#f5f0e6] text-sm"
                            @click="togglePrice">
                            <span>Price</span>
                            <span class="inline-block w-3 h-3">
                                <svg viewBox="0 0 10 6" class="w-full h-full" aria-hidden="true">
                                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5"
                                        stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                            </span>
                        </button>
                        <div v-if="isPriceOpen"
                            class="absolute z-20 mt-2 w-72 bg-white border border-neutral-200 shadow-lg p-3 space-y-3">
                            <p v-if="maxPrice !== null" class="text-xs text-neutral-500">
                                The highest price is AED {{ maxPrice.toFixed(2) }}
                            </p>
                            <div class="flex items-center gap-2">
                                <input v-model.number="priceMin" type="number" min="0" placeholder="Min"
                                    class="w-24 px-2 py-1 border border-neutral-300 text-xs" />
                                <span class="text-neutral-400 text-xs">–</span>
                                <input v-model.number="priceMax" type="number" min="0" placeholder="Max"
                                    class="w-24 px-2 py-1 border border-neutral-300 text-xs" />
                            </div>
                            <button type="button" class="text-xs underline text-neutral-700" @click="resetPriceFilter">
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Desktop: Sort on right -->
                <div class="hidden sm:flex items-center gap-2 text-sm">
                    <span class="uppercase tracking-wide text-[11px] text-neutral-600">Sort by:</span>
                    <select v-model="sortBy"
                        class="min-w-[150px] px-2 py-1 border border-neutral-300 text-sm bg-[#f5f0e6]">
                        <option value="featured">Featured</option>
                        <option value="bestSelling">Best Selling</option>
                        <option value="a-z">Alphabetically A–Z</option>
                        <option value="z-a">Alphabetically Z–A</option>
                        <option value="priceLowHigh">Price: Low to High</option>
                        <option value="priceHighLow">Price: High to Low</option>
                        <option value="dateOldNew">Date: Old to New</option>
                        <option value="dateNewOld">Date: New to Old</option>
                    </select>
                </div>
            </div>
        </section>

        <!-- Mobile filter & sort drawer -->
        <transition name="fade">
            <div
                v-if="isMobileFilterOpen"
                class="fixed inset-0 z-40 bg-black/30 sm:hidden"
                @click.self="closeMobileFilter"
            >
                <transition name="slide-in">
                    <div
                        v-if="isMobileFilterOpen"
                        class="absolute inset-y-0 right-0 w-full bg-white flex flex-col"
                    >
                        <div class="px-4 pt-4 pb-2 border-b border-neutral-200">
                            <div class="flex items-center justify-between">
                                <h2 class="text-base font-semibold">Filter and sort</h2>
                                <button
                                    type="button"
                                    class="text-xl leading-none px-1"
                                    @click="closeMobileFilter"
                                    aria-label="Close"
                                >
                                    ×
                                </button>
                            </div>
                            <p class="text-xs text-neutral-500 mt-1">
                                {{ variantsCount }} products
                            </p>
                        </div>

                        <div class="flex-1 overflow-y-auto px-4 py-4 space-y-6 bg-[#f5f0e6]">
                            <!-- Availability -->
                            <div>
                                <p class="font-medium mb-2">Availability</p>
                                <label class="inline-flex items-center gap-2 text-sm">
                                    <input type="checkbox" v-model="tempShowInStock" class="form-checkbox" />
                                    <span>In stock only</span>
                                </label>
                            </div>

                            <!-- Price range -->
                            <div>
                                <p class="font-medium mb-2">Price Range (AED)</p>
                                <div class="flex items-center gap-2">
                                    <input
                                        v-model.number="tempPriceMin"
                                        type="number"
                                        min="0"
                                        placeholder="Min"
                                        class="w-24 px-2 py-1 border border-neutral-300 text-xs"
                                    />
                                    <span class="text-neutral-400 text-xs">–</span>
                                    <input
                                        v-model.number="tempPriceMax"
                                        type="number"
                                        min="0"
                                        placeholder="Max"
                                        class="w-24 px-2 py-1 border border-neutral-300 text-xs"
                                    />
                                </div>
                            </div>

                            <!-- Sort by -->
                            <div>
                                <p class="font-medium mb-2">Sort by</p>
                                <select
                                    v-model="tempSortBy"
                                    class="w-full px-2 py-2 border border-neutral-300 text-sm bg-white"
                                >
                                    <option value="featured">Featured</option>
                                    <option value="bestSelling">Best Selling</option>
                                    <option value="a-z">Alphabetically A–Z</option>
                                    <option value="z-a">Alphabetically Z–A</option>
                                    <option value="priceLowHigh">Price: Low to High</option>
                                    <option value="priceHighLow">Price: High to Low</option>
                                    <option value="dateOldNew">Date: Old to New</option>
                                    <option value="dateNewOld">Date: New to Old</option>
                                </select>
                            </div>
                        </div>

                        <div class="px-4 py-3 border-t border-neutral-200 flex gap-3">
                            <button
                                type="button"
                                class="flex-1 border border-neutral-300 px-4 py-2 text-sm"
                                @click="closeMobileFilter"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                class="flex-1 bg-neutral-900 text-white px-4 py-2 text-sm"
                                @click="applyMobileFilters"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </transition>

        <!-- Products grid (colours style) -->
        <section>
            <!-- When there are matching products -->
            <div
                v-if="filteredVariants.length"
                class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:gap-x-10 lg:gap-y-14">
                <div v-for="variant in visibleVariants" :key="variant.title" class="group text-center">
                    <div class="relative w-full pt-[100%] border border-neutral-200 bg-white overflow-hidden">
                        <img :src="variant.image" :alt="variant.title"
                            class="absolute inset-0 w-full h-full object-cover block" loading="lazy" />
                    </div>
                    <p class="mt-2 text-base md:text-lg font-semibold text-neutral-900 text-center">
                        {{ variant.title }}
                    </p>
                    <a :href="variant.image" :download="variant.title"
                        class="text-xs md:text-sm underline text-neutral-800 text-center inline-block">
                        Download image
                    </a>
                    <p class="mt-1 text-sm md:text-base text-neutral-900 text-center">
                        AED {{ variant.price.toFixed(2) }}
                    </p>
                </div>
            </div>

            <!-- Empty state when no variants match filters -->
            <div
                v-else
                class="max-w-7xl mx-auto py-10 text-center text-neutral-700"
            >
                <p class="mb-3">
                    No in-stock products match your current filters.
                </p>
                <button
                    type="button"
                    class="inline-flex items-center justify-center px-4 py-2 border border-neutral-900 bg-neutral-900 text-white text-sm tracking-wide"
                    @click="clearAllFilters"
                >
                    Remove all filters
                </button>
            </div>

            <!-- Load More Button -->
            <div class="mt-8 text-center" v-if="filteredVariants.length">
                <button v-if="canLoadMore" @click="loadMore"
                    class="px-5 py-2 border border-neutral-900 bg-neutral-900 text-white text-sm tracking-wide">
                    Load more results
                </button>
            </div>
        </section>
    </main>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import inStockData from '../data/inStockProducts.js';

// Reactive state for filters, sorting, and pagination
const route = useRoute();
const brandParam = ref(route.params.brand || '');
const showInStock = ref(true);
const priceMin = ref(null);
const priceMax = ref(null);
const sortBy = ref('featured');
const itemsToShow = ref(20);

// UI state for desktop dropdowns and mobile drawer
const isAvailabilityOpen = ref(false);
const isPriceOpen = ref(false);
const isMobileFilterOpen = ref(false);

// Refs for click-outside handling on desktop dropdowns
const availabilityRef = ref(null);
const priceRef = ref(null);

// Temporary state for mobile drawer (so changes apply only on 'Apply')
const tempShowInStock = ref(showInStock.value);
const tempPriceMin = ref(priceMin.value);
const tempPriceMax = ref(priceMax.value);
const tempSortBy = ref(sortBy.value);

// Find the current brand data based on route
const currentBrand = computed(() => {
    const slug = brandParam.value.toString().toLowerCase();
    return inStockData.find(b => b.brand === slug) || { brand: slug, variants: [] };
});
const variants = ref(currentBrand.value.variants);

// Update variants list when the route or data changes
watch(
    () => route.params.brand,
    (newBrand) => {
        brandParam.value = newBrand || '';
        const data = inStockData.find(b => b.brand === brandParam.value.toLowerCase());
        variants.value = data ? data.variants : [];
        itemsToShow.value = 20; // Reset pagination on brand change
    },
    { immediate: true }
);

const variantsCount = computed(() => variants.value.length);

const maxPrice = computed(() => {
    if (!variants.value.length) return null;
    return Math.max(...variants.value.map(v => v.price));
});

watch(isMobileFilterOpen, (open) => {
    if (open) {
        tempShowInStock.value = showInStock.value;
        tempPriceMin.value = priceMin.value;
        tempPriceMax.value = priceMax.value;
        tempSortBy.value = sortBy.value;
    }
});

// Computed brand name for display (capitalize first letter)
const currentBrandName = computed(() => {
    const name = currentBrand.value.brand || '';
    return name.charAt(0).toUpperCase() + name.slice(1);
});

// Desktop dropdown helpers
function toggleAvailability() {
    isAvailabilityOpen.value = !isAvailabilityOpen.value;
    if (isAvailabilityOpen.value) {
        isPriceOpen.value = false;
    }
}

function togglePrice() {
    isPriceOpen.value = !isPriceOpen.value;
    if (isPriceOpen.value) {
        isAvailabilityOpen.value = false;
    }
}

function resetPriceFilter() {
    priceMin.value = null;
    priceMax.value = null;
}

function clearAllFilters() {
    showInStock.value = true;
    priceMin.value = null;
    priceMax.value = null;
    sortBy.value = 'featured';
    itemsToShow.value = 20;
    isAvailabilityOpen.value = false;
    isPriceOpen.value = false;
}

// Close dropdowns when clicking outside their containers (desktop only)
function onDocumentClick(event) {
    const target = event.target;
    if (availabilityRef.value && !availabilityRef.value.contains(target)) {
        isAvailabilityOpen.value = false;
    }
    if (priceRef.value && !priceRef.value.contains(target)) {
        isPriceOpen.value = false;
    }
}

onMounted(() => {
    document.addEventListener('click', onDocumentClick);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', onDocumentClick);
});

// Mobile drawer helpers
function openMobileFilter() {
    isMobileFilterOpen.value = true;
}

function closeMobileFilter() {
    isMobileFilterOpen.value = false;
}

function applyMobileFilters() {
    showInStock.value = tempShowInStock.value;
    priceMin.value = tempPriceMin.value;
    priceMax.value = tempPriceMax.value;
    sortBy.value = tempSortBy.value;
    isMobileFilterOpen.value = false;
}

// Helper to format date (e.g. "Jan 15, 2024")
function formatDate(isoStr) {
    const date = new Date(isoStr);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Computed filtered and sorted variants
const filteredVariants = computed(() => {
    let list = [...variants.value];

    // Availability filter
    if (showInStock.value) {
        list = list.filter(v => v.inStock);
    }

    // Price range filter
    if (priceMin.value != null) {
        list = list.filter(v => v.price >= priceMin.value);
    }
    if (priceMax.value != null) {
        list = list.filter(v => v.price <= priceMax.value);
    }

    // Sorting
    switch (sortBy.value) {
        case 'featured':
            list.sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
            break;
        case 'bestSelling':
            list.sort((a, b) => (a.bestSelling === b.bestSelling ? 0 : a.bestSelling ? -1 : 1));
            break;
        case 'a-z':
            list.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'z-a':
            list.sort((a, b) => b.title.localeCompare(a.title));
            break;
        case 'priceLowHigh':
            list.sort((a, b) => a.price - b.price);
            break;
        case 'priceHighLow':
            list.sort((a, b) => b.price - a.price);
            break;
        case 'dateOldNew':
            list.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        case 'dateNewOld':
            list.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
    }

    return list;
});

// Compute the slice of variants to display based on pagination
const visibleVariants = computed(() => {
    return filteredVariants.value.slice(0, itemsToShow.value);
});

// Determine if "Load More" button should be shown
const canLoadMore = computed(() => {
    return itemsToShow.value < filteredVariants.value.length;
});

// Load more items (increase by 20, up to the list length)
function loadMore() {
    itemsToShow.value = Math.min(filteredVariants.value.length, itemsToShow.value + 20);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-in-enter-active,
.slide-in-leave-active {
    transition: transform 0.25s ease-out;
}

.slide-in-enter-from,
.slide-in-leave-to {
    transform: translateX(100%);
}

/* Example button style - replace with Office Solutions colors if needed */
.bg-primary {
    background-color: #1d4ed8;
}

.bg-primary-dark {
    background-color: #1e40af;
}

.text-white {
    color: #fff;
}

.text-gray-600 {
    color: #4b5563;
}

.text-gray-500 {
    color: #6b7280;
}

.bg-gray-100 {
    background-color: #f3f4f6;
}

.form-checkbox {
    width: 14px;
    height: 14px;
    border-radius: 0;
    border: 1px solid #111827; /* neutral-900 */
    accent-color: #111827;     /* black fill when checked */
}
</style>