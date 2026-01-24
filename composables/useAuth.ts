
import { API_ENDPOINTS, STORAGE_KEYS } from '@/utils/constants'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from '@/@type/auth'

export const useAuth = () => {
  const api = useApi()
  const router = useRouter()

  // ===== STATE =====
  const user = useState<User | null>('auth_user', () => null)
  const isLoading = useState<boolean>('auth_loading', () => false)
  const error = useState<string | null>('auth_error', () => null)

  // ===== COMPUTED =====
  const isAuthenticated = computed(() => !!user.value)

  // ===== METHODS =====

  /// Lưu tokens vào localStorage
  const saveTokens = (response: AuthResponse) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token)
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token)
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user))
    }
  }

  /// Xóa tokens khỏi localStorage
  const clearTokens = () => {
    if (import.meta.client) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
      localStorage.removeItem(STORAGE_KEYS.USER)
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
      const response = await api.post<AuthResponse>(
        API_ENDPOINTS.LOGIN,
        credentials,
        false // không cần auth
      )

      if (response.data) {
        // Lưu tokens
        saveTokens(response.data)
        // Set user state
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
        false // không cần auth
      )

      if (response.data) {
        // Đăng ký thành công - KHÔNG lưu token
        // User phải đăng nhập lại
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

  /// ĐĂNG XUẤT
  const logout = async () => {
    isLoading.value = true

    try {
      // Gọi API logout (optional - có thể bỏ qua nếu lỗi)
      await api.post(API_ENDPOINTS.LOGOUT, {}, true)
    } catch {
      // Ignore error
    }

    // Clear local data
    clearTokens()
    user.value = null
    isLoading.value = false

    // Redirect về login
    router.push('/login')
  }

  /// LẤY THÔNG TIN USER HIỆN TẠI
  const fetchCurrentUser = async (): Promise<boolean> => {
    isLoading.value = true

    try {
      const response = await api.get<User>(API_ENDPOINTS.ME, true)

      if (response.data) {
        user.value = response.data
        // Cập nhật localStorage
        if (import.meta.client) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))
        }
        return true
      }

      // Token không hợp lệ
      if (response.status === 401) {
        clearTokens()
        user.value = null
      }

      return false
    } catch (e) {
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    isLoading,
    error,
    isAuthenticated,

    // Methods
    login,
    register,
    logout,
    checkAuth,
    fetchCurrentUser,
    clearError,
  }
}