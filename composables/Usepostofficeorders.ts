import { ref, reactive, watch, computed } from 'vue'
import type { OrderSummary, OrderFilters } from '@/@type/order'

export function usePostOfficeOrders() {
  const api = useApi()
  const { postOfficeId } = useAuth()
  const searchId = ref('')

  const orders = ref<OrderSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const filters = reactive<OrderFilters>({
    status: undefined,
    pickup_status: undefined,
    order_type: undefined,
    pickup_area_code: undefined,
    skip: 0,
    limit: 10,
  })

  const totalLoaded = ref(0)
  const hasMore = ref(true)
// Client-side search by order ID
  const filteredOrders = computed(() => {
    const query = searchId.value.trim().toLowerCase()
    if (!query) return orders.value
    return orders.value.filter(o => o.id.toLowerCase().includes(query))
  })

  async function fetchOrders() {
    loading.value = true
    error.value = null

    try {
      // Lấy postOfficeId từ useAuth
      const id = postOfficeId.value

      if (!id) {
        error.value = 'Không tìm thấy mã bưu cục'
        orders.value = []
        loading.value = false
        return
      }

      // Build query string - chỉ gửi param có giá trị
      const params = new URLSearchParams()
      params.set('skip', String(filters.skip ?? 0))
      params.set('limit', String(filters.limit ?? 10))

      if (filters.status) params.set('status', filters.status)
      if (filters.pickup_status) params.set('pickup_status', filters.pickup_status)
      if (filters.order_type) params.set('order_type', filters.order_type)
      if (filters.pickup_area_code) params.set('pickup_area_code', filters.pickup_area_code)

      const response = await api.get<OrderSummary[]>(
        `/api/v1/orders/post-office/${id}/orders?${params.toString()}`,
        true 
      )

      if (response.data) {
        orders.value = response.data
        totalLoaded.value = response.data.length
        hasMore.value = response.data.length >= (filters.limit ?? 10)
      } else {
        error.value = response.error || 'Lỗi khi tải đơn hàng'
        orders.value = []
      }
    } catch (e: any) {
      error.value = e?.message || 'Đã xảy ra lỗi'
      orders.value = []
    } finally {
      loading.value = false
    }
  }

  // Filter helpers
  function setFilter(key: keyof OrderFilters, value: any) {
    ;(filters as any)[key] = value || undefined
    filters.skip = 0 // reset về trang đầu khi đổi filter
  }

  function resetFilters() {
    filters.status = undefined
    filters.pickup_status = undefined
    filters.order_type = undefined
    filters.pickup_area_code = undefined
    filters.skip = 0
  }

  // Pagination
  function nextPage() {
    if (hasMore.value) {
      filters.skip = (filters.skip ?? 0) + (filters.limit ?? 10)
      fetchOrders()
    }
  }

  function prevPage() {
    const limit = filters.limit ?? 10
    filters.skip = Math.max(0, (filters.skip ?? 0) - limit)
    fetchOrders()
  }

  const currentPage = computed(() => {
    const limit = filters.limit ?? 10
    return Math.floor((filters.skip ?? 0) / limit) + 1
  })

  // Auto-fetch khi filter thay đổi
  watch(
    () => ({ ...filters }),
    () => fetchOrders(),
    { immediate: true }
  )

  return {
    // State
    orders,
    loading,
    error,
    filters,
    hasMore,
    currentPage,
    filteredOrders,  
    searchId,        

    // Actions
    fetchOrders,
    setFilter,
    resetFilters,
    nextPage,
    prevPage,
  }
}