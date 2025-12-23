export const slugify = (s) =>
    s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

export const caseStudies = [
    {
        title: 'Mohammed Bin Rashid Housing Establishment (MBRHE) Office, Dubai',
        sector: 'Corporate',
        subSector: 'Government/Semi-government',
        image: '/home/Block05-01.webp',
        material: '/cases/te-kura-material.avif',
        largeShape: 'cut-tl',
        smallShape: 'circle',
    },
    {
        title: 'Office Square – Nation Towers, Abu Dhabi',
        sector: 'Corporate',
        subSector: 'Co-working/Commercial',
        image: '/home/Block05-02.webp',
        material: '/cases/anderson-material.avif',
        largeShape: 'cut-br',
        smallShape: 'square',
        detail: {
            hero: {
                title: 'Office Square – Nation Towers, Abu Dhabi',
                subSector: 'Co-working/Commercial',
                sector: 'Corporate',
                // Using the same image for now; replace later if you have a dedicated hero.
                heroImage: '/home/Block05-02.webp',
            },
            overview: {
                heading: 'Project Overview',
                intro:
                    'Office Square at Nation Towers Mall in Abu Dhabi represents a new benchmark in coworking environments. Building on the earlier success of the Al Dar Headquarters branch, the project reinforces the client’s vision of providing modern and adaptable workplaces. Spanning a prominent location within the prestigious Nation Towers Mall, the space combines luxury with functionality to cater to a diverse community of professionals. The design brief focused on encouraging collaboration while maintaining an atmosphere of sophistication, resulting in a workspace that aligns design intent with execution.',
                meta: {
                    client: 'Office Square',
                    designFirm: 'JTCPL Designs',
                    completed: 'November 2024',
                    size: '28,000 sq ft',
                    location: 'Abu Dhabi',
                },
            },
            flooring: {
                heading: 'Flooring Solution Provided',
                body:
                    'We supplied flooring solutions that reinforced the prestige of the Nation Towers address while meeting the functional needs of a high-traffic coworking environment. Standard carpet tiles were selected for their durability, refined textures, and broad palette, enabling seamless zoning across the 28,000 sq ft space. They also improved acoustic comfort in collaborative and focused areas, while offering ease of maintenance for a multi-tenant facility. Their modular format supported efficient installation and long-term flexibility for future layout adjustments—elevating the interior while supporting day-to-day performance.',
                productsUsed: ['Standard Carpets'],
                flooringMaterial: 'Carpet Tiles',
                brands: [],
            },
            challenges: {
                heading: 'Project Challenges and Our Approach',
                body:
                    'The project required balancing the prestige of the location with the practical demands of a coworking environment. The key challenge was delivering a workspace that reflected the luxury of Nation Towers while ensuring durability and cost efficiency for daily use. With diverse tenants in mind, the design needed to support both collaboration and focused work without compromising aesthetics. We addressed these requirements by recommending flooring systems that ensured a uniform and refined appearance suitable for a high-traffic commercial space. The chosen materials achieved visual continuity and long-term performance, aligning with the design intent of sophistication and comfort.',
            },
            outcomes: {
                heading: 'Impacts & benefits',
                bullets: [
                    'Established a refined surface that enhanced the luxury positioning of Nation Towers.',
                    'Delivered acoustic balance for collaboration zones and private work areas through carpet tile performance.',
                    'Provided durability to withstand daily movement and high footfall across a large coworking facility.',
                    'Enabled design flexibility with modular carpet tiles that support future layout changes.',
                    'Offers ease of upkeep and long-term value for a multi-tenant environment.',
                    'Reinforced a professional yet welcoming atmosphere consistent with the client’s brand vision.',
                ],
            },
            gallery: {
                heading: 'Image Gallery',
                images: [],
            },
            closingCta:
                'This project is one of many examples of our expertise in shaping workspaces that balance aesthetic vision with practical performance. Explore more of our case studies to learn how we support a diverse range of projects.',
        },
    },
    {
        title: 'AtkinsRéalis Headquarters, Dubai',
        sector: 'Corporate',
        subSector: 'Construction/Engineering',
        image: '/home/Block05-03.webp',
        material: '/cases/motueka-material.avif',
        largeShape: 'cut-tr',
        smallShape: 'circle',
    },
    {
        title: 'ADQ Office, Etihad Airways Centre, Abu Dhabi',
        sector: 'Corporate',
        subSector: 'Bank/ Financial/ Investments',
        image: '/home/Block05-04.webp',
        material: '/cases/takina-convention-material.avif',
        largeShape: 'cut-bl',
        smallShape: 'square',
    },
    {
        title: 'DWF Office, Dubai',
        sector: 'Corporate',
        subSector: 'Consulting/ Business Services',
        image: '/home/Block05-05.webp',
        material: '/cases/te-waka-material.avif',
        largeShape: 'cut-tr',
        smallShape: 'circle',
    },
    {
        title: 'Exinity Office, One Central, Dubai',
        sector: 'Corporate',
        subSector: 'Bank/ Financial/ Investments',
        image: '/home/Block05-01.webp',
        material: '/cases/anderson-material.avif',
        largeShape: 'cut-br',
        smallShape: 'square',
    },
    {
        title: 'Kasumigaseki Capital Office, Dubai',
        sector: 'Corporate',
        subSector: 'Bank/ Financial/ Investments',
        image: '/home/Block05-02.webp',
        material: '/cases/motueka-material.avif',
        largeShape: 'cut-tl',
        smallShape: 'circle',
    },
    {
        title: 'Odoo Middle East Office, Dubai',
        sector: 'Corporate',
        subSector: 'Hardware/ software development',
        image: '/home/Block05-03.webp',
        material: '/cases/takina-convention-material.avif',
        largeShape: 'cut-bl',
        smallShape: 'square',
    },
    {
        title: 'Yum! Brands KFC Office, Dubai',
        sector: 'Corporate',
        subSector: 'Food/ Beverage',
        image: '/home/Block05-04.webp',
        material: '/cases/te-waka-material.avif',
        largeShape: 'cut-tr',
        smallShape: 'circle',
    },
].map(p => ({ ...p, slug: slugify(p.title) }))

export const getCaseStudyBySlug = (slug) => caseStudies.find(p => p.slug === slug)
