import type {
  RouteRule,
  RouteAnalysisResponse,
  AreaStatsResponse,
} from '@/@type/analysis'

export const useData = () => {
  const config = useRuntimeConfig()
  const token = useCookie('access_token') // ← Thêm token

  /** Base URL giống useApi.ts */
  const baseUrl =
    (config.public.apiBaseUrl as string) || 'http://localhost:8000'

  /* =======================
   * States
   * ======================= */
  const routeRules = useState<RouteRule[]>('route_rules', () => [])
  const areaStats = useState<AreaStatsResponse | null>('area_stats', () => null)

  const isLoading = useState<boolean>('analytics_loading', () => false)
  const error = useState<string | null>('analytics_error', () => null)

  /* =======================
   * Helpers
   * ======================= */
  const buildQuery = (params: Record<string, any>) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query.append(key, String(value))
      }
    })
    return query.toString()
  }

  // ← THÊM HELPER: Build headers with auth
  const buildHeaders = () => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    
    return headers
  }

  /* =======================
   * API: Route Analysis
   * ======================= */
  const getRouteAnalysis = async (params?: {
    min_support?: number
    min_confidence?: number
  }): Promise<RouteAnalysisResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const query = params ? `?${buildQuery(params)}` : ''
      // ✅ FIX: Đổi URL và thêm headers
      const res = await fetch(`${baseUrl}/api/data/route-analysis${query}`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: RouteAnalysisResponse = await res.json()

      routeRules.value = data.rules
      return data
    } catch (e) {
      console.error('Route analysis error:', e)
      error.value = 'Không thể tải dữ liệu phân tích tuyến'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =======================
   * API: Area Stats
   * ======================= */
  const getAreaStats = async (): Promise<AreaStatsResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      // ✅ FIX: Đổi URL và thêm headers
      const res = await fetch(`${baseUrl}/api/data/area-stats`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: AreaStatsResponse = await res.json()
      areaStats.value = data
      return data
    } catch (e) {
      console.error('Area stats error:', e)
      error.value = 'Không thể tải thống kê khu vực'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =======================
   * Utils
   * ======================= */
  const clearError = () => {
    error.value = null
  }

  return {
    // state
    routeRules,
    areaStats,
    isLoading,
    error,

    // actions
    getRouteAnalysis,
    getAreaStats,
    clearError,
  }
}