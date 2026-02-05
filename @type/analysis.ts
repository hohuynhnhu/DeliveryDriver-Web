// @/@type/analysis.ts

/* =======================
 * NEW API Types
 * ======================= */

export interface LocationPair {
  pickup_location: string
  delivery_location: string
  support: number
  confidence: number
  lift: number
  total_orders: number
  prediction: string
  suggested_office_location?: string
}

export interface LocationPairsResponse {
  pairs: LocationPair[]
  total_pairs: number
  min_support: number
  timestamp: string
}

export interface PostOfficeSuggestion {
  location: string
  priority_level: 'very_high' | 'high' | 'medium' | 'low'
  priority_label: string
  total_orders: number
  avg_lift: number
  avg_confidence: number
  top_routes: Array<{
    from: string
    to: string
    lift: number
    confidence: number
  }>
  recommendation: string
}

export interface PostOfficeSuggestionsResponse {
  suggestions: PostOfficeSuggestion[]
  total_suggestions: number
  min_support: number
  timestamp: string
}

export interface LocationHotspot {
  location: string
  pickup_count: number
  delivery_count: number
  total_orders: number
  pickup_ratio: number
  delivery_ratio: number
  category: 'pickup_heavy' | 'delivery_heavy' | 'balanced'
}

export interface LocationHotspotsResponse {
  hotspots: LocationHotspot[]
  total_locations: number
  top_n: number
  timestamp: string
}

/* =======================
 * LEGACY API Types (giữ lại)
 * ======================= */

export interface RouteRule {
  from: string
  to: string
  support: number
  confidence: number
  lift: number
}

export interface RouteAnalysisResponse {
  rules: RouteRule[]
  total_transactions: number
  total_rules: number
}

export interface AreaStat {
  area: string
  count: number
}

export interface AreaStatsResponse {
  pickup_areas: AreaStat[]
  delivery_areas: AreaStat[]
}

/* =======================
 * Helper Types
 * ======================= */

export type PriorityLevel = 'very_high' | 'high' | 'medium' | 'low'

export interface AnalyticsParams {
  min_support?: number
  min_confidence?: number
  limit?: number
  top_n?: number
}

export interface HealthCheckResponse {
  status: string
  service: string
  analytics_service: any
  available_endpoints: {
    new_apis: string[]
    legacy_apis: string[]
  }
}

export interface ApiInfoResponse {
  service: string
  version: string
  description: string
  endpoints: Record<string, any>
  migration_guide: {
    old: string
    new: string
    breaking_changes: string[]
  }
}