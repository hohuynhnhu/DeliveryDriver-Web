import { API_ENDPOINTS } from '@/utils/constants'
import type { OrderCreateDTO, OrderResponse } from '@/@type/order'

export const useOrder = () => {
  const api = useApi()
  const router = useRouter()

  const isLoading = useState<boolean>('order_loading', () => false)
  const error = useState<string | null>('order_error', () => null)

  /// Tạo đơn hàng mới
  const createOrder = async (data: OrderCreateDTO): Promise<OrderResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      console.log(' Creating order:', data)

      // POST đến gateway endpoint
      const response = await api.post<OrderResponse>(
        API_ENDPOINTS.ORDERS, // '/api/v1/orders/'
        data,
        true // requireAuth
      )

      if (response.data) {
        console.log(' Order created successfully:', response.data)
        return response.data
      }

      error.value = response.error || 'Tạo đơn hàng thất bại'
      console.error(' Create order error:', error.value)
      return null
    } catch (e) {
      console.error(' Create order exception:', e)
      error.value = 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /// Lấy danh sách đơn hàng của customer
  const getCustomerOrders = async (userId: string, skip = 0, limit = 10): Promise<OrderResponse[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<OrderResponse[]>(
        `${API_ENDPOINTS.ORDERS}/customer/${userId}?skip=${skip}&limit=${limit}`,
        true
      )

      if (response.data) {
        return response.data
      }

      error.value = response.error || 'Không thể tải danh sách đơn hàng'
      return []
    } catch (e) {
      console.error('Get customer orders error:', e)
      error.value = 'Đã xảy ra lỗi'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /// Lấy chi tiết đơn hàng
  const getOrderById = async (orderId: string): Promise<OrderResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<OrderResponse>(
        `${API_ENDPOINTS.ORDERS}/${orderId}`,
        true
      )

      if (response.data) {
        return response.data
      }

      error.value = response.error || 'Không thể tải chi tiết đơn hàng'
      return null
    } catch (e) {
      console.error('Get order detail error:', e)
      error.value = 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /// Hủy đơn hàng
  const cancelOrder = async (orderId: string, userId: string, reason?: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      let url = `${API_ENDPOINTS.ORDERS}/${orderId}/cancel?user_id=${userId}`
      if (reason) {
        url += `&reason=${encodeURIComponent(reason)}`
      }

      const response = await api.post<any>(url, {}, true)

      if (response.data) {
        return true
      }

      error.value = response.error || 'Không thể hủy đơn hàng'
      return false
    } catch (e) {
      console.error('Cancel order error:', e)
      error.value = 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  return {
    isLoading,
    error,
    createOrder,
    getCustomerOrders,
    getOrderById,
    cancelOrder,
    clearError,
  }
}