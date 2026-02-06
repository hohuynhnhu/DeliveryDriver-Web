<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, RefreshCw } from 'lucide-vue-next'
import OrderListHeader from '../OrderListHeader.vue'
import EmptyOrderState from '../EmptyOrderState.vue'
import OrderCard from '../OrderCard.vue'
import SelectedOrderBanner from '../SelectedOrderBanner.vue'
import OrderDetailPanel from '../OrderDetailPanel.vue'
import OrderSearchBar from '../OrderSearchBar.vue'
import LoadingSpinner from '../LoadingSpinner.vue'

interface Props {
  orders: any[]
  isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  selectOrder: [order: any]
  approve: [orderId: string, note: string]
  refresh: []
}>()

const searchQuery = ref('')
const selectedOrder = ref<any | null>(null)
const reviewNote = ref('')

const filteredOrders = computed(() => {
  if (!searchQuery.value) return props.orders
  return props.orders.filter(order => 
    order.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    order.pickup_point?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSelectOrder = (order: any) => {
  console.log(' Selected order object:', order)     
  console.log(' Order ID from object:', order.id)    
  console.log('Order ID length:', order.id?.length)
  emit('selectOrder', order)
}

const handleApprove = () => {
  if (!selectedOrder.value) {
    console.error('❌ No selected order!')
    return
  }
  
  console.log('Emitting approve with:', {
    orderId: selectedOrder.value.id,
    note: reviewNote.value
  })
  
  emit('approve', selectedOrder.value.id, reviewNote.value)
  
  // NOTE: Không clear ở đây - để parent xử lý sau khi API thành công
  // reviewNote.value = ''
}

const handleClose = () => {
  selectedOrder.value = null
  searchQuery.value = ''
  reviewNote.value = ''
}

defineExpose({
  setSelectedOrder: (order: any) => {
    selectedOrder.value = order
  },
  clearSelectedOrder: () => {
    selectedOrder.value = null
    reviewNote.value = ''
    searchQuery.value = ''
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Duyệt đơn hàng</h3>
    
    <OrderSearchBar v-model="searchQuery" />

    <LoadingSpinner v-if="isLoading && !selectedOrder" message="Đang tải danh sách đơn hàng..." />

    <div v-else-if="!selectedOrder" class="space-y-3 mb-6">
      <OrderListHeader 
        :count="filteredOrders.length" 
        :is-loading="isLoading"
        @refresh="emit('refresh')"
      />

      <EmptyOrderState 
        v-if="filteredOrders.length === 0" 
        message="Không có đơn hàng chờ duyệt" 
      />

      <OrderCard
        v-for="order in filteredOrders"
        :key="order.id"
        :order="order"
        variant="default"
        @select="handleSelectOrder"
      />
    </div>

    <div v-if="selectedOrder">
      <SelectedOrderBanner 
        :order-id="selectedOrder.id"
        variant="info"
        @close="handleClose"
      />

      <OrderDetailPanel :order="selectedOrder" />

      <form @submit.prevent="handleApprove" class="space-y-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú duyệt đơn</label>
          <textarea
            v-model="reviewNote"
            placeholder="Nhập ghi chú (tùy chọn)..."
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Check v-else class="w-5 h-5" />
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận duyệt' }}
        </button>
      </form>
    </div>
  </div>
</template>