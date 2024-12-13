// https://nuxt.com/docs/api/configuration/nuxt-config
import path from 'path';

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxt-icon',
    '@vueuse/nuxt',
    'nuxt-headlessui',
    '@morev/vue-transitions/nuxt',
    'shadcn-nuxt',
    '@pinia/nuxt',
    'nuxt-auth-utils',
  ],
  tailwindcss: { exposeConfig: true },
  headlessui: { prefix: 'H' },
  typescript: { shim: false },
  app: {
    head: {
      title: 'Analytics',
      link: [
        // Favicon
        { rel: 'icon', type: 'image/x-icon', href: '/logoipsum-298.svg' },
        //Inter font
        { rel: 'stylesheet', href: 'https://rsms.me/inter/inter.css' },
        { rel: 'preconnect', href: 'https://rsms.me/' },
      ],
    },
  },
  // ssr : true is needed for nuxt-auth-utils module
  ssr: true, // disable ssr mode, you cannot use nuxt generate
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  vite: {
    server: {
      hmr: {
        overlay: false,
      },
    },
  },
  nitro: {
    output: {
      publicDir: path.join(__dirname, 'dist')
    }
  },
  runtimeConfig: {
    public: {
      POLYGON_API_KEY: process.env.POLYGON_API_KEY
    }
  },
  css: [
    '@progress/kendo-theme-default/dist/all.css'
  ],
  build: {
    transpile: [
      '@progress/kendo-vue-grid',
      '@progress/kendo-vue-data-tools',
      '@progress/kendo-vue-inputs',
      '@progress/kendo-vue-intl',
      '@progress/kendo-vue-dropdowns',
      '@progress/kendo-vue-dateinputs',
      '@progress/kendo-data-query',
      '@progress/kendo-drawing',
      '@progress/kendo-vue-animation',
      '@progress/kendo-vue-indicators',
      '@progress/kendo-vue-common',
      '@progress/kendo-licensing'
    ]
  }
});
