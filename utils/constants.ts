export const API_CONFIG={
BASE_URL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
API_VERSION: 'api/v1',
timeout:3000,
}

export const API_ENDPOINTS={
   LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
  RESET_PASSWORD: '/api/v1/auth/reset-password',
}

/// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'admin',
}