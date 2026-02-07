import { STORAGE_KEYS } from '@/utils/constants'

/// API Response wrapper
interface ApiResponse<T> {
  data: T | null
  error: string | null
  status: number,
  success?:Boolean
}

/// useApi - HTTP client composable
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseUrl = (config.public.apiBaseUrl as string) || 'http://localhost:8000'

  /// Lấy token từ localStoragex    
  const getToken = (): string | null => {
    if (import.meta.client) {
      return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    }
    return null
  }

  const getPostId=():string | null=>{
    if (import.meta.client){
      return localStorage.getItem(STORAGE_KEYS.POST_OFFICE_ID)
    }
    return null
  }

  /// Tạo headers
  const createHeaders = (requireAuth: boolean = true): HeadersInit => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }

    if (requireAuth) {
      const token = getToken()

      if (token) {
        headers['Authorization'] = `Bearer ${token}`

      }
    }

    return headers
  }

  /// Extract error message từ response
  const extractError = (data: any): string => {
    if (typeof data?.detail === 'string') {
      return data.detail
    }
    if (typeof data?.detail?.detail === 'string') {
      return data.detail.detail
    }
    if (typeof data?.message === 'string') {
      return data.message
    }
    return 'Đã xảy ra lỗi'
  }

  /// GET request
  const get = async <T>(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'GET',
        headers: createHeaders(requireAuth),
      })

      const data = await response.json()

      if (response.ok) {
        return { data, error: null, status: response.status }
      }

      return { data: null, error: extractError(data), status: response.status }
    } catch (e) {
      console.error('API GET Error:', e)
      return { data: null, error: 'Không thể kết nối đến server', status: 0 }
    }
  }

  /// POST request
  const post = async <T>(
  endpoint: string,
  body: any,
  requireAuth: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const url = `${baseUrl}${endpoint}`
    const response = await fetch(url, {
      method: 'POST',
      headers: createHeaders(requireAuth),
      body: JSON.stringify(body),
    })

    // Check content type trước khi parse JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error(' Response không phải JSON:')
      console.error(text.substring(0, 500)) // Log 500 ký tự đầu
      return { 
        data: null, 
        error: 'Server không phản hồi đúng định dạng', 
        status: response.status 
      }
    }

    const data = await response.json()
    
    if (response.ok) {
      return { data, error: null, status: response.status }
    }

    return { data: null, error: extractError(data), status: response.status }
  } catch (e) {
    console.error(' API POST Error:', e)
    return { data: null, error: 'Không thể kết nối đến server', status: 0 }
  }
}
  /// PATCH request
  const patch = async <T>(
    endpoint: string,
    body: any,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'PATCH',
        headers: createHeaders(requireAuth),
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (response.ok) {
        return { data, error: null, status: response.status }
      }

      return { data: null, error: extractError(data), status: response.status }
    } catch (e) {
      console.error('API PATCH Error:', e)
      return { data: null, error: 'Không thể kết nối đến server', status: 0 }
    }
  }

  /// DELETE request
  const del = async <T>(
    endpoint: string,
    requireAuth: boolean = true
  ): Promise<ApiResponse<T>> => {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: createHeaders(requireAuth),
      })

      const data = await response.json()

      if (response.ok) {
        return { data, error: null, status: response.status }
      }

      return { data: null, error: extractError(data), status: response.status }
    } catch (e) {
      console.error('API DELETE Error:', e)
      return { data: null, error: 'Không thể kết nối đến server', status: 0 }
    }
  }

  return {
    get,
    post,
    patch,
    del,
    getToken,
    getPostId
  }
}