export interface GeoPoint {
  lat: number
  lng: number
}

export interface User {
  id: string
  role: 'admin' | 'customer' | 'driver'
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  address_detail: string | null
  area_code: string | null
  location: GeoPoint | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
  fcm_token: string | null
  post_office_id:string | null
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  user: User
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
  fcm_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
  phone?: string
  address_detail?: string
  area_code?: string
  location?: GeoPoint
}

export interface UpdateProfileRequest {
  full_name?: string
  phone?: string
  avatar_url?: string
  address_detail?: string
  area_code?: string
  location?: GeoPoint
  fcm_token?: string
}

export interface ApiError {
  detail: string | { detail: string }
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}
export interface GeoPoint {
  lat: number
  lng: number
}
export interface SearchUser {
  id: string
  address_detail: string | null
  area_code: string | null
  location: GeoPoint | null 
}

export interface SearchUserResponse {
  id: string
  address_detail: string | null
  area_code: string | null
  location: string | null 
}