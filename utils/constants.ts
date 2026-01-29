export const API_CONFIG = {
  BASE_URL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
  API_VERSION: 'api/v1',
  timeout: 3000,
}

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
  UPDATE_PROFILE: '/api/v1/auth/me', // PATCH endpoint
  RESET_PASSWORD: '/api/v1/auth/reset-password',
  ORDERS:'/api/v1/orders',
  ORDER_DETAIL: (id: string) => `/api/v1/orders/${id}`,
  // endpoint user
  SEARCH_USER: (data: string) =>
    `/api/v1/auth/search?data=${encodeURIComponent(data)}`,
  //endpoint post_office
   POST_OFFICES: '/api/v1/post_offices',
  POST_OFFICE_BY_ID: (id: string) => `/api/v1/post_offices/${id}`,
  POST_OFFICES_BY_AREA: (areaCode: string) => `/api/v1/post_offices/area/${areaCode}`,
}

/// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'admin',
}