<template>
    <main>
        <PageLoader />
        <HeroSlider />
        <EarthyPanel />
        <ProductsShowcase />
        <SectorsSplit />
        <RecentProjects :projects="caseStudies" basePath="/case-studies" viewAllHref="/case-studies" />
        <OurStory image="/hero/block2.jpg" :minHmd="720" :minHlg="780" :minHxl="860" />
        <CompanyValues />
        <Sustainability
            bg="https://cdn.sanity.io/images/0q894uzm/production/ffac81dea1d30f83e2046df800b5d5b4bafe4b0c-2000x1333.jpg?&q=90&fit=max&auto=format&w=3840"
            card-image="/cases/sustainability-heli.avif" card-alt="Westpac rescue helicopter over forest" />
        <Articles />

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
import Sustainability from '../components/Sustainability.vue'
import Articles from '../components/Articles.vue'
import PageLoader from '../components/PageLoader.vue'
</script>
