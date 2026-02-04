export interface GeoPoint {
  lat: number
  lng: number
}

export interface OrderSummary{
  id:string 
  pickup_point:string
  status:'pending' | 'comfirmed' | 'processing' | 'completed' | 'cancelled'
  created_at:string
  pickup_status:'pending' | 'scheduled' | 'picked' | 'failed'
  total_packages:number
}

export interface OrderDetail{
  id:string 
  order_id:string 
  start_point:string | null
  address_detail:string
  area_code:string | null
  status:string
  priority_score:number | null
  note_send:string | null
  recipient_id:string |null
}

export interface Order {
  id: string
  user_id: string
  post_office_id: string
  pickup_point: string
  pickup_address: string
  pickup_area_code: string | null
  pickup_phone: string
  pickup_note: string | null
  status: string
  order_type: string
  created_at: string
  total_packages: number
  delivered_packages: number
  failed_packages: number
  order_details: OrderDetail[]
}
export interface OrderDetailCreateDTO {
  start_point: string
  address_detail: string
  area_code: string
  location?: GeoPoint
  priority_score?: number
  recipient_id: string
  note?: string
}

export interface OrderCreateDTO {
  user_id: string
  post_office_id: string
  pickup_point: string
  pickup_address: string
  pickup_area_code: string
  pickup_location?: GeoPoint
  pickup_phone: string
  pickup_note?: string
  note_send?: string
  order_type: 'drop_off' | 'pickup'
  order_details: OrderDetailCreateDTO[]
}

export interface OrderDetailResponse {
  id: string
  order_id: string
  start_point: string
  address_detail: string
  area_code: string
  status: 'pending' | 'confirmed' | 'picking' | 'picked_up' | 'delivering' | 'completed' | 'cancelled'
  location?: GeoPoint
  priority_score: number
  recipient_id: string
  note?: string
  create_at?: string
  confirmed_at?: string
  finish_at?: string
}

export interface OrderResponse {
  id: string
  user_id: string
  post_office_id: string
  pickup_point: string
  pickup_address: string
  pickup_area_code: string
  pickup_location?: GeoPoint
  pickup_phone: string
  pickup_note?: string
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  order_type: 'drop_off' | 'pickup'
  created_at: string
  order_details: OrderDetailResponse[]
}