import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'
import type { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  UpdateProfileRequest,
  ChangePasswordRequest, 
  SearchUser,
  SearchUserResponse,
  GeoPoint
} from '@/@type/auth'
import { useFcm } from '@/composables/useFcm'

export const useAuth = () => {
  const api = useApi()
  const router = useRouter()

  // ===== STATE =====
  const searchResult = useState<SearchUser | null>('search_user', () => null)
  const user = useState<User | null>('auth_user', () => null)
  const isLoading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)
  
  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role || null)

  // ===== METHODS =====

  /// Lưu tokens vào localStorage
  const saveTokens = (response: AuthResponse) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
      if(response.user.role=='admin' && response.user.post_office_id){
        localStorage.setItem(STORAGE_KEYS.POST_OFFICE_ID,response.user.post_office_id)
      }
    }
  }

  /// Xóa tokens khỏi localStorage
  const clearTokens = () => {
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
      localStorage.removeItem(STORAGE_KEYS.POST_OFFICE_ID)
    }
  }

  /// Kiểm tra đã đăng nhập chưa
  const checkAuth = () => {
    if (import.meta.client) {
      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER)

      if (token && savedUser) {
        try {
          user.value = JSON.parse(savedUser)
          return true
        } catch {
          clearTokens()
        }
      }
    }
    
    return false
  }

  /// Clear error
  const clearError = () => {
    error.value = null
  }

  /// ĐĂNG NHẬP
  const login = async (credentials: LoginRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const { getFcmToken } = useFcm()
      const fcmToken=await getFcmToken()
      const payload:LoginRequest={
        ...credentials,
        fcm_token:fcmToken || undefined
      }
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        payload,
        false // không cần auth
      )

      if (response.data) {
        saveTokens(response.data)
        user.value = response.data.user
        return true
      }

      error.value = response.error || 'Đăng nhập thất bại'
      return false
    } catch (e) {
      error.value = 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /// ĐĂNG KÝ
  const register = async (data: RegisterRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        data,
        false
      )

      if (response.data) {
        return true
      }

      error.value = response.error || 'Đăng ký thất bại'
      return false
    } catch (e) {
      error.value = 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /// LẤY THÔNG TIN USER HIỆN TẠI
  const fetchCurrentUser = async (): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<User>(API_ENDPOINTS.ME, true)

      if (response.data) {
        user.value = response.data
        // Cập nhật localStorage
        if (import.meta.client) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))
            if (response.data.role === 'admin' && response.data.post_office_id) {
                      localStorage.setItem(STORAGE_KEYS.POST_OFFICE_ID, response.data.post_office_id)
              }       
          }
        return true
      }

      // Token không hợp lệ
      if (response.status === 401) {
        clearTokens()
        user.value = null
      }

      error.value = response.error
      return false
    } catch (e) {
      error.value = 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }
  //search phone or mail
  const searchUser = async (keyword: string): Promise<SearchUser | null> => {
    isLoading.value = true
    error.value = null

    try {
      // SỬA: Dùng SearchUserResponse cho API call vì backend trả về location dạng chuỗi
      const response = await api.get<SearchUserResponse>(
        API_ENDPOINTS.SEARCH_USER(keyword),
        true
      )

      if (response.data) {
        // Lúc này response.data.location được hiểu là string | null
        // Hàm parseLocation sẽ hoạt động đúng
        const result: SearchUser = {
          id: response.data.id,
          address_detail: response.data.address_detail,
          area_code: response.data.area_code,
          location: parseLocation(response.data.location)
        }

        searchResult.value = result
        return result
      }

      error.value = 'Không tìm thấy người dùng'
      return null
    } catch (e) {
      error.value = 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Hàm parse chuỗi "(lng,lat)" thành object GeoPoint
  function parseLocation(locationStr: string | null): GeoPoint | null {
    if (!locationStr) return null

    try {
      // Backend trả về: "(106.617...,10.863...)" -> format (Lng, Lat)
      const [lng, lat] = locationStr
        .replace(/[()]/g, '') // Xóa dấu ngoặc
        .split(',')           // Tách dấu phẩy
        .map(n => parseFloat(n.trim())) // Chuyển sang số

      // Kiểm tra nếu parse thất bại ra NaN
      if (isNaN(lat) || isNaN(lng)) return null

      return { lat, lng }
    } catch (e) {
      return null
    }
  }

  /// CẬP NHẬT PROFILE NEW
  const updateProfile = async (data: UpdateProfileRequest): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      console.log(' Updating profile with data:', data)

      const response = await api.patch<User>(
        API_ENDPOINTS.UPDATE_PROFILE,
        data,
        true // cần auth
      )

      console.log(' Update profile response:', response)

      if (response.data) {
        user.value = response.data
        // Cập nhật localStorage
        if (import.meta.client) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))
        }
        console.log('Profile updated successfully')
        return true
      }

      error.value = response.error || 'Cập nhật thất bại'
      console.error(' Update profile error:', error.value)
      return false
    } catch (e) {
      console.error(' Update profile exception:', e)
      error.value = 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /// ĐĂNG XUẤT
  const logout = async () => {
    isLoading.value = true

    try {
      await api.post(API_ENDPOINTS.LOGOUT, {}, true)
    } catch {
      // Ignore error
    }

    clearTokens()
    user.value = null
    isLoading.value = false
    router.push('/login')
  }

  const postOfficeId = computed(() => {
  if (user.value?.role === 'admin') {
    return user.value.post_office_id
  }
  return null
})

  return {
    // State
    user,
    role,
    isLoading,
    error,
    isAuthenticated,
    postOfficeId,

    // Methods
    login,
    register,
    logout,
    checkAuth,
    fetchCurrentUser,
    updateProfile, 
    clearError,

    searchUser,
    searchResult,
  }
}