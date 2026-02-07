// composables/useSchedule.ts
import type {
  ApiResponse,
  Schedule,
  ScheduleDetail,
  ScheduleItem,
  ScheduleStatus,
  ScheduleStatistics,
  SchedulingResponse,
  OrderDetail,
  OrdersByArea,
  OrderStatisticsByArea,
  ScheduleFilters,
  CreateScheduleRequest,
  DeleteScheduleResponse
} from '@/@type/schedule'

export const useSchedule = () => {
  const api = useApi()
  const { postOfficeId } = useAuth()

  const isLoading = useState<boolean>('schedule_loading', () => false)
  const error = useState<string | null>('schedule_error', () => null)


  const getOrdersGroupedByArea = async (status: string = 'pending'): Promise<OrdersByArea> => {
    if (!postOfficeId.value) return {}

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<ApiResponse<OrdersByArea>>(
        '/api/approve-orders/group-by-area',
        {
          post_office_id: postOfficeId.value,
          status
        },
        true
      )

      console.log('📦 Orders grouped by area response:', response)

      let grouped: OrdersByArea = {}

      if (response?.data?.data) {
        grouped = response.data.data
      } else if (response?.data && typeof response.data === 'object') {
        grouped = response.data as unknown as OrdersByArea
      }

      console.log(`✅ Loaded orders in ${Object.keys(grouped).length} areas`)
      return grouped

    } catch (e) {
      console.error('Error fetching orders grouped by area:', e)
      error.value = 'Không thể tải đơn hàng theo vùng'
      return {}
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy đơn hàng của một vùng cụ thể
   */
  const getOrdersByArea = async (areaCode: string, status: string = 'pending'): Promise<OrderDetail[]> => {
    if (!postOfficeId.value) return []

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<ApiResponse<OrderDetail[]>>(
        '/api/approve-orders/list-by-area',
        {
          post_office_id: postOfficeId.value,
          area_code: areaCode,
          status
        },
        true
      )

      console.log(`📦 Orders in area ${areaCode} response:`, response)

      let orders: OrderDetail[] = []

      if (response?.data?.data && Array.isArray(response.data.data)) {
        orders = response.data.data
      } else if (response?.data && Array.isArray(response.data)) {
        orders = response.data as unknown as OrderDetail[]
      } else if (Array.isArray(response)) {
        orders = response
      }

      console.log(`✅ Loaded ${orders.length} orders in area ${areaCode}`)
      return orders

    } catch (e) {
      console.error('Error fetching orders by area:', e)
      error.value = 'Không thể tải đơn hàng theo vùng'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xử lý tất cả đơn confirmed (tạo schedules)
   */
  const processAllPendingOrders = async (): Promise<SchedulingResponse | null> => {
    if (!postOfficeId.value) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<ApiResponse<SchedulingResponse>>(
        '/api/approve-orders/process-all',
        {
          post_office_id: postOfficeId.value
        },
        true
      )

      console.log('✅ Processed all pending orders:', response)
      return (response?.data as SchedulingResponse) || null

    } catch (e) {
      console.error('Error processing all orders:', e)
      error.value = 'Không thể xử lý đơn hàng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xử lý đơn hàng theo vùng cụ thể
   */
  const processOrdersByArea = async (areaCode: string): Promise<SchedulingResponse | null> => {
    if (!postOfficeId.value) return null

    isLoading.value = true
    error.value = null

    try {
      const response = await api.post<ApiResponse<SchedulingResponse>>(
        '/api/approve-orders/process-by-area',
        {
          post_office_id: postOfficeId.value,
          area_code: areaCode
        },
        true
      )

      console.log(`✅ Processed orders in area ${areaCode}:`, response)
      return (response?.data as SchedulingResponse) || null

    } catch (e) {
      console.error('Error processing orders by area:', e)
      error.value = 'Không thể xử lý đơn hàng theo vùng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 2. SCHEDULE ENDPOINTS - Quản lý lịch trình
  // ============================================================================

  /**
   * Lấy tất cả schedules của bưu cục
   */
  const getSchedules = async (filters?: ScheduleFilters): Promise<Schedule[]> => {
    if (!postOfficeId.value) return []

    isLoading.value = true
    error.value = null

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('post_office_id', postOfficeId.value)

      if (filters?.scheduled_date) {
        queryParams.append('scheduled_date', filters.scheduled_date)
      }
      if (filters?.status) {
        queryParams.append('status', filters.status)
      }
      if (filters?.area_code) {
        queryParams.append('area_code', filters.area_code)
      }
      if (filters?.driver_id) {
        queryParams.append('driver_id', filters.driver_id)
      }

      const response = await api.get<ApiResponse<Schedule[]>>(
        `/api/approve-orders/?${queryParams.toString()}`,
        true
      )

      console.log('📋 Raw response:', response)

      let schedules: Schedule[] = []

      if (response?.data && Array.isArray(response.data)) {
        schedules = response.data
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        schedules = response.data.data
      } else if (Array.isArray(response)) {
        schedules = response
      }

      console.log(`✅ Loaded ${schedules.length} schedules`)
      return schedules

    } catch (e) {
      console.error('Error fetching schedules:', e)
      error.value = 'Không thể tải danh sách lịch giao hàng'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy chi tiết một schedule
   */
  const getScheduleDetail = async (scheduleId: string): Promise<ScheduleDetail | null> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📋 Fetching schedule:', scheduleId)

      const scheduleResponse = await api.get<ApiResponse<Schedule>>(
        `/api/approve-orders/schedules/${scheduleId}`,
        true
      )

      console.log('📋 Schedule response:', scheduleResponse)

      let schedule: Schedule | null = null

      if ((scheduleResponse as any)?.data?.data) {
        schedule = (scheduleResponse as any).data.data
      } else if ((scheduleResponse as any)?.data) {
        schedule = (scheduleResponse as any).data
      } else if (scheduleResponse) {
        schedule = scheduleResponse as any
      }

      if (!schedule) {
        error.value = 'Không tìm thấy lịch giao hàng'
        return null
      }

      console.log('📋 Fetching items for schedule:', scheduleId)

      const itemsResponse = await api.get<ApiResponse<ScheduleItem[]>>(
        `/api/approve-orders/schedules/${scheduleId}/items`,
        true
      )

      console.log('📋 Items response:', itemsResponse)

      let items: ScheduleItem[] = []

      if ((itemsResponse as any)?.data?.data) {
        items = (itemsResponse as any).data.data
      } else if ((itemsResponse as any)?.data && Array.isArray((itemsResponse as any).data)) {
        items = (itemsResponse as any).data
      } else if (Array.isArray(itemsResponse)) {
        items = itemsResponse
      }

      console.log(`✅ Parsed ${items.length} items`)

      const result: ScheduleDetail = {
        ...schedule,
        items: Array.isArray(items) ? items : []
      }

      return result

    } catch (e) {
      console.error('Error fetching schedule detail:', e)
      error.value = 'Không thể tải chi tiết lịch giao hàng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy items của một schedule
   */
  const getScheduleItems = async (scheduleId: string): Promise<ScheduleItem[]> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<ApiResponse<ScheduleItem[]>>(
        `/api/approve-orders/schedules/${scheduleId}/items`,
        true
      )

      let items: ScheduleItem[] = []

      if (response?.data?.data && Array.isArray(response.data.data)) {
        items = response.data.data
      } else if (response?.data && Array.isArray(response.data)) {
        items = response.data as unknown as ScheduleItem[]
      } else if (Array.isArray(response)) {
        items = response
      }

      console.log(`✅ Loaded ${items.length} items for schedule ${scheduleId}`)
      return items

    } catch (e) {
      console.error('Error fetching schedule items:', e)
      error.value = 'Không thể tải danh sách items'
      return []
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 3. GÁN TÀI XẾ
  // ============================================================================

  /**
   * Gán tài xế cho schedule
   */
  const assignDriver = async (scheduleId: string, driverId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch<ApiResponse>(
        `/api/approve-orders/${scheduleId}/assign-driver`,
        { driver_id: driverId },
        true
      )

      if (response?.success || response?.data) {
        console.log(' Đã gán tài xế cho schedule:', scheduleId)
        return true
      }

      error.value = 'Không thể gán tài xế'
      return false

    } catch (e) {
      console.error('Error assigning driver:', e)
      error.value = 'Lỗi khi gán tài xế'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 4. CẬP NHẬT TRẠNG THÁI
  // ============================================================================

  /**
   * Cập nhật trạng thái schedule
   */
  const updateScheduleStatus = async (
    scheduleId: string,
    status: ScheduleStatus
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch<ApiResponse>(
        `/api/approve-orders/${scheduleId}/status`,
        { status },
        true
      )

      if (response?.success || response?.data) {
        console.log(`✅ Đã cập nhật trạng thái schedule ${scheduleId} -> ${status}`)
        return true
      }

      error.value = 'Không thể cập nhật trạng thái'
      return false

    } catch (e) {
      console.error('Error updating schedule status:', e)
      error.value = 'Lỗi khi cập nhật trạng thái'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xác nhận schedule (draft -> confirmed)
   */
  const confirmSchedule = async (scheduleId: string): Promise<boolean> => {
    return await updateScheduleStatus(scheduleId, 'confirmed')
  }

  /**
   * Bắt đầu giao hàng (confirmed -> in_progress)
   */
  const startDelivery = async (scheduleId: string): Promise<boolean> => {
    return await updateScheduleStatus(scheduleId, 'in_progress')
  }

  /**
   * Hoàn thành schedule (in_progress -> completed)
   */
  const completeSchedule = async (scheduleId: string): Promise<boolean> => {
    return await updateScheduleStatus(scheduleId, 'completed')
  }

  /**
   * Hủy schedule
   */
  const cancelSchedule = async (scheduleId: string, reason?: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch<ApiResponse>(
        `/api/approve-orders/${scheduleId}/cancel`,
        { reason },
        true
      )

      if (response?.success || response?.data) {
        console.log('✅ Đã hủy schedule:', scheduleId)
        return true
      }

      error.value = 'Không thể hủy lịch'
      return false

    } catch (e) {
      console.error('Error cancelling schedule:', e)
      error.value = 'Lỗi khi hủy lịch'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 5. TẠO SCHEDULE VỚI GA
  // ============================================================================

  /**
   * Tạo schedule với thuật toán GA
   */
  const createScheduleWithGA = async (data: CreateScheduleRequest): Promise<SchedulingResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const requestData: CreateScheduleRequest = {
        ...data,
        post_office_id: data.post_office_id || postOfficeId.value || ''
      }

      const response = await api.post<ApiResponse<SchedulingResponse>>(
        '/api/approve-orders/schedule',
        requestData,
        true
      )

      console.log('✅ Created schedule with GA:', response)
      return (response?.data as SchedulingResponse) || null

    } catch (e) {
      console.error('Error creating schedule with GA:', e)
      error.value = 'Lỗi khi tạo lịch với GA'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Tạo schedule nhanh với cấu hình mặc định
   */
  const createScheduleQuick = async (data: {
    scheduled_date: string
    area_codes: string[]
    post_office_id?: string
  }): Promise<SchedulingResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      const requestData = {
        ...data,
        post_office_id: data.post_office_id || postOfficeId.value || ''
      }

      const response = await api.post<ApiResponse<SchedulingResponse>>(
        '/api/approve-orders/schedule-quick',
        requestData,
        true
      )

      console.log(' Created quick schedule:', response)
      return (response?.data as SchedulingResponse) || null

    } catch (e) {
      console.error('Error creating quick schedule:', e)
      error.value = 'Lỗi khi tạo lịch nhanh'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 6. THỐNG KÊ
  // ============================================================================

  /**
   * Lấy thống kê schedules
   */
  const getScheduleStatistics = async (): Promise<ScheduleStatistics | null> => {
    if (!postOfficeId.value) return null

    try {
      const schedules = await getSchedules()

      const stats: ScheduleStatistics = {
        total_schedules: schedules.length,
        draft_schedules: schedules.filter(s => s.status === 'draft').length,
        confirmed_schedules: schedules.filter(s => s.status === 'confirmed').length,
        in_progress_schedules: schedules.filter(s => s.status === 'in_progress').length,
        completed_schedules: schedules.filter(s => s.status === 'completed').length,
        cancelled_schedules: schedules.filter(s => s.status === 'cancelled').length,
        total_orders: schedules.reduce((sum, s) => sum + (s.total_orders || 0), 0),
        completed_orders: schedules.reduce((sum, s) => sum + (s.completed_orders || 0), 0),
        failed_orders: schedules.reduce((sum, s) => sum + (s.failed_orders || 0), 0),
      }

      return stats

    } catch (e) {
      console.error('Error getting schedule statistics:', e)
      return null
    }
  }

  /**
   * Lấy thống kê đơn hàng theo vùng
   */
  const getOrderStatisticsByArea = async (): Promise<OrderStatisticsByArea | null> => {
    if (!postOfficeId.value) return null

    try {
      const grouped = await getOrdersGroupedByArea('pending')

      const areas = Object.entries(grouped).map(([area_code, data]) => ({
        area_code,
        total_orders: data.total_orders,
        orders: data.orders
      }))

      const stats: OrderStatisticsByArea = {
        total_areas: areas.length,
        total_pending_orders: areas.reduce((sum, s) => sum + s.total_orders, 0),
        areas
      }

      return stats

    } catch (e) {
      console.error('Error getting order statistics by area:', e)
      return null
    }
  }

  const deleteSchedule = async (scheduleId: string): Promise<boolean> => {
  isLoading.value = true
  error.value = null

  try {
    // 1. Kiểm tra schedule có thể xóa không
    const schedule = await getScheduleDetail(scheduleId)
    
    if (!schedule) {
      error.value = 'Không tìm thấy lịch'
      return false
    }

    // 2. Validate: Chỉ xóa nếu draft và chưa có driver
    if (schedule.status !== 'draft') {
      error.value = 'Chỉ có thể xóa lịch ở trạng thái draft'
      return false
    }

    if (schedule.driver_id) {
      error.value = 'Không thể xóa lịch đã gán tài xế'
      return false
    }

    // 3. Gọi API xóa
    const response = await api.del<ApiResponse<DeleteScheduleResponse>>(
      `/api/approve-orders/schedules/${scheduleId}`,
      true
    )

    if (response?.data?.success || response?.success) {
      console.log('🗑️ Đã xóa schedule:', scheduleId)
      return true
    }

    error.value = 'Không thể xóa lịch'
    return false

  } catch (e) {
    console.error('Error deleting schedule:', e)
    error.value = 'Lỗi khi xóa lịch'
    return false
  } finally {
    isLoading.value = false
  }
}

/**
 * Lấy danh sách area_codes có đơn hàng confirmed
 */
const getAvailableAreas = async (): Promise<string[]> => {
  if (!postOfficeId.value) return []

  try {
    const grouped = await getOrdersGroupedByArea('pending')
    return Object.keys(grouped).filter(area => grouped[area].total_orders > 0)
  } catch (e) {
    console.error('Error getting available areas:', e)
    return []
  }
}
  return {
    // State
    isLoading,
    error,

    // Order endpoints
    // getOrdersWithPriority,
    getOrdersGroupedByArea,
    getOrdersByArea,
    processAllPendingOrders,
    processOrdersByArea,
    deleteSchedule,
    getAvailableAreas,

    // Schedule endpoints
    getSchedules,
    getScheduleDetail,
    getScheduleItems,

    // Assign driver
    assignDriver,

    // Update status
    updateScheduleStatus,
    confirmSchedule,
    startDelivery,
    completeSchedule,
    cancelSchedule,

    // Create with GA
    createScheduleWithGA,
    createScheduleQuick,

    // Statistics
    getScheduleStatistics,
    getOrderStatisticsByArea
  }
}