// @/@type/schedule.d.ts

export interface Schedule {
  id: string
  driver_id: string | null
  driver_name?: string | null
  scheduled_date: string
  area_code: string
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  total_orders: number
  completed_orders: number
  failed_orders: number
  post_office_id: string
  created_at: string
}

export interface ScheduleItem {
  id: string
  schedule_id: string
  order_detail_id: string
  status: 'pending' | 'in_progress' | 'delivered' | 'failed'
  queue: number
  delivered_at?: string | null
  failure_reason?: string | null
  order_detail?: {
    id: string
    start_point: string
    address_detail: string
    area_code: string
    priority_score: number
  }
}

export interface ScheduleDetail extends Schedule {
  items: ScheduleItem[]
  estimated_distance_km?: number
  estimated_time_hours?: number
}

export interface CreateScheduleRequest {
  post_office_id: string
  scheduled_date: string
  area_codes: string[]
  population_size?: number
  generations?: number
  mutation_rate?: number
  crossover_rate?: number
}

export interface AssignDriverRequest {
  driver_id: string
}

export interface ScheduleStatistics {
  total_schedules: number
  draft_schedules: number
  confirmed_schedules: number
  in_progress_schedules: number
  completed_schedules: number
}