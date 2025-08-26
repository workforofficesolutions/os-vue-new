<template>
    <main>
        <HeroSlider />
        <EarthyPanel />
        <ProductsShowcase />
        <SectorsSplit />
        <RecentProjects :projects="caseStudies" basePath="/case-studies" viewAllHref="/case-studies" />
        <OurStory image="/hero/block2.jpg" :minHmd="720" :minHlg="780" :minHxl="860" />
        <CompanyValues />

    </main>
</template>

<script setup>
import HeroSlider from '../components/HeroSlider.vue'
import EarthyPanel from '../components/EarthyPanel.vue'
import ProductsShowcase from '../components/ProductsShowcase.vue'
import SectorsSplit from '../components/SectorsSplit.vue'
import RecentProjects from '../components/RecentProjects.vue'
import { caseStudies } from '../data/caseStudies'
import OurStory from '../components/OurStory.vue'
import CompanyValues from '../components/CompanyValues.vue'
</script>
