export interface GeoPoint {
  lat: number
  lng: number
}

export interface PostOffice {
  id: string
  code: string
  name: string
  address: string
  ward: string | null
  district: string | null
  province: string | null
  area_codes: string[]
  phone: string | null
  email: string | null
  open_time: string
  close_time: string
  working_days: string
  manager_id: string | null
  status: string
  location: GeoPoint | null
}

// Backend response có location là object, không phải string!
export interface PostOfficeResponse {
  id: string
  code: string
  name: string
  address: string
  ward: string | null
  district: string | null
  province: string | null
  area_codes: string[]
  phone: string | null
  email: string | null
  open_time: string
  close_time: string
  working_days: string
  manager_id: string | null
  status: string
  location: GeoPoint | null // 
}