// https://nuxt.com/docs/api/configuration/nuxt-config
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
  typescript: {shim: false},
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
        }
    }
}
});
