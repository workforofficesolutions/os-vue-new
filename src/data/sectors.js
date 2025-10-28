// src/data/sectors.js

// small, predictable slugify so URLs match your nav links
export const slugify = (s) =>
    String(s)
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

const SECTORS = [
    {
        title: 'Workplace',
        slug: 'workplace',
        image: '/block4/block4-workplace.jpg',
        heroAlt: 'Workplace hero',
        blurb:
            'Comfortable, durable flooring designed for productivity, with a wide range of colour and pattern to create unique spaces.',
        pos: '50% 50%',
        designer: {
            name: 'Emily Bolam',
            role: 'Designer on BDO Office',
            quote:
                '...the tiles provide warmth and sophistication with a splash of colour.',
        },
        expert: {
            name: 'Pamela Parsons',
            role: 'Architectural Consultant',
            phone: '+64 21 240 8592',
            email: 'pamela@advanceflooring.co.nz',
            photo: '/sectors/experts/pamela-parsons.jpg',
        },
    },

    // Feel free to change names/quotes/photos — keeping structure identical:
    {
        title: 'Education',
        slug: 'education',
        image: '/block4/block4-education.jpg',
        heroAlt: 'Education hero',
        blurb:
            'Robust, acoustic and easy-care finishes for learning environments.',
        pos: '50% 50%',
        designer: {
            name: 'Alex Williams',
            role: 'Campus Interiors',
            quote: 'Durability without compromising warmth was our brief.',
        },
        expert: {
            name: 'Priya Nair',
            role: 'Sector Specialist',
            phone: '+64 21 000 0000',
            email: 'priya@example.com',
            photo: '/sectors/experts/priya-nair.jpg',
        },
    },
    {
        title: 'Healthcare',
        slug: 'healthcare',
        image: '/block4/block4-healthcare.jpg',
        heroAlt: 'Healthcare hero',
        blurb:
            'Hygienic, cleanable and resilient solutions for clinical settings.',
        pos: '40% 50%',
        designer: {
            name: 'Dr. Kate Miller',
            role: 'Healthcare Planner',
            quote: 'Cleanability and comfort need to co-exist in care spaces.',
        },
        expert: {
            name: 'Sam Lee',
            role: 'Sector Specialist',
            phone: '+64 21 111 1111',
            email: 'sam@example.com',
            photo: '/sectors/experts/sam-lee.jpg',
        },
    },
    {
        title: 'Public buildings',
        slug: 'public-buildings',
        image: '/block4/block4-publicbuildings.jpg',
        heroAlt: 'Public buildings hero',
        blurb: 'Hard-wearing finishes for civic and community spaces.',
        designer: { name: 'Team Lead', role: 'Civic Studio', quote: 'Built to last.' },
        expert: {
            name: 'Jordan Reid',
            role: 'Sector Specialist',
            phone: '+64 21 222 2222',
            email: 'jordan@example.com',
            photo: '/sectors/experts/jordan-reid.jpg',
        },
    },
    {
        title: 'Aged care',
        slug: 'aged-care',
        image: '/block4/block4-agedcare.jpg',
        heroAlt: 'Aged care hero',
        blurb:
            'Comfort, safety and dignity with practical maintenance in mind.',
        designer: { name: 'Mia Collins', role: 'Care Designer', quote: 'Calm and safe.' },
        expert: {
            name: 'Helen Carter',
            role: 'Sector Specialist',
            phone: '+64 21 333 3333',
            email: 'helen@example.com',
            photo: '/sectors/experts/helen-carter.jpg',
        },
    },
    {
        title: 'Shopping & showrooms',
        slug: 'shopping-and-showrooms',
        image: '/block4/block4-shopping.jpg',
        heroAlt: 'Retail hero',
        blurb: 'Brand-forward surfaces that stand up to traffic and look great.',
        designer: { name: 'Marco Silva', role: 'Retail Lead', quote: 'Make it pop.' },
        expert: {
            name: 'Chris Wong',
            role: 'Sector Specialist',
            phone: '+64 21 444 4444',
            email: 'chris@example.com',
            photo: '/sectors/experts/chris-wong.jpg',
        },
    },
    {
        title: 'Sport',
        slug: 'sport',
        image: '/block4/block4-sport.jpg',
        heroAlt: 'Sport hero',
        blurb: 'Performance underfoot with shock absorption and durability.',
        designer: { name: 'A. Patel', role: 'Sports Architect', quote: 'Built to move.' },
        expert: {
            name: 'Olivia Green',
            role: 'Sector Specialist',
            phone: '+64 21 555 5555',
            email: 'olivia@example.com',
            photo: '/sectors/experts/olivia-green.jpg',
        },
    },
];

export default SECTORS;
export const findSectorBySlug = (slug) =>
    SECTORS.find((s) => (s.slug || slugify(s.title)) === slug);