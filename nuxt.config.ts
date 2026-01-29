export default defineNuxtConfig({
  ssr: false,

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
        vapidKey: process.env.FIREBASE_VAPID_KEY
      
    },
  },

  compatibilityDate: '2025-07-15',

  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css'
  ],

  devtools: { enabled: true },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: ['@nuxtjs/tailwindcss'],

  // ============================================
  // FIX WEBSOCKET HMR ERROR
  // ============================================
  vite: {
    server: {
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 3001,
        clientPort: 3001,
      },
    },
  },

  // ============================================
  // DEV SERVER CONFIG
  // ============================================
  devServer: {
    port: 3001,
    host: 'localhost',
  },
})