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

  /// Lấy tất cả post offices
  const getAllPostOffices = async (): Promise<PostOffice[]> => {
    isLoading.value = true
    error.value = null

    try {
      console.log(' Fetching all post offices from:', API_ENDPOINTS.POST_OFFICES)
      
      const response = await api.get<PostOfficeResponse[]>(
        API_ENDPOINTS.POST_OFFICES,
        true
      )

      console.log('Raw API response:', response)

      if (response.data) {
        const converted = response.data
          .map(convertToPostOffice)
          .filter(po => po.status === 'active')
        
        console.log('Converted offices:', converted)
        console.log(' Total active offices:', converted.length)
        
        postOffices.value = converted
        return converted
      }

      error.value = response.error || 'Không thể tải danh sách bưu cục'
      console.error(' API Error:', error.value)
      return []
    } catch (e) {
      console.error(' Exception in getAllPostOffices:', e)
      error.value = 'Đã xảy ra lỗi khi tải danh sách'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /// Lấy post offices theo area code
  const getPostOfficesByArea = async (areaCode: string): Promise<PostOffice[]> => {
    isLoading.value = true
    error.value = null

    try {
      console.log(' Filtering by area code:', areaCode)
      
      const response = await api.get<PostOfficeResponse[]>(
        API_ENDPOINTS.POST_OFFICES_BY_AREA(areaCode),
        true
      )

      console.log(' Filtered response:', response)

      if (response.data) {
        const offices = response.data
          .map(convertToPostOffice)
          .filter(po => po.status === 'active')
        
        console.log(' Filtered offices:', offices)
        console.log(' Total filtered:', offices.length)
        
        postOffices.value = offices
        return offices
      }

      error.value = response.error || 'Không thể tải danh sách bưu cục'
      return []
    } catch (e) {
      console.error(' Exception in getPostOfficesByArea:', e)
      error.value = 'Đã xảy ra lỗi'
      return []
    } finally {
      isLoading.value = false
    }
  }

  /// Lấy thông tin 1 post office
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
      console.error(' Exception in getPostOfficeById:', e)
      error.value = 'Đã xảy ra lỗi'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /// Set selected post office
  const selectPostOffice = (postOffice: PostOffice | null) => {
    console.log(' Selecting post office:', postOffice)
    selectedPostOffice.value = postOffice
  }

  const clearError = () => {
    error.value = null
  }

  return {
    postOffices,
    selectedPostOffice,
    isLoading,
    error,
    getAllPostOffices,
    getPostOfficesByArea,
    getPostOfficeById,
    selectPostOffice,
    clearError,
  }
}