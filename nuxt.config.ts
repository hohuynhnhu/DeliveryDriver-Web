export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
  },

  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  modules: ['@nuxtjs/tailwindcss']
})