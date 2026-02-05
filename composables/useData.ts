import type {
  LocationPair,
  PostOfficeSuggestion,
  LocationHotspot,
  LocationPairsResponse,
  PostOfficeSuggestionsResponse,
  LocationHotspotsResponse,
  // Legacy types
  RouteRule,
  RouteAnalysisResponse,
  AreaStatsResponse,
} from '@/@type/analysis'

export const useData = () => {
  const config = useRuntimeConfig()
  const token = useCookie('access_token')

  /** Base URL */
  const baseUrl = (config.public.apiBaseUrl as string) || 'http://localhost:8000'

  /* =======================
   * States - NEW APIs
   * ======================= */
  const locationPairs = useState<LocationPair[]>('location_pairs', () => [])
  const postOfficeSuggestions = useState<PostOfficeSuggestion[]>('post_office_suggestions', () => [])
  const locationHotspots = useState<LocationHotspot[]>('location_hotspots', () => [])

  /* =======================
   * States - Legacy (giữ lại)
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
   * NEW API: Location Pairs
   * ======================= */
  const getLocationPairs = async (params?: {
    min_support?: number
    limit?: number
  }): Promise<LocationPairsResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        min_support: 0.01,
        limit: 50,
        ...params
      }
      
      const query = `?${buildQuery(defaultParams)}`
      const res = await fetch(`${baseUrl}/api/analytics/location-pairs${query}`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: LocationPairsResponse = await res.json()
      locationPairs.value = data.pairs || []
      
      return data
    } catch (e) {
      console.error('Location pairs error:', e)
      error.value = 'Không thể tải dữ liệu phân tích cặp điểm'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =======================
   * NEW API: Post Office Suggestions
   * ======================= */
  const getPostOfficeSuggestions = async (params?: {
    min_support?: number
    top_n?: number
  }): Promise<PostOfficeSuggestionsResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        min_support: 0.02,
        top_n: 10,
        ...params
      }
      
      const query = `?${buildQuery(defaultParams)}`
      const res = await fetch(`${baseUrl}/api/analytics/post-office-suggestions${query}`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: PostOfficeSuggestionsResponse = await res.json()
      postOfficeSuggestions.value = data.suggestions || []
      
      return data
    } catch (e) {
      console.error('Post office suggestions error:', e)
      error.value = 'Không thể tải gợi ý bưu cục'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =======================
   * NEW API: Location Hotspots
   * ======================= */
  const getLocationHotspots = async (params?: {
    top_n?: number
  }): Promise<LocationHotspotsResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        top_n: 20,
        ...params
      }
      
      const query = `?${buildQuery(defaultParams)}`
      const res = await fetch(`${baseUrl}/api/analytics/location-hotspots${query}`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: LocationHotspotsResponse = await res.json()
      locationHotspots.value = data.hotspots || []
      
      return data
    } catch (e) {
      console.error('Location hotspots error:', e)
      error.value = 'Không thể tải thống kê điểm HOT'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /* =======================
   * LEGACY API: Route Analysis (giữ lại để tương thích)
   * ======================= */
  const getRouteAnalysis = async (params?: {
    min_support?: number
    min_confidence?: number
    limit?: number
  }): Promise<RouteAnalysisResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        min_support: 0.01,
        min_confidence: 0.1,
        limit: 50,
        ...params
      }
      
      const query = `?${buildQuery(defaultParams)}`
      const res = await fetch(`${baseUrl}/api/analytics/route-analysis${query}`, {
        headers: buildHeaders()
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data: RouteAnalysisResponse = await res.json()
      routeRules.value = data.rules || []
      
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
   * LEGACY API: Area Stats (giữ lại để tương thích)
   * ======================= */
  const getAreaStats = async (params?: {
    top_n?: number
  }): Promise<AreaStatsResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const defaultParams = {
        top_n: 10,
        ...params
      }
      
      const query = `?${buildQuery(defaultParams)}`
      const res = await fetch(`${baseUrl}/api/analytics/area-stats${query}`, {
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
   * Health Check
   * ======================= */
  const checkHealth = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/analytics/health`, {
        headers: buildHeaders()
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      return await res.json()
    } catch (e) {
      console.error('Health check error:', e)
      return null
    }
  }

  /* =======================
   * API Info
   * ======================= */
  const getApiInfo = async () => {
    try {
      const res = await fetch(`${baseUrl}/api/analytics/info`, {
        headers: buildHeaders()
      })
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      
      return await res.json()
    } catch (e) {
      console.error('API info error:', e)
      return null
    }
  }

  /* =======================
   * Utils
   * ======================= */
  const clearError = () => {
    error.value = null
  }

  const clearAll = () => {
    locationPairs.value = []
    postOfficeSuggestions.value = []
    locationHotspots.value = []
    routeRules.value = []
    areaStats.value = null
    error.value = null
  }

  return {
    // New states
    locationPairs,
    postOfficeSuggestions,
    locationHotspots,
    
    // Legacy states (giữ lại)
    routeRules,
    areaStats,
    
    // Common states
    isLoading,
    error,

    // New actions (ưu tiên sử dụng)
    getLocationPairs,
    getPostOfficeSuggestions,
    getLocationHotspots,
    
    // Legacy actions (giữ lại để tương thích)
    getRouteAnalysis,
    getAreaStats,
    
    // Utils
    checkHealth,
    getApiInfo,
    clearError,
    clearAll,
  }
}