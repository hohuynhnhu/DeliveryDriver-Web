// composables/useSchedule.ts
import type { Schedule, ScheduleDetail, ScheduleItem, AssignDriverRequest } from '@/@type/schedule'

interface ApiResponse<T = any> {
  data?: T
  message?: string
  status?: number
}

interface ApiDataWrapper<T = any> {
  data: T
  message?: string
}

export const useSchedule = () => {
  const api = useApi()
  const { postOfficeId } = useAuth()

  const isLoading = useState<boolean>('schedule_loading', () => false)
  const error = useState<string | null>('schedule_error', () => null)

  // ============================================================================
  // 1. LẤY DANH SÁCH SCHEDULES
  // ============================================================================

  /**
   * Lấy tất cả schedules của bưu cục
   */
  const getSchedules = async (filters?: {
    scheduled_date?: string
    status?: string
    area_code?: string
  }): Promise<Schedule[]> => {
    if (!postOfficeId.value) return []

    isLoading.value = true
    error.value = null

    try {
      // TODO: Backend cần implement endpoint này
      // Tạm thời query từ Supabase trực tiếp hoặc dùng workaround
      
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

      const response = await api.get<Schedule[]>(
        `/api/v1/schedules/?${queryParams.toString()}`,
        true
      )

      const schedules = (response as ApiResponse<Schedule[]>).data || []
      return Array.isArray(schedules) ? schedules : []
    } catch (e) {
      console.error(' Error fetching schedules:', e)
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
      // Get schedule info
      const scheduleResponse = await api.get<Schedule>(
        `/api/v1/schedules/${scheduleId}`,
        true
      )

      const schedule = (scheduleResponse as ApiResponse<Schedule>).data

      if (!schedule) {
        error.value = 'Không tìm thấy lịch giao hàng'
        return null
      }

      // Get schedule items
      const itemsResponse = await api.get<ScheduleItem[]>(
        `/api/v1/schedules/${scheduleId}/items`,
        true
      )

      const apiItemsResponse = itemsResponse as unknown as ApiResponse<ApiDataWrapper<ScheduleItem[]>>
      const items = apiItemsResponse.data?.data || []

      return {
        ...schedule,
        items: Array.isArray(items) ? items : []
      }
    } catch (e) {
      console.error(' Error fetching schedule detail:', e)
      error.value = 'Không thể tải chi tiết lịch giao hàng'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 2. GÁN TÀI XẾ
  // ============================================================================

  /**
   * Gán tài xế cho schedule
   */
  const assignDriver = async (scheduleId: string, driverId: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch(
        `/api/v1/schedules/${scheduleId}/assign-driver`,
        { driver_id: driverId },
        true
      )

      const result = (response as ApiResponse).data

      if (result) {
        console.log(' Đã gán tài xế cho schedule:', scheduleId)
        return true
      }

      error.value = 'Không thể gán tài xế'
      return false
    } catch (e) {
      console.error(' Error assigning driver:', e)
      error.value = 'Lỗi khi gán tài xế'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 3. CẬP NHẬT TRẠNG THÁI
  // ============================================================================

  /**
   * Cập nhật trạng thái schedule
   */
  const updateScheduleStatus = async (
    scheduleId: string, 
    status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch(
        `/api/v1/schedules/${scheduleId}/status`,
        { status },
        true
      )

      const result = (response as ApiResponse).data

      if (result) {
        console.log(` Đã cập nhật trạng thái schedule ${scheduleId} -> ${status}`)
        return true
      }

      error.value = 'Không thể cập nhật trạng thái'
      return false
    } catch (e) {
      console.error(' Error updating schedule status:', e)
      error.value = 'Lỗi khi cập nhật trạng thái'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Xác nhận schedule (chuyển từ draft -> confirmed)
   */
  const confirmSchedule = async (scheduleId: string): Promise<boolean> => {
    return await updateScheduleStatus(scheduleId, 'confirmed')
  }

  /**
   * Hủy schedule
   */
  const cancelSchedule = async (scheduleId: string, reason?: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.patch(
        `/api/v1/schedules/${scheduleId}/cancel`,
        { reason },
        true
      )

      const result = (response as ApiResponse).data

      if (result) {
        console.log('Đã hủy schedule:', scheduleId)
        return true
      }

      error.value = 'Không thể hủy lịch'
      return false
    } catch (e) {
      console.error(' Error cancelling schedule:', e)
      error.value = 'Lỗi khi hủy lịch'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // 4. THỐNG KÊ
  // ============================================================================

  /**
   * Lấy thống kê schedules
   */
  const getScheduleStatistics = async (): Promise<any> => {
    if (!postOfficeId.value) return null

    try {
      const schedules = await getSchedules()

      const stats = {
        total_schedules: schedules.length,
        draft_schedules: schedules.filter(s => s.status === 'draft').length,
        confirmed_schedules: schedules.filter(s => s.status === 'confirmed').length,
        in_progress_schedules: schedules.filter(s => s.status === 'in_progress').length,
        completed_schedules: schedules.filter(s => s.status === 'completed').length,
      }

      return stats
    } catch (e) {
      console.error(' Error getting schedule statistics:', e)
      return null
    }
  }

  return {
    isLoading,
    error,
    // Get
    getSchedules,
    getScheduleDetail,
    // Assign
    assignDriver,
    // Update
    updateScheduleStatus,
    confirmSchedule,
    cancelSchedule,
    // Stats
    getScheduleStatistics
  }
}