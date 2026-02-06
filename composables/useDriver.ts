// composables/useDriver.ts
import type { Driver } from '@/@type/driver'


export const useDriver = () => {
  const api = useApi()
  const { postOfficeId } = useAuth()

  const isLoading = useState<boolean>('driver_loading', () => false)
  const error = useState<string | null>('driver_error', () => null)

  /**
   * Lấy tất cả tài xế của bưu cục
   */
  const getAllDrivers = async (): Promise<Driver[]> => {
    if (!postOfficeId.value) {
      console.warn(' [useDriver] No post_office_id available')
      return []
    }

    isLoading.value = true
    error.value = null

    try {
      console.log(' [useDriver] Fetching drivers for post_office:', postOfficeId.value)
      
      const response = await api.get<Driver[]>(
        `/api/v1/drivers/post_office/${postOfficeId.value}`,
        true
      )

      console.log(' [useDriver] Raw response:', response)

      // Handle response structure
      const apiResponse = response as any
      let drivers: Driver[] = []
      
      // Case 1: response = { data: [...] }
      if (apiResponse?.data && Array.isArray(apiResponse.data)) {
        drivers = apiResponse.data
      }
      // Case 2: response = [...]
      else if (Array.isArray(apiResponse)) {
        drivers = apiResponse
      }
      // Case 3: response = { data: { data: [...] } }
      else if (apiResponse?.data?.data && Array.isArray(apiResponse.data.data)) {
        drivers = apiResponse.data.data
      }
      
      console.log(' [useDriver] Loaded drivers:', drivers.length)
      
      return drivers
    } catch (e) {
      console.error(' [useDriver] Error fetching drivers:', e)
      error.value = 'Không thể tải danh sách tài xế'
      return []
    } finally {
      isLoading.value = false
    }
  }

  const getAvailableDrivers = async (date?: string): Promise<Driver[]> => {
    const allDrivers = await getAllDrivers()
    
    // Filter by status
    return allDrivers.filter(driver => driver.status === 'available')
  }

  return {
    isLoading,
    error,
    getAvailableDrivers,
    getAllDrivers
  }
}