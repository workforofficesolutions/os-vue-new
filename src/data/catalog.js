/**
 * Static catalog for product detail pages.
 * - Add the remaining 56 products to CATALOG below.
 * - Keep `slug` manual to match the URL you want (e.g. "artus" => /products/artus).
 * - Variants drive both "Available colours" (swatches) and "Colours" (bigger grid).
 */

/** @typedef {{ name: string; image: string; swatch?: string }} Variant */
/** @typedef {{
 *  id: number;
 *  brand: string;
 *  title: string;
 *  slug?: string; // strongly recommended for precise URLs
 *  productDescription: string;
 *  applications: string[];
 *  materials: string[];
 *  patterns: string[];
 *  shades: string[];
 *  features: string[];
 *  price: string;
 *  env: string[];
 *  shapes: string[];
 *  image: string; // hero image
 *  variants?: Variant[];
 *  roomshots?: string[];
 * }} Product
 */

/** Slug helper (fallback if a product lacks explicit `slug`) */
export function slugify(str = '') {
  return String(str)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')                     // non-alphanum -> -
    .replace(/^-+|-+$/g, '')                         // trim -
    .replace(/--+/g, '-');                           // collapse --
}

/** Find a product using a URL slug */
export function findProductBySlug(slug) {
  if (!slug) return undefined;
  const s = String(slug).toLowerCase();
  // First try explicit slug
  let hit = CATALOG.find(p => (p.slug && p.slug.toLowerCase()) === s);
  if (hit) return hit;
  // Fallback: derived from title
  return CATALOG.find(p => slugify(p.title) === s);
}

/** ------------------ CATALOG (add the other 56 here) ------------------ */
export const CATALOG = [
  /** Artus (Modulyss) */
  {
    id: 1,
    brand: 'Modulyss',
    title: 'Artus',
    slug: 'artus', // URL => /products/artus
    productDescription:
      'Artus offers the perfect blend of creativity and elegance for your spatial design. With its textile-inspired patterns and a palette of trendy tones, Artus is the ideal complement to any creative concept. Its versatile design and loop pile texture enhances spaces with a unique artistic flair, making it the go-to choice for those seeking to express their vision in bold and stylish ways. The colour palette spans warm, vibrant shades, transitioning seamlessly into darker neutrals and cooler tones, creating a balanced, earthy feel.',
    applications: ['Entrance', 'Common & high traffic areas'],
    materials: ['Carpet'],
    patterns: ['Textured'],
    shades: ['Neutral'],
    features: ['Durable', 'Recyclable'],
    price: '$$',
    env: ['GreenTag'],
    shapes: ['Squares'],
    image: '/brand/modulyss/products/artus.webp',
    variants: [
      { name: 'Artus 280', image: '/brand/modulyss/products/artus/variants/artus-280.webp', swatch: '#B78A64' },
      { name: 'Artus 346', image: '/brand/modulyss/products/artus/variants/artus-346.webp', swatch: '#8B3A3A' },
      { name: 'Artus 517', image: '/brand/modulyss/products/artus/variants/artus-517.webp', swatch: '#8FA0AE' },
      { name: 'Artus 577', image: '/brand/modulyss/products/artus/variants/artus-577.webp', swatch: '#5C6D7A' },
      { name: 'Artus 592', image: '/brand/modulyss/products/artus/variants/artus-592.webp', swatch: '#2D3A4B' },
      { name: 'Artus 626', image: '/brand/modulyss/products/artus/variants/artus-626.webp', swatch: '#2F4F3E' },
      { name: 'Artus 848', image: '/brand/modulyss/products/artus/variants/artus-848.webp', swatch: '#9A8776' },
      { name: 'Artus 908', image: '/brand/modulyss/products/artus/variants/artus-908.webp', swatch: '#BFC6CC' },
      { name: 'Artus 957', image: '/brand/modulyss/products/artus/variants/artus-957.webp', swatch: '#7D8488' },
      { name: 'Artus 968', image: '/brand/modulyss/products/artus/variants/artus-968.webp', swatch: '#D2D4D3' },
      { name: 'Artus 989', image: '/brand/modulyss/products/artus/variants/artus-989.webp', swatch: '#5A5A5A' },
      { name: 'Artus 991', image: '/brand/modulyss/products/artus/variants/artus-991.webp', swatch: '#2F3131' }
    ],
    roomshots: [
      '/brand/modulyss/products/artus/roomshots/room-1.webp',
      '/brand/modulyss/products/artus/roomshots/room-2.webp',
      '/brand/modulyss/products/artus/roomshots/room-3.webp',
      '/brand/modulyss/products/artus/roomshots/room-4.webp',
      '/brand/modulyss/products/artus/roomshots/room-5.webp',
      '/brand/modulyss/products/artus/roomshots/room-6.webp'
    ]
  },
  {
    id: 2,
    brand: 'Modulyss',
    title: 'Cambridge&',
    slug: 'cambridge', // URL => /products/artus
    productDescription:
      'Cambridge& offers a versatile, loop-pile texture and a refined palette designed to blend creativity with elegance in contemporary interiors.',
    applications: ['Entrance', 'Common & high traffic areas'],
    materials: ['Carpet'],
    patterns: ['Textured'],
    shades: ['Neutral'],
    features: ['Durable', 'Recyclable'],
    price: '$$',
    env: ['GreenTag'],
    shapes: ['Squares'],
    image: '/brand/modulyss/products/cambridge.webp',
    variants: [
      { name: 'Cambridge& 181', image: '/brand/modulyss/products/cambridge/variants/cambdridge-181.webp', swatch: '#B78A64' },
      { name: 'Cambridge& 213', image: '/brand/modulyss/products/cambridge/variants/cambdridge-213.webp', swatch: '#8B3A3A' },
      { name: 'Cambridge& 224', image: '/brand/modulyss/products/cambridge/variants/cambdridge-224.webp', swatch: '#8FA0AE' },
      { name: 'Cambridge& 303', image: '/brand/modulyss/products/cambridge/variants/cambdridge-303.webp', swatch: '#5C6D7A' },
      { name: 'Cambridge& 307', image: '/brand/modulyss/products/cambridge/variants/cambdridge-307.webp', swatch: '#2D3A4B' },
      { name: 'Cambridge& 314', image: '/brand/modulyss/products/cambridge/variants/cambdridge-314.webp', swatch: '#2F4F3E' },
      { name: 'Cambridge& 316', image: '/brand/modulyss/products/cambridge/variants/cambdridge-316.webp', swatch: '#9A8776' },
      { name: 'Cambridge& 322', image: '/brand/modulyss/products/cambridge/variants/cambdridge-322.webp', swatch: '#BFC6CC' },
      { name: 'Cambridge& 346', image: '/brand/modulyss/products/cambridge/variants/cambdridge-346.webp', swatch: '#7D8488' },
      { name: 'Cambridge& 386', image: '/brand/modulyss/products/cambridge/variants/cambdridge-386.webp', swatch: '#D2D4D3' },
      { name: 'Cambridge& 463', image: '/brand/modulyss/products/cambridge/variants/cambdridge-463.webp', swatch: '#5A5A5A' },
      { name: 'Cambridge& 482', image: '/brand/modulyss/products/cambridge/variants/cambdridge-482.webp', swatch: '#2F3131' },
      { name: 'Cambridge& 504', image: '/brand/modulyss/products/cambridge/variants/cambdridge-504.webp', swatch: '#B78A64' },
      { name: 'Cambridge& 506', image: '/brand/modulyss/products/cambridge/variants/cambdridge-506.webp', swatch: '#8B3A3A' },
      { name: 'Cambridge& 511', image: '/brand/modulyss/products/cambridge/variants/cambdridge-511.webp', swatch: '#8FA0AE' },
      { name: 'Cambridge& 553', image: '/brand/modulyss/products/cambridge/variants/cambdridge-553.webp', swatch: '#5C6D7A' },
      { name: 'Cambridge& 569', image: '/brand/modulyss/products/cambridge/variants/cambdridge-569.webp', swatch: '#2D3A4B' },
      { name: 'Cambridge& 579', image: '/brand/modulyss/products/cambridge/variants/cambdridge-579.webp', swatch: '#2F4F3E' },
      { name: 'Cambridge& 592', image: '/brand/modulyss/products/cambridge/variants/cambdridge-592.webp', swatch: '#9A8776' },
      { name: 'Cambridge& 595', image: '/brand/modulyss/products/cambridge/variants/cambdridge-595.webp', swatch: '#BFC6CC' },
      { name: 'Cambridge& 601', image: '/brand/modulyss/products/cambridge/variants/cambdridge-601.webp', swatch: '#7D8488' },
      { name: 'Cambridge& 613', image: '/brand/modulyss/products/cambridge/variants/cambdridge-613.webp', swatch: '#D2D4D3' },
      { name: 'Cambridge& 662', image: '/brand/modulyss/products/cambridge/variants/cambdridge-662.webp', swatch: '#5A5A5A' },
      { name: 'Cambridge& 684', image: '/brand/modulyss/products/cambridge/variants/cambdridge-684.webp', swatch: '#2F3131' },
      { name: 'Cambridge& 817', image: '/brand/modulyss/products/cambridge/variants/cambdridge-817.webp', swatch: '#B78A64' },
      { name: 'Cambridge& 822', image: '/brand/modulyss/products/cambridge/variants/cambdridge-822.webp', swatch: '#8B3A3A' },
      { name: 'Cambridge& 823', image: '/brand/modulyss/products/cambridge/variants/cambdridge-823.webp', swatch: '#8FA0AE' },
      { name: 'Cambridge& 830', image: '/brand/modulyss/products/cambridge/variants/cambdridge-830.webp', swatch: '#5C6D7A' },
      { name: 'Cambridge& 907', image: '/brand/modulyss/products/cambridge/variants/cambdridge-907.webp', swatch: '#2D3A4B' },
      { name: 'Cambridge& 915', image: '/brand/modulyss/products/cambridge/variants/cambdridge-915.webp', swatch: '#2F4F3E' },
      { name: 'Cambridge& 963', image: '/brand/modulyss/products/cambridge/variants/cambdridge-963.webp', swatch: '#9A8776' },
      { name: 'Cambridge& 965', image: '/brand/modulyss/products/cambridge/variants/cambdridge-965.webp', swatch: '#BFC6CC' },
      { name: 'Cambridge& 991', image: '/brand/modulyss/products/cambridge/variants/cambdridge-991.webp', swatch: '#7D8488' },
      { name: 'Cambridge& 994', image: '/brand/modulyss/products/cambridge/variants/cambdridge-994.webp', swatch: '#D2D4D3' }
    ],
    roomshots: [
      '/brand/modulyss/products/cambridge/roomshots/room-1.webp',
      '/brand/modulyss/products/cambridge/roomshots/room-2.webp',
      '/brand/modulyss/products/cambridge/roomshots/room-3.webp',
      '/brand/modulyss/products/cambridge/roomshots/room-4.webp',
      '/brand/modulyss/products/cambridge/roomshots/room-5.webp',
      '/brand/modulyss/products/cambridge/roomshots/room-3.webp'
    ]
  }

  // ---------------- Add the remaining 56 products below ----------------
  // Example scaffold (copy & customize):
  // {
  //   id: 2,
  //   brand: 'Modulyss',
  //   title: 'Cambridge&',
  //   slug: 'cambridge-and',
  //   productDescription: 'Cambridge& is a very nice product.',
  //   applications: ['Common & high traffic areas', 'Service areas'],
  //   materials: ['Carpet'],
  //   patterns: ['Linear'],
  //   shades: ['Light'],
  //   features: ['Quick Ship', 'Modular'],
  //   price: '$$',
  //   env: ['Declare'],
  //   shapes: ['Squares'],
  //   image: '/brand/modulyss/products/cambridge.webp',
  //   variants: [
  //     { name: 'Cambridge& 101', image: '/path/to.webp', swatch: '#cccccc' },
  //   ],
  //   roomshots: [
  //     '/path/to/room-1.webp',
  //   ],
  // },
];

export default CATALOG;