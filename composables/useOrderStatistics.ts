// composables/useOrderStatistics.ts

import type { OrderStatistics } from '@/@type/order'

export const useOrderStatistics = () => {
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const statistics = ref<OrderStatistics | null>(null)

  /**
   * Lấy thống kê đơn hàng - GỌI TRỰC TIẾP SUPABASE RPC
   * Siêu nhanh - 1 query duy nhất
   */
  const fetchStatistics = async (): Promise<OrderStatistics | null> => {
    // ✅ LAZY INIT - Chỉ gọi useSupabaseClient() khi thực thi function
    const supabase = useSupabaseClient()
    const { postOfficeId } = useAuth()
    
    if (!postOfficeId.value) {
      error.value = 'Không tìm thấy post_office_id'
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const { data, error: rpcError } = await supabase
        .schema('delivery')
        .rpc('get_order_statistics', {
          p_post_office_id: postOfficeId.value
        })

      if (rpcError) {
        console.error('❌ RPC Error:', rpcError)
        error.value = rpcError.message
        return null
      }

      console.log('✅ Statistics loaded:', data)
      statistics.value = data as OrderStatistics
      return data as OrderStatistics

    } catch (e: any) {
      console.error('❌ Error fetching statistics:', e)
      error.value = e.message || 'Lỗi khi tải thống kê'
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Auto-refresh statistics mỗi X giây
   */
  const startAutoRefresh = (intervalMs: number = 30000) => {
    const interval = setInterval(() => {
      fetchStatistics()
    }, intervalMs)

    // Cleanup khi component unmount
    onUnmounted(() => {
      clearInterval(interval)
    })

    return interval
  }

  return {
    isLoading,
    error,
    statistics,
    fetchStatistics,
    startAutoRefresh
  }
}