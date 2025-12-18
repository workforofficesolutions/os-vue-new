export const slugify = (s) =>
    s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const caseStudies = [
    {
        title: 'Te Kura o Wairakei School',
        sector: 'Education',
        image: '/home/Block05-01.webp',
        material: '/cases/te-kura-material.avif',
        largeShape: 'cut-tl',
        smallShape: 'circle',
    },
    {
        title: 'Anderson Lloyd - Christchurch',
        sector: 'Workplace',
        image: '/home/Block05-02.webp',
        material: '/cases/anderson-material.avif',
        largeShape: 'cut-br',
        smallShape: 'square',
    },
    {
        title: 'Motueka High School',
        sector: 'Education',
        image: '/home/Block05-03.webp',
        material: '/cases/motueka-material.avif',
        largeShape: 'cut-tr',
        smallShape: 'circle',
    },
    {
        title: 'Lakeside Civic Centre',
        sector: 'Public',
        image: '/home/Block05-04.webp',
        material: '/cases/takina-convention-material.avif',
        largeShape: 'cut-bl',
        smallShape: 'square',
    },
    {
        title: 'Re:Form Studio',
        sector: 'Workplace',
        image: '/home/Block05-05.webp',
        material: '/cases/te-waka-material.avif',
        largeShape: 'cut-tr',
        smallShape: 'circle',
    },
    {
        title: 'Westbrook Library',
        sector: 'Public',
        image: '/cases/pic-peanut.avif',
        material: '/cases/te-waka-material.avif',
        largeShape: 'cut-br',
        smallShape: 'square',
    },
].map(p => ({ ...p, slug: slugify(p.title) }))

export const getCaseStudyBySlug = (slug) => caseStudies.find(p => p.slug === slug)
