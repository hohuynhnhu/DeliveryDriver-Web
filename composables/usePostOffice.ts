import { API_ENDPOINTS } from '@/utils/constants'
import type { PostOffice, PostOfficeResponse } from '@/@type/postOffice'

export const usePostOffice = () => {
  const api = useApi()

  const postOffices = useState<PostOffice[]>('post_offices', () => [])
  const selectedPostOffice = useState<PostOffice | null>('selected_post_office', () => null)
  const isLoading = useState<boolean>('post_office_loading', () => false)
  const error = useState<string | null>('post_office_error', () => null)

  const convertToPostOffice = (response: PostOfficeResponse): PostOffice => {
    return {
      id: response.id,
      code: response.code,
      name: response.name,
      address: response.address,
      ward: response.ward,
      district: response.district,
      province: response.province,
      area_codes: response.area_codes,
      phone: response.phone,
      email: response.email,
      open_time: response.open_time,
      close_time: response.close_time,
      working_days: response.working_days,
      manager_id: response.manager_id,
      status: response.status,
      location: response.location 
    }
  }

  // ============================================================================
  // READ OPERATIONS
  // ============================================================================
  
  /**
   * Lấy tất cả post offices
   */
  const getAllPostOffices = async (): Promise<PostOffice[]> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📍 Fetching all post offices from:', API_ENDPOINTS.POST_OFFICES)
      
      const response = await api.get<PostOfficeResponse[]>(
        API_ENDPOINTS.POST_OFFICES,
        true
      )

      console.log('Raw API response:', response)

      if (response.data) {
        const converted = response.data
          .map(convertToPostOffice)
        
        console.log('✅ Total offices:', converted.length)
        
        postOffices.value = converted
        return converted
      }

      error.value = response.error || 'Không thể tải danh sách bưu cục'
      console.error('❌ API Error:', error.value)
      return []
    } catch (e) {
      console.error('❌ Exception in getAllPostOffices:', e)
      error.value = 'Đã xảy ra lỗi khi tải danh sách'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy post offices theo area code
   */
  const getPostOfficesByArea = async (areaCode: string): Promise<PostOffice[]> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📍 Filtering by area code:', areaCode)
      
      const response = await api.get<PostOfficeResponse[]>(
        API_ENDPOINTS.POST_OFFICES_BY_AREA(areaCode),
        true
      )

      if (response.data) {
        const offices = response.data
          .map(convertToPostOffice)
        
        console.log('✅ Filtered offices:', offices.length)
        
        postOffices.value = offices
        return offices
      }

      error.value = response.error || 'Không thể tải danh sách bưu cục'
      return []
    } catch (e) {
      console.error('❌ Exception in getPostOfficesByArea:', e)
      error.value = 'Đã xảy ra lỗi'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Lấy thông tin 1 post office
   */
  const getPostOfficeById = async (id: string): Promise<PostOffice | null> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await api.get<PostOfficeResponse>(
        API_ENDPOINTS.POST_OFFICE_BY_ID(id),
        true
      )

      if (response.data) {
        return convertToPostOffice(response.data)
      }

      error.value = response.error || 'Không thể tải thông tin bưu cục'
      return null
    } catch (e) {
      console.error('❌ Exception in getPostOfficeById:', e)
      error.value = 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // CREATE OPERATION (MỚI)
  // ============================================================================
  
  /**
   * Tạo bưu cục mới
   */
  const createPostOffice = async (data: Partial<PostOffice>): Promise<PostOffice | null> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('📝 Creating new post office:', data)
      
      const response = await api.post<PostOfficeResponse>(
        API_ENDPOINTS.POST_OFFICES,
        data,
        true
      )

      if (response.data) {
        const newOffice = convertToPostOffice(response.data)
        console.log('✅ Post office created:', newOffice)
        
        // Cập nhật danh sách
        postOffices.value = [...postOffices.value, newOffice]
        
        return newOffice
      }

      error.value = response.error || 'Không thể tạo bưu cục'
      return null
    } catch (e: any) {
      console.error('❌ Exception in createPostOffice:', e)
      error.value = e.message || 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // UPDATE OPERATIONS (MỚI)
  // ============================================================================
  
  /**
   * Kích hoạt bưu cục
   */
  const activatePostOffice = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('✅ Activating post office:', id)
      
      const response = await api.patch(
        `${API_ENDPOINTS.POST_OFFICES}/${id}/status/activate`,
        {},
        true
      )

      if (response.data) {
        console.log('✅ Post office activated')
        
        // Cập nhật trong danh sách
        const index = postOffices.value.findIndex(po => po.id === id)
        if (index !== -1) {
          postOffices.value[index].status = 'active'
        }
        
        return true
      }

      error.value = response.error || 'Không thể kích hoạt bưu cục'
      return false
    } catch (e: any) {
      console.error('❌ Exception in activatePostOffice:', e)
      error.value = e.message || 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vô hiệu hóa bưu cục
   */
  const deactivatePostOffice = async (id: string): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🔒 Deactivating post office:', id)
      
      const response = await api.patch(
        `${API_ENDPOINTS.POST_OFFICES}/${id}/status/deactivate`,
        {},
        true
      )

      if (response.data) {
        console.log('✅ Post office deactivated')
        
        // Cập nhật trong danh sách
        const index = postOffices.value.findIndex(po => po.id === id)
        if (index !== -1) {
          postOffices.value[index].status = 'inactive'
        }
        
        return true
      }

      error.value = response.error || 'Không thể vô hiệu hóa bưu cục'
      return false
    } catch (e: any) {
      console.error('❌ Exception in deactivatePostOffice:', e)
      error.value = e.message || 'Đã xảy ra lỗi'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Set selected post office
   */
  const selectPostOffice = (postOffice: PostOffice | null) => {
    console.log('📍 Selecting post office:', postOffice)
    selectedPostOffice.value = postOffice
  }

  /**
   * Clear error
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset state
   */
  const reset = () => {
    postOffices.value = []
    selectedPostOffice.value = null
    error.value = null
  }

  return {
    // State
    postOffices,
    selectedPostOffice,
    isLoading,
    error,
    
    // Read
    getAllPostOffices,
    getPostOfficesByArea,
    getPostOfficeById,
    
    // Create
    createPostOffice,
    
    // Update
    activatePostOffice,
    deactivatePostOffice,
    
    // Helpers
    selectPostOffice,
    clearError,
    reset,
  }
}