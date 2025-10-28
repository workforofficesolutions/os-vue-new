import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../views/Home.vue')
const CaseStudiesList = () => import('../views/CaseStudiesList.vue')
const CaseStudy = () => import('../views/CaseStudy.vue')
const ContactUs = () => import('../views/ContactUs.vue')
const AllProducts = () => import('../views/AllProducts.vue')
const ProductDetail = () => import('../views/ProductDetail.vue')
const NotFound = () => import('../views/NotFound.vue')

export default createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: Home },
        { path: '/case-studies', name: 'case-studies', component: CaseStudiesList },
        { path: '/case-studies/:slug', name: 'case-study', component: CaseStudy, props: true },
        { path: '/contact', name: 'contact', component: ContactUs },
        { path: '/products', name: 'AllProducts', component: AllProducts },
        { path: '/:pathMatch(.*)*', name: '404', component: NotFound },
        {
            path: '/products/:slug',
            name: 'product-detail',
            component: ProductDetail,
            props: true,
        }
    ],
    scrollBehavior: () => ({ top: 0 }),
})
