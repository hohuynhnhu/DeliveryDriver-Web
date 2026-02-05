<script setup lang="ts">
import { ref, computed } from 'vue'
import { XCircle, RefreshCw } from 'lucide-vue-next'
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

// ✅ FIXED: Emit với orderId đầu tiên
const emit = defineEmits<{
  selectOrder: [order: any]
  reject: [orderId: string, reason: string, note: string]
  refresh: []
}>()

const searchQuery = ref('')
const selectedOrder = ref<any | null>(null)
const rejectReason = ref('')
const rejectNote = ref('')

const filteredOrders = computed(() => {
  if (!searchQuery.value) return props.orders
  return props.orders.filter(order => 
    order.id.toString().toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    order.pickup_point?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSelectOrder = (order: any) => {
  emit('selectOrder', order)
}

// ✅ FIXED: Emit với orderId
const handleReject = () => {
  if (!selectedOrder.value) {
    console.error('❌ No selected order!')
    return
  }
  
  if (!rejectReason.value.trim()) {
    alert('⚠️ Vui lòng nhập lý do từ chối!')
    return
  }
  
  console.log('🚫 Emitting reject with:', {
    orderId: selectedOrder.value.id,
    reason: rejectReason.value,
    note: rejectNote.value
  })
  
  emit('reject', selectedOrder.value.id, rejectReason.value, rejectNote.value)
}

const handleClose = () => {
  selectedOrder.value = null
  searchQuery.value = ''
  rejectReason.value = ''
  rejectNote.value = ''
}

defineExpose({
  setSelectedOrder: (order: any) => {
    selectedOrder.value = order
  },
  clearSelectedOrder: () => {
    selectedOrder.value = null
    rejectReason.value = ''
    rejectNote.value = ''
    searchQuery.value = ''
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Từ chối đơn hàng</h3>
    
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
        message="Không có đơn hàng để từ chối" 
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
        variant="warning"
        @close="handleClose"
      />

      <OrderDetailPanel :order="selectedOrder" />

      <form @submit.prevent="handleReject" class="space-y-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Lý do từ chối <span class="text-red-500">*</span>
          </label>
          <select
            v-model="rejectReason"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="">-- Chọn lý do --</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="invalid_address">Địa chỉ không hợp lệ</option>
            <option value="duplicate_order">Đơn hàng trùng lặp</option>
            <option value="fraud_suspected">Nghi ngờ gian lận</option>
            <option value="other">Lý do khác</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
          <textarea
            v-model="rejectNote"
            placeholder="Nhập ghi chú bổ sung (tùy chọn)..."
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isLoading || !rejectReason"
          class="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
          <XCircle v-else class="w-5 h-5" />
          {{ isLoading ? 'Đang xử lý...' : 'Xác nhận từ chối' }}
        </button>
      </form>
    </div>
  </div>
</template>