export interface RouteRule {
  from: string
  to: string | string[]
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
