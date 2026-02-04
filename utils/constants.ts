export const API_CONFIG = {
  BASE_URL: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8000',
  API_VERSION: 'api/v1',
  timeout: 3000,
}
const BASE_URL:string='/api/v1'

export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  ME: '/api/v1/auth/me',
  UPDATE_PROFILE: '/api/v1/auth/me', // PATCH endpoint
  RESET_PASSWORD: '/api/v1/auth/reset-password',

  //endpoint order
  ORDERS:'/api/v1/orders',
  ORDER_DETAIL: (id: string) => `/api/v1/orders/${id}`,
  ORDER_STATUS:(id:string)=>`${BASE_URL}/${id}/status`,
  ORDER_ASSIGN:(id:string)=>`${BASE_URL}/${id}/assign-driver`,
  ORDER_CANCEL:(id:string)=>`${BASE_URL}/${id}/cancel`,
  // endpoint user
  SEARCH_USER: (data: string) =>
    `/api/v1/auth/search?data=${encodeURIComponent(data)}`,
  //endpoint post_office
  POST_OFFICES: '/api/v1/post_offices',
  POST_OFFICE_BY_ID: (id: string) => `/api/v1/post_offices/${id}`,
  POST_OFFICES_BY_AREA: (areaCode: string) => `/api/v1/post_offices/area/${areaCode}`,

  //endpoint driver
  DRIVERS:`${BASE_URL}/drivers`,
  DRIVER_DETAIL:(id:string)=>`${BASE_URL}/drivers/${id}`,
  DRIVER_AVI:`${BASE_URL}/avilable`,

  //stats
  admin_overview:'/api/v1/admin/stats/overview',
  admin_chart:'/api/v1/admin/stats/orders-by-date',
}

/// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'admin',
  POST_OFFICE_ID:'POSTID'
}