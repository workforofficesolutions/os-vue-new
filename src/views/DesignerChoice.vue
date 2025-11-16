<template>
  <main
    class="w-full max-w-none px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 pb-16"
    style="padding-top: calc(var(--header-height,72px) + var(--header-gap,32px))"
  >
    <!-- HERO / INTRO -->
    <section class="max-w-4xl mx-auto text-center mb-10 sm:mb-12 md:mb-16">
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight mb-4">
        Designers' Choice
      </h1>
      <div class="w-12 h-px bg-neutral-700 mx-auto mb-6"></div>
      <p class="mx-auto max-w-2xl text-[0.95rem] sm:text-base md:text-lg leading-relaxed text-neutral-800 text-center">
        Our design team has done the hard work for you, experimenting with textures, tones and patterns
        from our
        <span class="underline">
          Signature collection
        </span>
        to create a sophisticated and ready-to-use array of pre-designed floors. Simply choose the perfect
        laying pattern, then pick from one of our beautiful colour combinations to find the one that’s
        right for your space.
      </p>
    </section>

    <!-- PATTERN GRID -->
    <section class="w-full mx-auto mb-16 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8">
      <div
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-6 gap-y-10 sm:gap-x-8 sm:gap-y-12 lg:gap-x-10 lg:gap-y-14"
      >
        <article
          v-for="pattern in patterns"
          :key="pattern.title"
          class="group text-center cursor-default"
        >
          <div class="block">
            <div class="relative w-full pt-[100%] border border-neutral-200 bg-white overflow-hidden">
              <img
                :src="pattern.image"
                :alt="pattern.alt"
                class="absolute inset-0 w-full h-full object-cover block transition-opacity duration-300 group-hover:opacity-0"
                loading="lazy"
              />
              <img
                :src="pattern.hoverImage"
                :alt="pattern.hoverAlt || pattern.alt"
                class="absolute inset-0 w-full h-full object-cover block opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                loading="lazy"
              />
            </div>
            <p class="mt-3 text-base md:text-lg font-semibold text-neutral-900">
              {{ pattern.title }}
            </p>
          </div>
        </article>
      </div>
    </section>

    <!-- FIND A RETAILER / CTA -->
    <section class="max-w-5xl mx-auto text-center border-t border-neutral-200 pt-10 sm:pt-12 md:pt-16">

      <div class="mt-10 sm:mt-12">
        <img
          src="/designers-choice/street-illustration.svg"
          alt="Amtico Retailers illustration"
          class="mx-auto max-w-full h-auto"
          loading="lazy"
        />
      </div>
    </section>
  </main>
</template>

<script setup>
const patterns = [
  {
    title: 'Parquet',
    image: '/designers-choice/parquet.jpg',
    hoverImage: '/designers-choice/parquet-abstract.jpg',
    alt: 'Parquet laying pattern',
    hoverAlt: 'Parquet laying pattern abstract view'
  },
  {
    title: 'Versailles Parquet',
    image: '/designers-choice/versailles.jpg',
    hoverImage: '/designers-choice/versailles-abstract.jpeg',
    alt: 'Versailles parquet pattern',
    hoverAlt: 'Versailles parquet abstract view'
  },
  {
    title: 'Gable Parquet',
    image: '/designers-choice/gable.jpg',
    hoverImage: '/designers-choice/gable-abstract.jpeg',
    alt: 'Gable parquet pattern',
    hoverAlt: 'Gable parquet abstract view'
  },
  {
    title: 'Chevron',
    image: '/designers-choice/chevron.jpg',
    hoverImage: '/designers-choice/chevron-abstract.jpeg',
    alt: 'Chevron laying pattern',
    hoverAlt: 'Chevron pattern abstract view'
  },
  {
    title: 'French Weave',
    image: '/designers-choice/french.jpg',
    hoverImage: '/designers-choice/french-abstract.jpg',
    alt: 'French Weave laying pattern',
    hoverAlt: 'French Weave abstract view'
  },
  {
    title: 'Basket Weave',
    image: '/designers-choice/basket.jpg',
    hoverImage: '/designers-choice/basket-abstract.jpg',
    alt: 'Basket Weave laying pattern',
    hoverAlt: 'Basket Weave abstract view'
  },
  {
    title: 'Castel Weave',
    image: '/designers-choice/castel.jpg',
    hoverImage: '/designers-choice/castel-abstract.jpg',
    alt: 'Castel Weave laying pattern',
    hoverAlt: 'Castel Weave abstract view'
  },
  {
    title: 'Chantilly Weave',
    image: '/designers-choice/chantilly.jpg',
    hoverImage: '/designers-choice/chantilly-abstract.jpeg',
    alt: 'Chantilly Weave laying pattern',
    hoverAlt: 'Chantilly Weave abstract view'
  },
  {
    title: 'Pleat',
    image: '/designers-choice/pleat.jpg',
    hoverImage: '/designers-choice/pleat-abstract.jpg',
    alt: 'Pleat laying pattern',
    hoverAlt: 'Pleat pattern abstract view'
  },
  {
    title: 'Halcyon Pleat',
    image: '/designers-choice/halcyon.jpg',
    hoverImage: '/designers-choice/halcyon-abstract.jpg',
    alt: 'Halcyon Pleat laying pattern',
    hoverAlt: 'Halcyon Pleat abstract view'
  },
  {
    title: 'Flagstone',
    image: '/designers-choice/flagstone.jpg',
    hoverImage: '/designers-choice/flagstone-abstract.jpg',
    alt: 'Flagstone laying pattern',
    hoverAlt: 'Flagstone abstract view'
  },
  {
    title: 'Frame',
    image: '/designers-choice/frame.jpg',
    hoverImage: '/designers-choice/frame-abstract.jpg',
    alt: 'Frame laying pattern',
    hoverAlt: 'Frame pattern abstract view'
  },
  {
    title: 'Random Stone',
    image: '/designers-choice/random-stone.jpg',
    hoverImage: '/designers-choice/random-stone-abstract.jpg',
    alt: 'Random Stone laying pattern',
    hoverAlt: 'Random Stone abstract view'
  },
  {
    title: 'Key Stone',
    image: '/designers-choice/keystone.jpg',
    hoverImage: '/designers-choice/keystone-abstract.jpg',
    alt: 'Key Stone laying pattern',
    hoverAlt: 'Key Stone abstract view'
  },
  {
    title: 'Polygon Key',
    image: '/designers-choice/polygon.jpg',
    hoverImage: '/designers-choice/polygon-abstract.jpg',
    alt: 'Polygon Key laying pattern',
    hoverAlt: 'Polygon Key abstract view'
  },
  {
    title: 'Check',
    image: '/designers-choice/check.jpg',
    hoverImage: '/designers-choice/check-abstract.jpg',
    alt: 'Check laying pattern',
    hoverAlt: 'Check pattern abstract view'
  },
  {
    title: 'Gatsby Square',
    image: '/designers-choice/gatsby.jpg',
    hoverImage: '/designers-choice/gatsby-abstract.jpeg',
    alt: 'Gatsby Square laying pattern',
    hoverAlt: 'Gatsby Square abstract view'
  },
  {
    title: 'Arc',
    image: '/designers-choice/arc.jpg',
    hoverImage: '/designers-choice/arc-abstract.jpeg',
    alt: 'Arc laying pattern',
    hoverAlt: 'Arc pattern abstract view'
  },
  {
    title: 'Lune',
    image: '/designers-choice/lune.jpg',
    hoverImage: '/designers-choice/lune-abstract.jpeg',
    alt: 'Lune laying pattern',
    hoverAlt: 'Lune pattern abstract view'
  },
  {
    title: 'Random Plank',
    image: '/designers-choice/random-plank.jpg',
    hoverImage: '/designers-choice/random-plank-abstract.png',
    alt: 'Random Plank laying pattern',
    hoverAlt: 'Random Plank abstract view'
  }
]
</script>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>