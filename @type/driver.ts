// @/@type/driver.d.ts

export interface Driver {
  id: string
  user_id: string
  name: string
  phone: string
  email?: string
  avatar_url?: string
  status: 'available' | 'busy' | 'offline'
  post_office_id: string
  vehicle_type?: string
  license_plate?: string
  current_location?: {
    latitude: number
    longitude: number
  }
  created_at?: string
  updated_at?: string
}

export interface DriverStats {
  total_deliveries: number
  completed_deliveries: number
  failed_deliveries: number
  rating: number
  on_time_rate: number
}