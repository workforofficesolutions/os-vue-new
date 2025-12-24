import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const CaseStudiesList = () => import('../views/CaseStudiesList.vue')
const CaseStudy = () => import('../views/CaseStudy.vue')
const ContactUs = () => import('../views/ContactUs.vue')
const AllProducts = () => import('../views/AllProducts.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const InStockProducts = () => import('../views/InStockProducts.vue')
const DesignerChoice = () => import('../views/DesignerChoice.vue')
const SectorDetail = () => import('../views/SectorDetail.vue')
const OurTeam = () => import('../views/OurTeam.vue')
const OurStoryPage = () => import('../views/OurStoryPage.vue')
const NotFound = () => import('../views/NotFound.vue')

export default createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/case-studies', name: 'case-studies', component: CaseStudiesList },
        { path: '/case-studies/:slug', name: 'case-study', component: CaseStudy, props: true },
        { path: '/contact', name: 'contact', component: ContactUs },
        { path: '/products', name: 'AllProducts', component: AllProducts },
        {
            path: '/designers-choice',
            name: 'DesignerChoice',
            component: DesignerChoice,
        },
        {
            path: '/products/:slug',
            name: 'product-detail',
            component: ProductDetail,
            props: true,
        },
        {
            path: '/products/instock/:brand',
            name: 'InStockProducts',
            component: InStockProducts,
            props: true
        },
        {
            path: '/sectors/:slug',
            name: 'sector-detail',
            component: SectorDetail,
            props: true,
        },
        {
            path: '/about/our-team',
            name: 'our-team',
            component: OurTeam,
            meta: { transparentHeader: true },
        },
        {
            path: '/about/our-story',
            name: 'our-story',
            component: OurStoryPage,
            meta: { transparentHeader: true },
        },
        { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
    ],
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) return savedPosition
        if (to.hash) return { el: to.hash, behavior: 'smooth' }
        return { top: 0 }
    },
})
