// composables/useOrderManagement.ts - FIXED VERSION
import { API_ENDPOINTS } from '@/utils/constants'
import type { OrderSummary, OrderFilters } from '@/@type/order'

// ============================================================================
// INTERFACES
// ============================================================================

interface ApiResponse<T = any> {
  data?: T
  message?: string
  status?: number
}

interface ApiDataWrapper<T = any> {
  data: T
  message?: string
}

interface ScheduleRequest {
  post_office_id: string
  scheduled_date: string
  area_codes: string[]
}

interface PickupScheduleRequest {
  order_id: string
  scheduled_date: string
  driver_id?: string
}

interface OrdersByArea {
  [areaCode: string]: any[]
}

// ============================================================================
// COMPOSABLE
// ============================================================================

export const useOrderManagement = () => {
  const api = useApi()
  const { postOfficeId } = useAuth()

  const isLoading = useState<boolean>('order_mgmt_loading', () => false)
  const error = useState<string | null>('order_mgmt_error', () => null)

  // ============================================================================
  // 1. QUẢN LÝ ĐỚN HÀNG THEO TRẠNG THÁI
  // ============================================================================

  const getPendingOrders = async (): Promise<OrderSummary[]> => {
    if (!postOfficeId.value) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<OrderSummary[]>(
        `/api/v1/orders/post-office/${postOfficeId.value}/orders?status=pending&limit=100`,
        true
      )
      
      const orders = (response as ApiResponse<OrderSummary[]>).data || []
      return Array.isArray(orders) ? orders : []
    } catch (e) {
      console.error('❌ Error fetching pending orders:', e)
      error.value = 'Không thể tải đơn hàng chờ duyệt'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getConfirmedOrders = async () => {
    if (!postOfficeId.value) return { pickup: [], dropoff: [] }

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<OrderSummary[]>(
        `/api/v1/orders/post-office/${postOfficeId.value}/orders?status=confirmed&limit=100`,
        true
      )

      const rawOrders = (response as ApiResponse<OrderSummary[]>).data || []
      const orders: OrderSummary[] = Array.isArray(rawOrders) ? rawOrders : []

      // Phân loại theo order_type
      const pickup = orders.filter((order: any) => order.order_type === 'pickup')
      const dropoff = orders.filter((order: any) => order.order_type === 'drop_off')

      return { pickup, dropoff }
    } catch (e) {
      console.error('❌ Error fetching confirmed orders:', e)
      error.value = 'Không thể tải đơn hàng đã duyệt'
      return { pickup: [], dropoff: [] }
    } finally {
      isLoading.value = false
    }
  }

  const getPickedOrders = async (): Promise<OrderSummary[]> => {
    if (!postOfficeId.value) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<OrderSummary[]>(
        `/api/v1/orders/post-office/${postOfficeId.value}/orders?status=confirmed&pickup_status=picked&limit=100`,
        true
      )
      
      const orders = (response as ApiResponse<OrderSummary[]>).data || []
      return Array.isArray(orders) ? orders : []
    } catch (e) {
      console.error('❌ Error fetching picked orders:', e)
      error.value = 'Không thể tải đơn đã lấy hàng'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 2. QUẢN LÝ LỊCH LẤY HÀNG (PICKUP SCHEDULE)
  // ============================================================================

  const createPickupSchedule = async (request: PickupScheduleRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(
        '/api/v1/pickup-schedules',
        request,
        true
      )

      const result = (response as ApiResponse).data
      
      if (result) {
        return result
      }

      error.value = 'Không thể tạo lịch lấy hàng'
      return null
    } catch (e) {
      console.error('❌ Error creating pickup schedule:', e)
      error.value = 'Lỗi khi tạo lịch lấy hàng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const assignDriverToPickup = async (orderId: string, driverId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      // FIX: Sử dụng endpoint đúng từ backend
      const response = await api.patch(
        `/api/v1/pickup-schedules/${orderId}/assign-driver`,
        { driver_id: driverId },
        true
      )

      return !!(response as ApiResponse).data
    } catch (e) {
      console.error('❌ Error assigning driver:', e)
      error.value = 'Không thể gán tài xế'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 3. QUẢN LÝ LỊCH GIAO HÀNG (DELIVERY SCHEDULE)
  // ============================================================================

  const groupOrdersByArea = async (): Promise<OrdersByArea> => {
    if (!postOfficeId.value) return {}

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(
        '/api/approve-orders/group-by-area',
        {
          post_office_id: postOfficeId.value,
          status: 'pending'
        },
        true
      )

      const apiResponse = response as ApiResponse<ApiDataWrapper<OrdersByArea>>
      const result = apiResponse.data?.data || {}
      return typeof result === 'object' && result !== null ? result : {}
    } catch (e) {
      console.error('❌ Error grouping orders:', e)
      error.value = 'Không thể nhóm đơn hàng'
      return {}
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo lịch giao hàng - WORKAROUND vì backend chưa có GA endpoint
   * Tạo schedule từng area một
   */
  const createDeliveryScheduleWithGA = async (request: ScheduleRequest) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('⚠️ GA endpoint chưa có, đang dùng manual schedule cho từng area...')
      
      const results = []
      
      // Tạo schedule cho từng area
      for (const areaCode of request.area_codes) {
        try {
          const response = await api.post(
            '/api/approve-orders/process-by-area',
            {
              post_office_id: request.post_office_id,
              area_code: areaCode,
              scheduled_date: request.scheduled_date
            },
            true
          )
          
          const apiResponse = response as ApiResponse<ApiDataWrapper>
          const result = apiResponse.data?.data
          
          if (result) {
            results.push({
              area_code: areaCode,
              ...result
            })
          }
        } catch (e) {
          console.error(`❌ Error scheduling area ${areaCode}:`, e)
          // Tiếp tục với area khác
        }
      }
      
      if (results.length > 0) {
        console.log(`✅ Đã tạo schedule cho ${results.length}/${request.area_codes.length} khu vực`)
        
        // Tạo summary response giống GA
        return {
          schedule_id: `manual-${Date.now()}`,
          total_orders_scheduled: results.reduce((sum, r) => sum + (r.total_orders || 0), 0),
          areas_scheduled: results.length,
          details: results
        }
      }

      error.value = 'Không thể tạo lịch giao hàng cho bất kỳ khu vực nào'
      return null
    } catch (e: any) {
      console.error('❌ Error creating delivery schedule:', e)
      error.value = e.response?.data?.detail || 'Lỗi khi tạo lịch giao hàng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createManualDeliverySchedule = async (areaCode: string, scheduledDate: string) => {
    if (!postOfficeId.value) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post(
        '/api/approve-orders/process-by-area',
        {
          post_office_id: postOfficeId.value,
          area_code: areaCode,
          scheduled_date: scheduledDate
        },
        true
      )

      const apiResponse = response as ApiResponse<ApiDataWrapper>
      return apiResponse.data?.data || null
    } catch (e) {
      console.error('❌ Error creating manual schedule:', e)
      error.value = 'Không thể tạo lịch thủ công'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 4. XEM CHI TIẾT
  // ============================================================================

  const getOrderDetails = async (orderId: string): Promise<any[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(
        `/api/v1/orders/${orderId}`,
        true
      )

      const apiResponse = response as ApiResponse<{ order_details: any[] }>
      const details = apiResponse.data?.order_details || []
      return Array.isArray(details) ? details : []
    } catch (e) {
      console.error('❌ Error fetching order details:', e)
      error.value = 'Không thể tải chi tiết đơn hàng'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getScheduleItems = async (scheduleId: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get(
        `/api/approve-orders/schedule/${scheduleId}/items`,
        true
      )

      const apiResponse = response as ApiResponse<ApiDataWrapper<any[]>>
      const items = apiResponse.data?.data || []
      return Array.isArray(items) ? items : []
    } catch (e) {
      console.error('❌ Error fetching schedule items:', e)
      error.value = 'Không thể tải chi tiết lịch giao'
      return []
    } finally {
      isLoading.value = false
    }
  }


  return {
    isLoading,
    error,
    // Order management
    getPendingOrders,
    getConfirmedOrders,
    getPickedOrders,
    // Pickup scheduling
    createPickupSchedule,
    assignDriverToPickup,
    // Delivery scheduling
    groupOrdersByArea,
    createDeliveryScheduleWithGA,
    createManualDeliverySchedule,
    // Details
    getOrderDetails,
    getScheduleItems,
  }
}