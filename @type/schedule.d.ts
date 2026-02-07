export interface ApiResponse<T = any> {
  data?: T
  message?: string
  status?: number
  success?: boolean
  total?: number
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderDetail {
  id: string
  order_id: string
  start_point?: string
  address_detail?: string
  area_code?: string
  priority_score?: number
  status: string
  location?: {
    lat?: number
    lng?: number
    longitude?: number
    latitude?: number
  }
}

export interface OrdersByArea {
  [area_code: string]: {
    area_code: string
    total_orders: number
    orders: OrderDetail[]
  }
}

export interface OrdersGroupedResponse {
  success: boolean
  total_areas: number
  total_orders: number
  data: OrdersByArea
}

// ============================================================================
// SCHEDULE TYPES
// ============================================================================

export interface Schedule {
  id: string
  driver_id: string | null
  driver_name?: string | null
  driver_phone?: string | null
  scheduled_date: string
  area_code: string
  status: ScheduleStatus
  total_orders: number
  completed_orders: number
  failed_orders: number
  post_office_id: string
  created_at: string
}

export type ScheduleStatus = 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

export interface ScheduleItem {
  id: string
  schedule_id: string
  order_detail_id: string
  status: ScheduleItemStatus
  queue: number
  delivered_at?: string | null
  failure_reason?: string | null
  order_detail?: OrderDetail
}

export type ScheduleItemStatus = 'pending' | 'in_progress' | 'delivered' | 'failed'

export interface ScheduleDetail extends Schedule {
  items: ScheduleItem[]
  estimated_distance_km?: number
  estimated_time_hours?: number
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface GetOrdersRequest {
  post_office_id: string
  status?: string
}

export interface GetOrdersByAreaRequest {
  post_office_id: string
  area_code: string
  status?: string
}

export interface CreateScheduleRequest {
  post_office_id: string
  scheduled_date: string
  area_codes: string[]
  max_orders_per_schedule?: number
  max_distance_km?: number
  population_size?: number
  generations?: number
  mutation_rate?: number
  crossover_rate?: number
  elite_size?: number
}

export interface CreateScheduleQuickRequest {
  post_office_id: string
  scheduled_date: string
  area_codes: string[]
}

export interface AssignDriverRequest {
  driver_id: string
}

export interface UpdateScheduleStatusRequest {
  status: ScheduleStatus
}

export interface CancelScheduleRequest {
  reason?: string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface SchedulingResponse {
  success: boolean
  message: string
  total_orders_processed: number
  total_schedules_created: number
  best_fitness_score?: number
  generations_run?: number
  schedules: ScheduleResponse[]
  unassigned_order_ids: string[]
  warnings: string[]
}

export interface ScheduleResponse {
  id: string
  area_code: string
  scheduled_date: string
  status: ScheduleStatus
  total_orders: number
  total_distance_km?: number
  items: ScheduleItemResponse[]
  driver_id?: string | null
  driver_name?: string | null
}

export interface ScheduleItemResponse {
  id: string
  order_detail_id: string
  sequence_number: number
  address?: string
  area_code?: string
  priority_score?: number
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface ScheduleStatistics {
  total_schedules: number
  draft_schedules: number
  confirmed_schedules: number
  in_progress_schedules: number
  completed_schedules: number
  cancelled_schedules: number
  total_orders: number
  completed_orders: number
  failed_orders: number
}

export interface OrderStatisticsByArea {
  total_areas: number
  total_pending_orders: number
  areas: {
    area_code: string
    total_orders: number
    orders: OrderDetail[]
  }[]
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ScheduleFilters {
  post_office_id?: string
  scheduled_date?: string
  status?: ScheduleStatus
  area_code?: string
  driver_id?: string
  skip?: number
  limit?: number
}

export interface OrderFilters {
  post_office_id: string
  status?: string
  area_code?: string
}

export interface DeleteScheduleResponse {
  success: boolean
  message: string
}