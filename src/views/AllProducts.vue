<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/**
 * AllProducts.vue (refactor)
 * ------------------------------------------------------------
 * Goals
 *  - Single source of truth for facets (defs + options + predicates)
 *  - Generic filtering, counting, and query prefilters driven by facet keys
 *  - Clear sections: Data ▸ Facets ▸ State ▸ Derived ▸ Methods ▸ UI
 *  - Keeps features: quick menu, 3 views (grid/list/compare),
 *    show/hide filters, search, compare, infinite scroll
 */

/* =========================
   Router
   ========================= */
const route = useRoute()
const router = useRouter()

/* =========================
   Product model & sample data
   ========================= */

type Brand = 'Modulyss' | 'Amtico' | 'Unitile' | 'Armstrong'
type Material = 'Vinyl' | 'Aluminium' | 'Rubber' | 'Carpet' | 'Kinetex'
type Application = 'Entrance' | 'Common & high traffic areas' | 'Healthcare areas' | 'Sports' | 'Kitchens & bathrooms' | 'Service areas' | 'Stairways'
type Pattern = 'Organic' | 'Solid' | 'Textured' | 'Linear' | 'Geometric' | 'Timber effect'
type Shade = 'Dark' | 'Neutral' | 'Light' | 'Bright'
type Feature = 'PVC free' | 'Recycled Content' | 'Quick Ship' | 'Lifetime Warranty' | 'Durable' | 'Green Certificate' | 'NZ stock' | 'Modular' | 'Compliant' | 'Recyclable'
type Price = '$' | '$$' | '$$$' | '$$$+'
type Env = 'Declare' | 'GreenTag'
type Shape = 'Squares' | 'Rolls' | 'Planks' | 'Hexagons' | 'Trapezes' | 'Seamless' | 'Custom rugs' | 'XL Planks'
type StockFacetOption = 'Modulyss stock' | 'Amtico stock' | 'Unitile stock'

type Variant = { name: string; image: string; color: string }

type Product = {
    id: number
    title: string
    brand: Brand
    productDescription: string
    applications: Application[]
    materials: Material[]
    patterns: Pattern[]
    shades: Shade[]
    features: Feature[]
    price: Price
    env: Env[]
    shapes: Shape[]
    image: string
    variants?: Variant[]
    inStockTotal?: number
}

const BRANDS = ['Modulyss', 'Amtico', 'Unitile', 'Armstrong'] as const
const MATERIALS = ['Vinyl', 'Aluminium', 'Rubber', 'Carpet', 'Kinetex'] as const
const APPS = [
    'Entrance',
    'Common & high traffic areas',
    'Healthcare areas',
    'Sports',
    'Kitchens & bathrooms',
    'Service areas',
    'Stairways'
] as const
const PATTERNS = ['Organic', 'Solid', 'Textured', 'Linear', 'Geometric', 'Timber effect'] as const
const SHADES = ['Dark', 'Neutral', 'Light', 'Bright'] as const
const FEATURES = ['PVC free', 'Recycled Content', 'Quick Ship', 'Lifetime Warranty', 'Durable', 'Green Certificate', 'NZ stock', 'Modular', 'Compliant', 'Recyclable'] as const
const PRICES = ['$', '$$', '$$$', '$$$+'] as const
const ENVS = ['Declare', 'GreenTag'] as const
const SHAPES = ['Squares', 'Rolls', 'Planks', 'Hexagons', 'Trapezes', 'Seamless', 'Custom rugs', 'XL Planks'] as const
const STOCKS = ['Modulyss stock', 'Amtico stock', 'Unitile stock'] as const

// === Static catalogue (65 products) ===
const STATIC_PRODUCTS: Product[] = [
    { id: 1, brand: 'Modulyss', title: 'Artus', productDescription: 'Artus is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/artus.webp' },
    { id: 2, brand: 'Modulyss', title: 'Cambridge&', productDescription: 'Cambridge& is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Light'], features: ['Quick Ship', 'Modular'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/cambridge.webp' },
    { id: 3, brand: 'Modulyss', title: 'Cobbles', productDescription: 'Cobbles is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Dark'], features: ['Durable', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/cobbles.webp' },
    { id: 4, brand: 'Modulyss', title: 'Core', productDescription: 'Core is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Neutral'], features: ['Recycled Content', 'Green Certificate'], price: '$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/core.webp' },
    { id: 5, brand: 'Modulyss', title: 'DSGN Absolute', productDescription: 'DSGN Absolute is a very nice product.', applications: ['Entrance', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Durable', 'Lifetime Warranty'], price: '$$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/dsgnabsolute.webp' },
    { id: 6, brand: 'Modulyss', title: 'DSGN Cloud', productDescription: 'DSGN Cloud is a very nice product.', applications: ['Common & high traffic areas', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Light'], features: ['PVC free', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/dsgncloud.webp' },
    { id: 7, brand: 'Modulyss', title: 'DSGN Force', productDescription: 'DSGN Force is a very nice product.', applications: ['Service areas', 'Stairways'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Dark'], features: ['Durable', 'NZ stock'], price: '$$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/dsgnforce.webp' },
    { id: 8, brand: 'Modulyss', title: 'DSGN Tweed', productDescription: 'DSGN Tweed is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Recycled Content', 'Modular'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/dsgntweed.webp' },
    { id: 9, brand: 'Modulyss', title: 'Dune', productDescription: 'Dune is a very nice product.', applications: ['Common & high traffic areas', 'Sports'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Bright'], features: ['Durable', 'Green Certificate'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/dune.webp' },
    { id: 10, brand: 'Modulyss', title: 'Etch', productDescription: 'Etch is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Neutral'], features: ['Quick Ship', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/etch.webp' },
    { id: 11, brand: 'Modulyss', title: 'Fade', productDescription: 'Fade is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Light'], features: ['Durable', 'Compliant'], price: '$$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/fade.webp' },
    { id: 12, brand: 'Modulyss', title: 'Fashion&', productDescription: 'Fashion& is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Dark'], features: ['PVC free', 'Modular'], price: '$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/fashion.webp' },
    { id: 13, brand: 'Modulyss', title: 'First Decode', productDescription: 'First Decode is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Neutral'], features: ['Recycled Content', 'Green Certificate'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/firstdecode.webp' },
    { id: 14, brand: 'Modulyss', title: 'First Define', productDescription: 'First Define is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Light'], features: ['NZ stock', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/firstdefine.webp' },
    { id: 15, brand: 'Modulyss', title: 'First Forward', productDescription: 'First Forward is a very nice product.', applications: ['Common & high traffic areas', 'Sports'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Bright'], features: ['Durable', 'Lifetime Warranty'], price: '$$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/firstforward.webp' },
    { id: 16, brand: 'Modulyss', title: 'First Straightline', productDescription: 'First Straightline is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Neutral'], features: ['Quick Ship', 'Modular'], price: '$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/firststraighline.webp' },
    { id: 17, brand: 'Modulyss', title: 'First Streamline', productDescription: 'First Streamline is a very nice product.', applications: ['Healthcare areas', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Light'], features: ['Recycled Content', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/firststreamline.webp' },
    { id: 18, brand: 'Modulyss', title: 'First Sway', productDescription: 'First Sway is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Neutral'], features: ['Durable', 'Green Certificate'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/firstsway.webp' },
    { id: 19, brand: 'Modulyss', title: 'Fluid&', productDescription: 'Fluid& is a very nice product.', applications: ['Entrance', 'Sports'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Dark'], features: ['PVC free', 'Recyclable'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/fluid.webp' },
    { id: 20, brand: 'Modulyss', title: 'Forma', productDescription: 'Forma is a very nice product.', applications: ['Common & high traffic areas', 'Stairways'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Neutral'], features: ['Durable', 'NZ stock'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/forma.webp' },
    { id: 21, brand: 'Modulyss', title: 'Gleam', productDescription: 'Gleam is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Light'], features: ['Quick Ship', 'Green Certificate'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/gleam.webp' },
    { id: 22, brand: 'Modulyss', title: 'Grind', productDescription: 'Grind is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Durable', 'Compliant'], price: '$$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/grind.webp' },
    { id: 23, brand: 'Modulyss', title: 'Haze', productDescription: 'Haze is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Dark'], features: ['Recycled Content', 'Recyclable'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/haze.webp' },
    { id: 24, brand: 'Modulyss', title: 'In-groove', productDescription: 'In-groove is a very nice product.', applications: ['Service areas', 'Stairways'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Neutral'], features: ['Durable', 'Modular'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/ingroove.webp' },
    { id: 25, brand: 'Modulyss', title: 'Ivy', productDescription: 'Ivy is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Light'], features: ['Quick Ship', 'Green Certificate'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/ivy.webp' },
    { id: 26, brand: 'Modulyss', title: 'Leaf', productDescription: 'Leaf is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/leaf.webp' },
    { id: 27, brand: 'Modulyss', title: 'Litho', productDescription: 'Litho is a very nice product.', applications: ['Entrance', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Light'], features: ['Recycled Content', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/litho.webp' },
    { id: 28, brand: 'Modulyss', title: 'Lume', productDescription: 'Lume is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Light'], features: ['Quick Ship', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/lume.webp' },
    { id: 29, brand: 'Modulyss', title: 'Meadow', productDescription: 'Meadow is a very nice product.', applications: ['Common & high traffic areas', 'Sports'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Bright'], features: ['Durable', 'NZ stock'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/meadow.webp' },
    { id: 30, brand: 'Modulyss', title: 'Mezzo', productDescription: 'Mezzo is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Quick Ship', 'Green Certificate'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/mezzo.webp' },
    { id: 31, brand: 'Modulyss', title: 'Millennium Nxtgen', productDescription: 'Millennium Nxtgen is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Dark'], features: ['Durable', 'Lifetime Warranty'], price: '$$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/millenium.webp' },
    { id: 32, brand: 'Modulyss', title: 'Monos', productDescription: 'Monos is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Neutral'], features: ['Recycled Content', 'Recyclable'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/monos.webp' },
    { id: 33, brand: 'Modulyss', title: 'Moss', productDescription: 'Moss is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Light'], features: ['Durable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/moss.webp' },
    { id: 34, brand: 'Modulyss', title: 'Motion', productDescription: 'Motion is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Neutral'], features: ['Quick Ship', 'NZ stock'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/motion.webp' },
    { id: 35, brand: 'Modulyss', title: 'Patchwork', productDescription: 'Patchwork is a very nice product.', applications: ['Common & high traffic areas', 'Sports'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Bright'], features: ['Durable', 'Green Certificate'], price: '$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/patchwork.webp' },
    { id: 36, brand: 'Modulyss', title: 'Pattern', productDescription: 'Pattern is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Neutral'], features: ['Recycled Content', 'Recyclable'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/pattern.webp' },
    { id: 37, brand: 'Modulyss', title: 'Pixel', productDescription: 'Pixel is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Light'], features: ['Durable', 'Compliant'], price: '$$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/pixel.webp' },
    { id: 38, brand: 'Modulyss', title: 'Polder', productDescription: 'Polder is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Dark'], features: ['Quick Ship', 'Green Certificate'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/polder.webp' },
    { id: 39, brand: 'Modulyss', title: 'Ray', productDescription: 'Ray is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/ray.webp' },
    { id: 40, brand: 'Modulyss', title: 'Rocket', productDescription: 'Rocket is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/rocket.webp' },
    { id: 41, brand: 'Modulyss', title: 'Rust', productDescription: 'Rust is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Dark'], features: ['Recycled Content', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/rust.webp' },
    { id: 42, brand: 'Modulyss', title: 'Spark', productDescription: 'Spark is a very nice product.', applications: ['Common & high traffic areas', 'Sports'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Bright'], features: ['Durable', 'NZ stock'], price: '$$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/spark.webp' },
    { id: 43, brand: 'Modulyss', title: 'Textura', productDescription: 'Textura is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Quick Ship', 'Green Certificate'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/textura.webp' },
    { id: 44, brand: 'Modulyss', title: 'Trace', productDescription: 'Trace is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Carpet'], patterns: ['Linear'], shades: ['Light'], features: ['Durable', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/trace.webp' },
    { id: 45, brand: 'Modulyss', title: 'Velvet&', productDescription: 'Velvet& is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Carpet'], patterns: ['Solid'], shades: ['Neutral'], features: ['Recycled Content', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/velvet.webp' },
    { id: 46, brand: 'Modulyss', title: 'Vision', productDescription: 'Vision is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Carpet'], patterns: ['Geometric'], shades: ['Light'], features: ['Durable', 'Green Certificate'], price: '$$$', env: ['Declare'], shapes: ['Squares'], image: '/brand/modulyss/products/vision.webp' },
    { id: 47, brand: 'Modulyss', title: 'Willow', productDescription: 'Willow is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Carpet'], patterns: ['Organic'], shades: ['Dark'], features: ['Quick Ship', 'Recyclable'], price: '$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/willow.webp' },

    { id: 48, brand: 'Amtico', title: 'Spacia', productDescription: 'Spacia is a very nice product.', applications: ['Common & high traffic areas', 'Kitchens & bathrooms'], materials: ['Vinyl'], patterns: ['Timber effect'], shades: ['Neutral'], features: ['Durable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 49, brand: 'Amtico', title: 'Signature', productDescription: 'Signature is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Vinyl'], patterns: ['Geometric'], shades: ['Light'], features: ['Recycled Content', 'Green Certificate'], price: '$$$', env: ['GreenTag'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 50, brand: 'Amtico', title: 'Form', productDescription: 'Form is a very nice product.', applications: ['Common & high traffic areas', 'Healthcare areas'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Neutral'], features: ['Durable', 'Lifetime Warranty'], price: '$$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 51, brand: 'Amtico', title: 'Decor', productDescription: 'Decor is a very nice product.', applications: ['Entrance', 'Stairways'], materials: ['Vinyl'], patterns: ['Geometric'], shades: ['Bright'], features: ['Quick Ship', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Hexagons'], image: '/brand/modulyss/products/artus.webp' },
    { id: 52, brand: 'Amtico', title: 'Access', productDescription: 'Access is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Vinyl'], patterns: ['Linear'], shades: ['Dark'], features: ['Durable', 'Recyclable'], price: '$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 53, brand: 'Amtico', title: 'Click Smart', productDescription: 'Click Smart is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Vinyl'], patterns: ['Timber effect'], shades: ['Neutral'], features: ['Recycled Content', 'Green Certificate'], price: '$$', env: ['GreenTag'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 54, brand: 'Amtico', title: 'Marine', productDescription: 'Marine is a very nice product.', applications: ['Service areas', 'Stairways'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Light'], features: ['Durable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 55, brand: 'Amtico', title: 'First', productDescription: 'First is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },

    { id: 56, brand: 'Unitile', title: 'USF 800 EB', productDescription: 'USF 800 EB is a very nice product.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Aluminium', 'Rubber'], patterns: ['Linear'], shades: ['Neutral'], features: ['Durable', 'Compliant'], price: '$$', env: ['GreenTag'], shapes: ['Rolls'], image: '/brand/modulyss/products/artus.webp' },
    { id: 57, brand: 'Unitile', title: 'UNIFOLD 1650', productDescription: 'UNIFOLD 1650 is a very nice product.', applications: ['Entrance', 'Service areas'], materials: ['Aluminium', 'Rubber'], patterns: ['Geometric'], shades: ['Dark'], features: ['Durable', 'Recyclable'], price: '$$', env: ['Declare'], shapes: ['Rolls'], image: '/brand/modulyss/products/artus.webp' },

    { id: 58, brand: 'Armstrong', title: 'ColorArt Medintone', productDescription: 'ColorArt Medintone is a very nice product.', applications: ['Healthcare areas', 'Common & high traffic areas'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Neutral'], features: ['Durable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 59, brand: 'Armstrong', title: 'Medintech Plus', productDescription: 'Medintech Plus is a very nice product.', applications: ['Healthcare areas', 'Service areas'], materials: ['Vinyl'], patterns: ['Textured'], shades: ['Light'], features: ['Durable', 'Green Certificate'], price: '$$$', env: ['GreenTag'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 60, brand: 'Armstrong', title: 'Purift', productDescription: 'Purift is a very nice product.', applications: ['Healthcare areas', 'Entrance'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Light'], features: ['Recyclable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 61, brand: 'Armstrong', title: 'Starlux', productDescription: 'Starlux is a very nice product.', applications: ['Common & high traffic areas', 'Service areas'], materials: ['Vinyl'], patterns: ['Textured'], shades: ['Bright'], features: ['Durable', 'Recycled Content'], price: '$$$', env: ['GreenTag'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },
    { id: 62, brand: 'Armstrong', title: 'Curdlee', productDescription: 'Curdlee is a very nice product.', applications: ['Entrance', 'Kitchens & bathrooms'], materials: ['Vinyl'], patterns: ['Geometric'], shades: ['Dark'], features: ['Durable', 'Quick Ship'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp' },

    { id: 63, brand: 'Modulyss', title: 'In-Stock Modulyss', productDescription: 'Modulyss Products which are in stock.', applications: ['Entrance', 'Common & high traffic areas'], materials: ['Carpet'], patterns: ['Textured'], shades: ['Neutral'], features: ['Durable', 'Recyclable'], price: '$$', env: ['GreenTag'], shapes: ['Squares'], image: '/brand/modulyss/products/artus.webp', inStockTotal: 18 },
    { id: 64, brand: 'Amtico', title: 'In-Stock Amtico', productDescription: 'Amtico Products which are in stock.', applications: ['Service areas', 'Stairways'], materials: ['Vinyl'], patterns: ['Solid'], shades: ['Light'], features: ['Durable', 'Compliant'], price: '$$', env: ['Declare'], shapes: ['Planks'], image: '/brand/modulyss/products/artus.webp', inStockTotal: 8 },
    { id: 65, brand: 'Unitile', title: 'In-Stock Unitile', productDescription: 'Unitile Products which are in stock.', applications: ['Stairways', 'Entrance'], materials: ['Rubber'], patterns: ['Linear'], shades: ['Dark'], features: ['Durable', 'Recyclable'], price: '$$', env: ['GreenTag'], shapes: ['Rolls'], image: '/brand/modulyss/products/artus.webp', inStockTotal: 1 },

]

const ALL = ref<Product[]>(STATIC_PRODUCTS)

// ------- Variant helpers (fallback if product.variants is missing) -------
function colorFromId(id: number, idx: number) {
    // Subtle, minimal palette: low-saturation, mid-lightness
    // Deterministic but quiet swatches for products without explicit variants
    const h = (id * 41 + idx * 23) % 360
    const s = 14 + ((id + idx) % 6) * 2; // 14–24% saturation
    const l = 64 + ((id * 3 + idx) % 5) * 3; // 64–76% lightness
    return `hsl(${h} ${s}% ${l}%)`
}
function buildDefaultVariants(p: Product): Variant[] {
    const count = ((p.id * 7) % 24) + 6 // between 6 and 29
    return Array.from({ length: count }, (_, i) => ({
        name: `Variant ${i + 1}`,
        image: p.image,
        color: colorFromId(p.id, i)
    }))
}
function getVariants(p: Product): Variant[] {
    return (p.variants && p.variants.length) ? p.variants : buildDefaultVariants(p)
}

function slugify(title: string) {
    return title
        .toLowerCase()
        .normalize('NFKD').replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/&/g, ' and ') // keep meaning of ampersands
        .replace(/[^a-z0-9]+/g, '-') // non-alphanumerics → dash
        .replace(/^-+|-+$/g, ''); // trim dashes
}

function productLink(p: Product) {
    const isInStockTile = p.title.toLowerCase().includes('in-stock');
    if (isInStockTile) {
        // Route In-Stock tiles to the dedicated instock route per brand
        const brandSlug = p.brand.toLowerCase();
        return `/products/instock/${brandSlug}`;
    }
    // Default behaviour: slug-based product detail route
    return `/products/${slugify(p.title)}`;
}

// Ensure every product carries a concrete variants[] array (fallbacks applied once)
ALL.value = STATIC_PRODUCTS.map((p) => ({
    ...p,
    variants: getVariants(p)
}));

/* =========================
   Facets: single source of truth
   ========================= */

type FacetKey = 'stock' | 'brand' | 'applications' | 'materials' | 'patterns' | 'shades' | 'features' | 'price' | 'env' | 'shapes'

type FacetDef = { key: FacetKey; title: string }

const FACET_DEFS: FacetDef[] = [
    { key: 'stock', title: 'In-stock availability' },
    { key: 'brand', title: 'Brand' },
    { key: 'applications', title: 'Applications' },
    { key: 'materials', title: 'Materials' },
    { key: 'patterns', title: 'Patterns' },
    { key: 'shades', title: 'Shades' },
    { key: 'features', title: 'Features' },
    { key: 'price', title: 'Price' },
    { key: 'env', title: 'Environmental Certifications' },
    { key: 'shapes', title: 'Shapes' }
]

const FACET_OPTIONS: Record<FacetKey, readonly string[]> = {
    stock: STOCKS,
    brand: BRANDS,
    applications: APPS,
    materials: MATERIALS,
    patterns: PATTERNS,
    shades: SHADES,
    features: FEATURES,
    price: PRICES,
    env: ENVS,
    shapes: SHAPES
}

// How a product matches a single option for a given facet
const FACET_PREDICATE: Record<FacetKey, (p: Product, opt: string) => boolean> = {
    stock: (p, o) => {
        const label = o.toLowerCase();
        const title = p.title.toLowerCase();
        const isInStockTile = title.includes('in-stock');
        if (!isInStockTile) return false;

        if (label.includes('modulyss')) return p.brand === 'Modulyss';
        if (label.includes('amtico')) return p.brand === 'Amtico';
        if (label.includes('unitile')) return p.brand === 'Unitile';
        return false;
    },
    brand: (p, o) => p.brand === (o as Brand),
    applications: (p, o) => p.applications.includes(o as Application),
    materials: (p, o) => p.materials.includes(o as Material),
    patterns: (p, o) => p.patterns.includes(o as Pattern),
    shades: (p, o) => p.shades.includes(o as Shade),
    features: (p, o) => p.features.includes(o as Feature),
    price: (p, o) => p.price === (o as Price),
    env: (p, o) => p.env.includes(o as Env),
    shapes: (p, o) => p.shapes.includes(o as Shape)
}

/* =========================
   UI/Filter state
   ========================= */

const querySearch = ref('')

function makeEmptyFilters(): Record<FacetKey, Set<string>> {
    return {
        stock: new Set(),
        brand: new Set(),
        applications: new Set(),
        materials: new Set(),
        patterns: new Set(),
        shades: new Set(),
        features: new Set(),
        price: new Set(),
        env: new Set(),
        shapes: new Set()
    }
}

const filters = reactive<Record<FacetKey, Set<string>>>(makeEmptyFilters())

const showFilters = ref(true)
const viewMode = ref<'grid' | 'list' | 'compare'>('grid')

// === Desktop/mobile filters UI state ===
const isDesktop = ref(false)
const mobileFiltersOpen = ref(false)
function updateIsDesktop() {
    isDesktop.value = window.matchMedia('(min-width: 1024px)').matches
}
const filtersBtnLabel = computed(() =>
    isDesktop.value
        ? (showFilters.value ? 'Hide filters' : 'Show filters')
        : 'Show filters'
)
function onFiltersClick() {
    if (isDesktop.value) {
        showFilters.value = !showFilters.value
    } else {
        mobileFiltersOpen.value = true
    }
}
function applyMobileFilters() {
    mobileFiltersOpen.value = false
}
onMounted(() => {
    updateIsDesktop()
    window.addEventListener('resize', updateIsDesktop)
})
onUnmounted(() => {
    window.removeEventListener('resize', updateIsDesktop)
})

// Compare
const compareIds = ref<number[]>([])
function toggleCompare(id: number) {
    const i = compareIds.value.indexOf(id)
    if (i > -1) compareIds.value.splice(i, 1)
    else compareIds.value.push(id)
}
const compareProducts = computed(() => ALL.value.filter(p => compareIds.value.includes(p.id)))
function clearCompare() { compareIds.value = [] }

// Quick menu
const QUICK_MENU = [
    { label: 'All products', query: {} as Record<string, string> },
    { label: 'Entrance systems', query: { applications: 'Entrance' } },
    { label: 'Carpet flooring', query: { materials: 'Carpet' } },
    { label: 'Vinyl flooring', query: { materials: 'Vinyl' } },
    { label: 'Rubber flooring', query: { materials: 'Rubber' } },
    { label: 'Kinetex® flooring', query: { materials: 'Kinetex' } }
] as const

function onQuickClick(item: typeof QUICK_MENU[number]) {
    router.replace({ path: '/products', query: { ...item.query } })
}

// Sticky toolbar height helper (keeps filters correctly offset)
const toolbarRef = ref<HTMLElement | null>(null)
function setToolbarHeight() {
    const h = toolbarRef.value?.offsetHeight || 0
    document.documentElement.style.setProperty('--toolbar-height', `${h}px`)
}

onMounted(() => {
    setToolbarHeight()
    window.addEventListener('resize', setToolbarHeight)
})

onUnmounted(() => {
    window.removeEventListener('resize', setToolbarHeight)
})

// Map "By category" params to a materials value
function materialFromProductCategory(cat?: string | null) {
    if (!cat) return null
    const c = cat.toLowerCase()
    if (c.includes('vinyl')) return 'Vinyl'
    if (c.includes('carpet')) return 'Carpet'
    if (c.includes('rubber')) return 'Rubber'
    if (c.includes('kinetex')) return 'Kinetex'
    return null
}
function getActiveCategoryMaterial(): string | null {
    const q = route.query as any
    return (q.materials as string) || materialFromProductCategory(q.productCategory as string) || null
}

function isQuickActive(item: typeof QUICK_MENU[number]) {
    const q = route.query as any

    // If "All products" – only active when there is NO category from route,
    // no manual filters and no search term.
    if (item.label === 'All products') {
        const hasRouteCategory = !!getActiveCategoryMaterial() || !!q.applications
        const hasSearch = !!querySearch.value.trim()
        return !hasRouteCategory && !hasAnyActiveFilter.value && !hasSearch
    }

    // Materials-based tabs (Carpet/Vinyl/Rubber/Kinetex)
    if ('materials' in item.query) {
        return getActiveCategoryMaterial() === (item.query as any).materials
    }

    // Applications-based tab (Entrance systems)
    if ('applications' in item.query) {
        return q.applications === (item.query as any).applications
    }

    return false
}

// Accordion state
const openPanels = reactive<Record<FacetKey, boolean>>({
    stock: true,
    brand: true,
    applications: false,
    materials: false,
    patterns: false,
    shades: false,
    features: false,
    price: false,
    env: false,
    shapes: false
})
function togglePanel(key: FacetKey) { openPanels[key] = !openPanels[key] }

/* =========================
   Category hero (from By category OR active material tab)
   ========================= */

// Source-of-truth for category hero content (mirrors SiteHeader groups.categories.items)
const CATEGORY_ITEMS = [
    {
        title: 'Entrance systems',
        image: '/block3/block3-entrancesystems.jpg',
        blurb:
            'Aluminium Architectural Series and entry carpets that trap dirt and moisture for cleaner, safer interiors.',
    },
    { title: 'Carpet flooring', image: '/block3/block3-carpetflooring.jpg', blurb: 'Durable, acoustic and expressive carpet solutions for commercial spaces.' },
    { title: 'Vinyl flooring', image: '/block3/block3-vinylflooring.jpg', blurb: 'Versatile, affordable and tough vinyl for a wide range of settings.' },
    { title: 'Rubber flooring', image: '/block3/block3-rubberflooring.jpg', blurb: 'Shock-absorbing, durable EPDM and reclaimed rubber with a modern aesthetic.' },
    { title: 'Kinetex® flooring', image: '/block3/block3-kinetexflooring.jpg', blurb: 'Soft-surface performance flooring: durable, cleanable and comfortable.' },
] as const;

// Map material query values → category titles
const MATERIAL_TO_LABEL: Record<string, string> = {
    Vinyl: 'Vinyl flooring',
    Carpet: 'Carpet flooring',
    Rubber: 'Rubber flooring',
    Kinetex: 'Kinetex® flooring',
};

// Map application query values → canonical category titles (for URL/hero normalization)
const APPLICATION_TO_CATEGORY: Record<string, string> = {
    Entrance: 'Entrance systems',
};

// Resolve the active category label from either the explicit route param
// (productCategory), or via applications, or the currently active material tab selection.
const activeCategoryLabel = computed<string | null>(() => {
    const explicit = route.query.productCategory?.toString();
    if (explicit) return explicit;

    // If we arrived via applications, translate to the canonical category title
    const fromApp = APPLICATION_TO_CATEGORY[(route.query.applications as string) || ''];
    if (fromApp) return fromApp;

    const mat = getActiveCategoryMaterial(); // uses route.query.materials or productCategory
    if (mat && MATERIAL_TO_LABEL[mat]) return MATERIAL_TO_LABEL[mat];

    return null;
});

// Whether to render the category hero block
const fromCategory = computed(() => !!activeCategoryLabel.value);

// Find hero content for the resolved label
const activeCategoryHero = computed(() => {
    const label = activeCategoryLabel.value;
    if (!label) return null;
    return CATEGORY_ITEMS.find(i => i.title === label) || null;
});

// Title + content with graceful fallbacks (prefer explicit query overrides if provided)
const categoryTitle = computed(() =>
    activeCategoryLabel.value ? `${activeCategoryLabel.value} products` : 'All products'
);

const categoryBlurb = computed(() =>
    (route.query.heroBlurb?.toString() || activeCategoryHero.value?.blurb || '')
);

const categoryHeroImg = computed(() =>
    (route.query.heroImg?.toString() || activeCategoryHero.value?.image || '')
);

/* =========================
   Query-param prefilters (generic)
   ========================= */

function applyPrefiltersFromQuery() {
    // clear all
    Object.values(filters).forEach(s => s.clear())

    const q = route.query
        ; (Object.keys(FACET_OPTIONS) as FacetKey[]).forEach(key => {
            const v = (q as any)[key]
            if (typeof v === 'string' && v) filters[key].add(v)
        })
    // If arriving from "By category", map productCategory → materials
    const mappedMat = materialFromProductCategory((q as any).productCategory as string)
    if (mappedMat) {
        filters.materials.add(mappedMat)
    }
}

// Normalize incoming query: if `applications` is a synonym for a category, rewrite to productCategory
function normalizeProductsQuery() {
    const q = { ...(route.query as Record<string, any>) };
    const app = (q.applications as string) || '';
    const mapped = APPLICATION_TO_CATEGORY[app];
    if (mapped) {
        delete q.applications;
        q.productCategory = mapped;
        if (!q.view) q.view = 'grid';
        router.replace({ path: route.path, query: q });
    }
}

onMounted(() => { applyPrefiltersFromQuery() })
onMounted(() => { normalizeProductsQuery() });
watch(() => route.query, () => applyPrefiltersFromQuery())
watch(() => route.fullPath, () => normalizeProductsQuery());

/* =========================
   Filtering & counts (generic)
   ========================= */

function productMatchesFacets(p: Product, ignore?: FacetKey) {
    for (const key of Object.keys(FACET_OPTIONS) as FacetKey[]) {
        if (ignore && key === ignore) continue
        const selected = filters[key]
        if (!selected.size) continue
        // require product to match at least one selected option for this facet
        let facetHit = false
        for (const opt of selected) {
            if (FACET_PREDICATE[key](p, opt)) { facetHit = true; break }
        }
        if (!facetHit) return false
    }
    return true
}

const filtered = computed(() => {
    const term = querySearch.value.trim().toLowerCase()
    return ALL.value.filter(p => {
        const matchesSearch = !term || p.title.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term)
        return matchesSearch && productMatchesFacets(p)
    })
})

function facetOptionCount(facet: FacetKey, option: string) {
    // Special case: In-stock availability uses static totals from the three In-Stock tiles
    if (facet === 'stock') {
        const label = option.toLowerCase();
        let brand: Brand | null = null;
        if (label.includes('modulyss')) brand = 'Modulyss';
        else if (label.includes('amtico')) brand = 'Amtico';
        else if (label.includes('unitile')) brand = 'Unitile';

        if (!brand) return 0;

        const tile = ALL.value.find(p => p.title.toLowerCase().includes('in-stock') && p.brand === brand);
        return tile?.inStockTotal ?? 0;
    }

    const term = querySearch.value.trim().toLowerCase();
    return ALL.value.filter(p => {
        const matchesSearch = !term || p.title.toLowerCase().includes(term) || p.brand.toLowerCase().includes(term);
        if (!matchesSearch) return false;
        // treat this option as if selected; other facets as in state
        if (!FACET_PREDICATE[facet](p, option)) return false;
        return productMatchesFacets(p, facet);
    }).length;
}

const hasAnyActiveFilter = computed(() => (Object.values(filters) as Array<Set<string>>).some(s => s.size > 0))

/* =========================
   Manual pagination (20 at a time)
   ========================= */
const pageSize = 20
const visible = ref(pageSize)

function resetVisible() { visible.value = pageSize }
const paged = computed(() => filtered.value.slice(0, visible.value))
const remaining = computed(() => Math.max(filtered.value.length - visible.value, 0))
function loadMore() {
    visible.value = Math.min(visible.value + pageSize, filtered.value.length)
}

watch([filtered, querySearch], () => resetVisible())

/* =========================
   UI helpers
   ========================= */

function clearAll() {
    Object.values(filters).forEach(s => s.clear())
    querySearch.value = ''
    router.replace({ query: {} })
}

function optionsFor(key: FacetKey) { return FACET_OPTIONS[key] }
function getSet(key: FacetKey) { return filters[key] }
</script>

<template>
    <main :class="['products-page min-h-screen bg-[#F9F4EA] pt-16', { 'has-filters': showFilters }]">

        <!-- Top toolbar: tabs + search -->
        <section class="border-b border-black/10">
            <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <h1 class="text-[clamp(32px,3.2vw,48px)] font-semibold tracking-tight leading-[1.15] mb-4">{{ categoryTitle }}</h1>
            </div>

            <div ref="toolbarRef" class="toolbar-sticky">
                <!-- Horizontal quick menu (scrollable) -->
                <div class="w-full mx-auto px-4 sm:px-6 lg:px-8 pb-6">
                    <div
                        class="flex gap-3 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button v-for="m in QUICK_MENU" :key="m.label" @click="onQuickClick(m)"
                            :class="['search-widget-menu__link px-2 pb-2 border-b-2', isQuickActive(m) ? 'border-black text-black' : 'border-transparent text-black/60 hover:text-black']">
                            <span class="text-[clamp(14px,1vw,16px)]">{{ m.label }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Category hero BELOW quick menu (image + blurb only) -->
        <section v-if="fromCategory">
          <div class="w-full mx-auto grid grid-cols-1 lg:grid-cols-[1fr_640px] gap-8 px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex flex-col">
              <p class="text-[clamp(14px,1.1vw,16px)] leading-relaxed text-black/70 mt-auto">{{ categoryBlurb }}</p>
            </div>
            <div v-if="categoryHeroImg" class="bg-[#E6DFD3] overflow-hidden">
              <img :src="categoryHeroImg" alt="" class="w-full h-full object-cover aspect-[16/9]" />
            </div>
          </div>
        </section>

        <!-- Controls row (filters/view/search) BELOW hero -->
        <section class="border-b border-black/10">
          <div
            class="w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-center gap-4">
              <button type="button" @click="onFiltersClick" class="px-3 py-2 text-sm border transition-colors"
                      :class="showFilters ? 'border-black/20 bg-transparent text-black hover:bg-black hover:text-white' : 'border-black bg-black text-white'">
                <span>{{ filtersBtnLabel }}</span>
              </button>
              <!-- View toggles -->
              <div class="hidden sm:flex items-center gap-3">
                <button @click="viewMode = 'grid'"
                        :class="['px-2 py-1 uppercase text-[11px] tracking-[0.08em]', viewMode === 'grid' ? 'font-semibold text-black border-b-2 border-black' : 'text-black/60 hover:text-black']">Grid</button>
                <button @click="viewMode = 'list'"
                        :class="['px-2 py-1 uppercase text-[11px] tracking-[0.08em]', viewMode === 'list' ? 'font-semibold text-black border-b-2 border-black' : 'text-black/60 hover:text-black']">List</button>
                <button @click="viewMode = 'compare'"
                        :class="['px-2 py-1 uppercase text-[11px] tracking-[0.08em]', viewMode === 'compare' ? 'font-semibold text-black border-b-2 border-black' : 'text-black/60 hover:text-black']">Compare</button>
              </div>
            </div>

            <div class="flex items-center w-full lg:w-auto">
              <div class="search-wrap w-full max-w-[560px] ml-auto">
                <svg class="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.2-4.2" />
                </svg>
                <input v-model="querySearch" type="search" inputmode="search" autocomplete="off"
                       spellcheck="false" autocapitalize="off" placeholder="Search products"
                       class="search-input" />
              </div>
            </div>
          </div>
        </section>

        <!-- Mobile Filters Drawer (moved out of desktop aside so it renders on mobile) -->
        <transition name="filters-slide">
          <div v-if="mobileFiltersOpen" class="filters-drawer lg:hidden">
            <div class="drawer-backdrop" @click="applyMobileFilters"></div>
            <aside class="drawer-panel" role="dialog" aria-modal="true">
              <header class="drawer-header">
                <h2>Filter results</h2>
                <button class="drawer-close" aria-label="Close" @click="applyMobileFilters">✕</button>
              </header>
              <div class="drawer-body">
                <div v-for="f in FACET_DEFS" :key="f.key" class="pt-0">
                  <!-- Special case: stock facet should have no title, just the options -->
                  <template v-if="f.key === 'stock'">
                    <div class="mt-1 flex flex-col gap-0.5">
                      <label v-for="opt in optionsFor(f.key)" :key="String(opt)" class="filters-option inline-flex items-center gap-2 py-1">
                        <input
                          class="filters-checkbox"
                          type="checkbox"
                          :checked="getSet(f.key).has(opt as string)"
                          @change="getSet(f.key).has(opt as string) ? getSet(f.key).delete(opt as string) : getSet(f.key).add(opt as string)"
                        />
                        <span class="opt-label flex-1 leading-tight">{{ opt }}</span>
                        <sup class="opt-count">{{ facetOptionCount(f.key, opt as string) }}</sup>
                      </label>
                    </div>
                  </template>
                  <!-- Default: regular titled accordion facet -->
                  <template v-else>
                    <button class="w-full flex items-center justify-between text-left py-1" @click="togglePanel(f.key)">
                      <span class="filters-title">{{ f.title }}</span>
                      <svg viewBox="0 0 18 14" class="w-4 h-4 transition-transform" :class="openPanels[f.key] ? 'rotate-180' : ''">
                        <path d="M1 4l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" />
                      </svg>
                    </button>
                    <div v-show="openPanels[f.key]" class="mt-1 flex flex-col gap-0.5">
                      <label v-for="opt in optionsFor(f.key)" :key="String(opt)" class="filters-option inline-flex items-center gap-2 py-1">
                        <input
                          class="filters-checkbox"
                          type="checkbox"
                          :checked="getSet(f.key).has(opt as string)"
                          @change="getSet(f.key).has(opt as string) ? getSet(f.key).delete(opt as string) : getSet(f.key).add(opt as string)"
                        />
                        <span class="opt-label flex-1 leading-tight">{{ opt }}</span>
                        <sup class="opt-count">{{ facetOptionCount(f.key, opt as string) }}</sup>
                      </label>
                    </div>
                  </template>
                </div>
              </div>
              <footer class="drawer-footer">
                <button class="apply-btn" @click="applyMobileFilters">Apply Filters</button>
              </footer>
            </aside>
          </div>
        </transition>

        <!-- Content grid -->
        <div class="w-full page-grid products-layout mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 gap-10 items-start min-h-0 overflow-visible"
            :class="showFilters ? 'lg:grid-cols-[300px_1fr]' : 'lg:grid-cols-1'">
            <!-- Filters column (desktop only) -->
            <aside v-if="showFilters" class="filters-col hidden lg:block">
                <div class="filters-sticky pr-2">
                    <div v-for="f in FACET_DEFS" :key="f.key" class="pt-0">
                        <!-- Special case: stock facet should have no title, just the options -->
                        <template v-if="f.key === 'stock'">
                            <div class="mt-1 flex flex-col gap-0.5">
                                <label v-for="opt in optionsFor(f.key)" :key="String(opt)"
                                    class="filters-option inline-flex items-center gap-2 py-1">
                                    <input
                                      class="filters-checkbox"
                                      type="checkbox"
                                      :checked="getSet(f.key).has(opt as string)"
                                      @change="getSet(f.key).has(opt as string) ? getSet(f.key).delete(opt as string) : getSet(f.key).add(opt as string)"
                                    />
                                    <span class="opt-label flex-1 leading-tight">{{ opt }}</span>
                                    <sup class="opt-count">{{ facetOptionCount(f.key, opt as string) }}</sup>
                                </label>
                            </div>
                        </template>
                        <!-- Default: regular titled accordion facet -->
                        <template v-else>
                            <button class="w-full flex items-center justify-between text-left py-1"
                                @click="togglePanel(f.key)">
                                <span class="filters-title">{{ f.title }}</span>
                                <svg viewBox="0 0 18 14" class="w-4 h-4 transition-transform"
                                    :class="openPanels[f.key] ? 'rotate-180' : ''">
                                    <path d="M1 4l8 8 8-8" stroke="currentColor" stroke-width="2" fill="none" />
                                </svg>
                            </button>
                            <div v-show="openPanels[f.key]" class="mt-1 flex flex-col gap-0.5">
                                <label v-for="opt in optionsFor(f.key)" :key="String(opt)"
                                    class="filters-option inline-flex items-center gap-2 py-1">
                                    <input
                                      class="filters-checkbox"
                                      type="checkbox"
                                      :checked="getSet(f.key).has(opt as string)"
                                      @change="getSet(f.key).has(opt as string) ? getSet(f.key).delete(opt as string) : getSet(f.key).add(opt as string)" />
                                    <span class="opt-label flex-1 leading-tight">{{ opt }}</span>
                                    <sup class="opt-count">{{ facetOptionCount(f.key, opt as string) }}</sup>
                                </label>
                            </div>
                        </template>
                    </div>
                </div>
            </aside>

            <!-- Results column -->
            <section class="results-col min-w-0 pb-40">
                <!-- GRID VIEW -->
                <div v-if="viewMode === 'grid'">
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 grid-with-col-lines">
                        <article v-for="p in paged" :key="p.id" class="bg-white border border-black/10 overflow-hidden">
                            <RouterLink :to="productLink(p)" class="block">
                              <div class="aspect-[4/3] bg-[#EEE]">
                                <img :src="p.image" :alt="p.title" class="w-full h-full object-cover" />
                              </div>
                            </RouterLink>
                            <div class="p-5">
                                <h3 class="text-[clamp(16px,1.2vw,18px)] font-medium mb-1.5">
                                  <RouterLink :to="productLink(p)">{{ p.title }}</RouterLink>
                                </h3>
                                <div class="text-sm text-black/60">{{ p.brand }} · {{ p.materials.join(', ') }}</div>
                                <div class="mt-3 text-xs text-black/60">Price: {{ p.price }}</div>
                                <div class="mt-4 flex items-center justify-between">
                                    <label class="inline-flex items-center gap-2 text-xs cursor-pointer select-none">
                                        <input type="checkbox" :checked="compareIds.includes(p.id)"
                                            @change="toggleCompare(p.id)" />
                                        <span>Compare</span>
                                    </label>
                                    <div class="flex items-center gap-1">
                                        <span v-for="(v, i) in (p.variants || []).slice(0, 5)" :key="p.id + '-v-' + i"
                                            class="swatch" :style="{ background: v.color }" :title="v.name"></span>
                                        <span v-if="(p.variants?.length || 0) > 5" class="text-xs text-black/60 ml-1">+
                                            {{
                                                (p.variants?.length || 0) - 5 }}</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                    <div class="mt-8 flex items-center justify-between py-6 border-t border-black/10">
                        <button v-if="remaining > 0" @click="loadMore"
                            class="text-[clamp(20px,2.5vw,28px)] font-semibold underline">
                            Load more results
                        </button>
                        <div class="ml-auto text-[clamp(20px,2.5vw,28px)] font-semibold text-black/70">
                            {{ Math.min(visible, filtered.length) }} / {{ filtered.length }}
                        </div>
                    </div>
                </div>

                <!-- LIST VIEW -->
                <div v-else-if="viewMode === 'list'">
                    <ul class="divide-y divide-black/10 bg-transparent">
                        <li v-for="p in paged" :key="p.id" class="flex items-center gap-4 py-4">
                            <RouterLink :to="productLink(p)" class="block w-28 h-20 flex-shrink-0">
                              <div class="w-28 h-20 bg-[#EEE] overflow-hidden">
                                <img :src="p.image" :alt="p.title" class="w-full h-full object-cover" />
                              </div>
                            </RouterLink>
                            <div class="min-w-0 flex-1">
                                <h3 class="text-[clamp(16px,1.2vw,18px)] font-medium truncate">
                                  <RouterLink :to="productLink(p)">{{ p.title }}</RouterLink>
                                </h3>
                                <div class="text-sm text-black/60 truncate">{{ p.brand }} · {{ p.materials.join(', ') }}
                                </div>
                                <div class="mt-1 text-xs text-black/60">Price: {{ p.price }}</div>
                            </div>
                            <label class="ml-auto inline-flex items-center gap-2 text-xs cursor-pointer select-none">
                                <input type="checkbox" :checked="compareIds.includes(p.id)"
                                    @change="toggleCompare(p.id)" />
                                <span>Compare</span>
                            </label>
                        </li>
                    </ul>
                    <div class="mt-8 flex items-center justify-between py-6 border-t border-black/10">
                        <button v-if="remaining > 0" @click="loadMore"
                            class="text-[clamp(20px,2.5vw,28px)] font-semibold underline">
                            Load more results
                        </button>
                        <div class="ml-auto text-[clamp(20px,2.5vw,28px)] font-semibold text-black/70">
                            {{ Math.min(visible, filtered.length) }} / {{ filtered.length }}
                        </div>
                    </div>
                </div>

                <!-- COMPARE VIEW -->
                <div v-else>
                    <div class="mb-4 flex items-center justify-between">
                        <div class="text-sm text-black/60" v-if="compareIds.length">Selected: {{ compareIds.length }}
                        </div>
                        <button v-if="compareIds.length" @click="clearCompare()"
                            class="text-xs underline">Clear</button>
                    </div>
                    <div v-if="compareIds.length === 0" class="text-black/60 text-sm">
                        No products selected for comparison. In Grid or List view, tick “Compare”.
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full text-sm">
                            <thead class="text-left border-b border-black/10">
                                <tr>
                                    <th class="py-2 pr-4">Product</th>
                                    <th class="py-2 pr-4">Brand</th>
                                    <th class="py-2 pr-4">Material</th>
                                    <th class="py-2 pr-4">Price</th>
                                    <th class="py-2 pr-4">Applications</th>
                                    <th class="py-2 pr-4">Features</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-black/10">
                                <tr v-for="p in compareProducts" :key="p.id">
                                    <td class="py-3 pr-4">
                                        <div class="flex items-center gap-3">
                                            <div class="w-16 h-12 bg-[#EEE] overflow-hidden flex-shrink-0">
                                                <img :src="p.image" :alt="p.title" class="w-full h-full object-cover" />
                                            </div>
                                            <div class="font-medium">{{ p.title }}</div>
                                        </div>
                                    </td>
                                    <td class="py-3 pr-4">{{ p.brand }}</td>
                                    <td class="py-3 pr-4">{{ p.materials.join(', ') }}</td>
                                    <td class="py-3 pr-4">{{ p.price }}</td>
                                    <td class="py-3 pr-4">{{ p.applications.join(', ') }}</td>
                                    <td class="py-3 pr-4">{{ p.features.join(', ') }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    </main>
</template>

<style>
/* ==============================
   AllProducts: fix results clipping & sticky filters (v2)
   ============================== */

:root {
    /* Adjust this to your actual fixed header height */
    --header-height: 72px;
    --toolbar-height: 0px;
    /* set at runtime from the sticky bar */
    --sticky-gap: 16px;
    --sticky-offset: calc(var(--header-height) + var(--toolbar-height) + var(--sticky-gap));
}

/* Global safety overrides to stop scroll locking on this page */
html,
body,
#app {
    max-height: none !important;
    height: auto !important;
    min-height: 100% !important;
    overflow-y: auto !important;
    overflow-x: visible !important;
    contain: initial !important;
}

/* 1) Prevent nested scrollers from locking/clipping the results */
.products-page,
.products-page .products-layout,
.products-page .results-col {
    max-height: none !important;
    height: auto !important;
    overflow: visible !important;
    contain: initial !important;
}

/* Sticky horizontal toolbar (quick menu + actions) */
.products-page .toolbar-sticky {
    position: sticky;
    top: var(--header-height);
    z-index: 5;
    background: #F9F4EA;
    /* same as page bg to cover content underneath */
    border-bottom: 1px solid rgba(0, 0, 0, .1);
}

/* Keep enough breathing room so the last row never looks half-cut by the footer */
.products-page .results-col {
    padding-bottom: 160px;
}

/* Ensure the grid container doesn't interfere with sticky (Safari/Chrome quirks) */
.products-page .products-layout {
    align-items: start !important;
    grid-auto-rows: min-content;
}

/* 2) Sticky filters on desktop: results scroll, filters stay pinned */
@media (min-width: 1024px) {

    /* aside lives in the grid but is not sticky itself */
    .products-page .filters-col {
        align-self: start !important;
        padding-left: 12px;
        /* subtle left margin inside filters */
    }

    /* inner wrapper does the sticky work */
    .products-page .filters-sticky {
        position: -webkit-sticky !important;
        position: sticky !important;
        top: var(--sticky-offset) !important;
        height: calc(100dvh - var(--sticky-offset)) !important;
        overflow: auto !important;
        -webkit-overflow-scrolling: touch !important;
        z-index: 2;
    }
}

@media (min-width: 1024px) {

    /* Draw the vertical divider on the results column so it always reaches the footer height */
    .products-page.has-filters .results-col {
        border-left: 1px solid rgba(0, 0, 0, 0.12);
        padding-left: 12px;
        /* breathing room from the divider */
    }
}

/* 3) Ensure no ancestor breaks sticky via clipping or transforms */
.products-page,
.products-page .products-layout,
.products-page .filters-col,
.products-page .filters-sticky,
.products-page .filters-col>div {
    overflow: visible !important;
    transform: none !important;
    filter: none !important;
    contain: initial !important;
    backface-visibility: visible !important;
}

/* Variant swatches */
.products-page .swatch {
    width: 10px;
    height: 10px;
    border: 1px solid rgba(0, 0, 0, .25);
    border-radius: 0;
    display: inline-block;
    vertical-align: middle;
}

/* Ensure each grid tile has a thin separator (real border so lines appear between cards) */
.products-page article {
    border: 1px solid rgba(0, 0, 0, 0.12);
    box-shadow: none;
}

/* ==============================
   Filters typography & custom checkbox (sleek options, indented, filled state)
   ============================== */
.products-page .filters-title {
    font-weight: 600;
    font-size: 1rem;
    /* ~16px */
    letter-spacing: 0.005em;
}

.products-page .filters-option {
    padding-left: 6px;
    /* slight indent so options read as children */
}

.products-page .opt-label {
    font-weight: 300;
    /* sleek/thin */
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.85);
}

.products-page .opt-count {
    color: rgba(0, 0, 0, 0.35);
    font-variant-numeric: tabular-nums;
}

.products-page .filters-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid rgba(0, 0, 0, 0.6);
    background: transparent;
    border-radius: 2px;
    /* square look */
    display: inline-block;
    position: relative;
    flex-shrink: 0;
}

.products-page .filters-checkbox::after {
    content: "";
    display: block;
    width: 10px;
    height: 10px;
    margin: 2px;
    /* leaves an inner margin around the fill */
    background: transparent;
}

.products-page .filters-checkbox:checked::after {
    background: #000;
    /* black inner square when selected */
}

.products-page .filters-checkbox:checked {
    border-color: #000;
    background: transparent;
    /* do not fill the full box; use ::after instead */
}

.products-page .filters-checkbox:focus-visible {
    outline: 2px solid #000;
    outline-offset: 2px;
}

.products-page .filters-checkbox:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

/* ==============================
   Relaxed search input + improved magnifier
   ============================== */
.products-page .search-wrap {
    position: relative;
}

.products-page .search-input {
    width: 100%;
    height: 44px;
    padding: 0 44px 0 40px;
    /* space for icon on the left and clear area on the right */
    border: 1px solid rgba(0, 0, 0, 0.22);
    background: #F2ECE1;
    /* subtle warm background that fits the page */
    border-radius: 0;
    font-size: 0.95rem;
    line-height: 1;
    transition: border-color .2s ease, background .2s ease, box-shadow .2s ease;
}

.products-page .search-input::placeholder {
    color: rgba(0, 0, 0, 0.45);
    letter-spacing: .02em;
    text-transform: none;
}

.products-page .search-input:focus {
    outline: none;
    border-color: #000;
    background: #F7F2E9;
    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.06);
}

.products-page .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    stroke: rgba(0, 0, 0, .55);
    stroke-width: 1.75;
    fill: none;
    pointer-events: none;
}

.products-page .search-wrap:focus-within .search-icon {
    stroke: #000;
}

/* Hide default WebKit search decorations for a cleaner look */
.products-page input[type="search"]::-webkit-search-decoration,
.products-page input[type="search"]::-webkit-search-cancel-button,
.products-page input[type="search"]::-webkit-search-results-button,
.products-page input[type="search"]::-webkit-search-results-decoration {
    display: none;
}

/* ==============================
   Vertical grid separators between columns (drawn in the gap)
   ============================== */
.products-page .grid-with-col-lines {
    position: relative;
}

.products-page .grid-with-col-lines::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    /* behind cards, visible only in the gaps */
}

/* 4 columns (xl) → 3 vertical lines at 25%, 50%, 75% */
@media (min-width: 1280px) {
    .products-page .grid-with-col-lines::before {
        background: linear-gradient(to right,
                transparent calc(25% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(25% + 0.5px),
                transparent calc(50% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(50% + 0.5px),
                transparent calc(75% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(75% + 0.5px));
    }
}

/* 3 columns (lg) → 2 vertical lines at 33.333% & 66.667% */
@media (min-width: 1024px) and (max-width: 1279.98px) {
    .products-page .grid-with-col-lines::before {
        background: linear-gradient(to right,
                transparent calc(33.333% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(33.333% + 0.5px),
                transparent calc(66.667% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(66.667% + 0.5px));
    }
}

/* 2 columns (sm/md) → 1 vertical line at 50% */
@media (min-width: 640px) and (max-width: 1023.98px) {
    .products-page .grid-with-col-lines::before {
        background: linear-gradient(to right,
                transparent calc(50% - 0.5px), rgba(0, 0, 0, 0.12) 0, transparent calc(50% + 0.5px));
    }
}

/* Mobile Filters Drawer Styles */
.filters-drawer {
    position: fixed;
    inset: 0;
    z-index: 60;
}

.filters-drawer .drawer-backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, .35);
}

.filters-drawer .drawer-panel {
    position: absolute;
    inset: 0;
    background: #F9F4EA;
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 24px rgba(0,0,0,.06);
    will-change: clip-path;
    transform: translateZ(0);
}

.filters-drawer .drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, .1);
}

.filters-drawer .drawer-close {
    font-size: 20px;
    line-height: 1;
    padding: 4px 8px;
}

.filters-drawer .drawer-body {
    padding: 12px 16px 96px;
    overflow: auto;
}

.filters-drawer .drawer-footer {
    position: sticky;
    bottom: 0;
    padding: 12px 16px;
    border-top: 1px solid rgba(0, 0, 0, .1);
    background: linear-gradient(to bottom, rgba(249, 244, 234, .96), rgba(249, 244, 234, 1));
}

.filters-drawer .apply-btn {
    width: 100%;
    padding: 14px 16px;
    background: #000;
    color: #fff;
    font-weight: 600;
}

/* Mobile Filters Drawer Animations — curtain swipe */
/* Backdrop fades in/out */
.filters-slide-enter-from .drawer-backdrop { opacity: 0; }
.filters-slide-enter-active .drawer-backdrop,
.filters-slide-leave-active .drawer-backdrop { transition: opacity .26s ease; }
.filters-slide-leave-to .drawer-backdrop { opacity: 0; }

/* Default (modern) path: animate a curtain-like reveal using clip-path */
@supports (clip-path: inset(0 0 0 0)) {
  .filters-slide-enter-from .drawer-panel { clip-path: inset(0 0 0 100%); }
  .filters-slide-enter-to .drawer-panel   { clip-path: inset(0 0 0 0); }
  .filters-slide-enter-active .drawer-panel {
    transition: clip-path .30s cubic-bezier(0.22, 1, 0.36, 1),
                box-shadow .24s ease;
    will-change: clip-path;
  }

  .filters-slide-leave-from .drawer-panel { clip-path: inset(0 0 0 0); }
  .filters-slide-leave-to .drawer-panel   { clip-path: inset(0 0 0 100%); }
  .filters-slide-leave-active .drawer-panel {
    transition: clip-path .24s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow .20s ease;
    will-change: clip-path;
  }
}

/* Fallback path: slide in/out from the right if clip-path is unsupported */
@supports not (clip-path: inset(0 0 0 0)) {
  .filters-slide-enter-from .drawer-panel { transform: translateX(100%); }
  .filters-slide-enter-to .drawer-panel   { transform: translateX(0); }
  .filters-slide-enter-active .drawer-panel { transition: transform .28s ease-out; }

  .filters-slide-leave-from .drawer-panel { transform: translateX(0); }
  .filters-slide-leave-to .drawer-panel   { transform: translateX(100%); }
  .filters-slide-leave-active .drawer-panel { transition: transform .24s ease-in; }
}

/* Reduced motion: appear/disappear without sweeping motion */
@media (prefers-reduced-motion: reduce) {
  .filters-slide-enter-active .drawer-backdrop,
  .filters-slide-leave-active .drawer-backdrop { transition: none; }

  .filters-slide-enter-from .drawer-panel,
  .filters-slide-leave-to .drawer-panel,
  .filters-slide-enter-to .drawer-panel,
  .filters-slide-leave-from .drawer-panel { clip-path: none !important; transform: none !important; }

  .filters-slide-enter-active .drawer-panel,
  .filters-slide-leave-active .drawer-panel { transition: none; }
}

/* 1 column (xs) → no separators */
</style>
