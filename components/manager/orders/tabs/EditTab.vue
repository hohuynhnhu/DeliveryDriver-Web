<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Save, RefreshCw } from 'lucide-vue-next'
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
  save: [orderId: string, data: any]
  refresh: []
}>()

const searchQuery = ref('')
const selectedOrder = ref<any | null>(null)
const editedData = ref<any>({})

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

// Watch selectedOrder để khởi tạo editedData
watch(selectedOrder, (newOrder) => {
  if (newOrder) {
    editedData.value = {
      pickup_point: newOrder.pickup_point || '',
      delivery_address: newOrder.delivery_address || '',
      customer_phone: newOrder.customer_phone || '',
      customer_name: newOrder.customer_name || '',
      note: newOrder.note || ''
    }
  }
}, { immediate: true })

// ✅ FIXED: Emit với orderId
const handleSave = () => {
  if (!selectedOrder.value) {
    console.error('❌ No selected order!')
    return
  }
  
  console.log('💾 Emitting save with:', {
    orderId: selectedOrder.value.id,
    data: editedData.value
  })
  
  emit('save', selectedOrder.value.id, editedData.value)
}

const handleClose = () => {
  selectedOrder.value = null
  searchQuery.value = ''
  editedData.value = {}
}

defineExpose({
  setSelectedOrder: (order: any) => {
    selectedOrder.value = order
  },
  clearSelectedOrder: () => {
    selectedOrder.value = null
    editedData.value = {}
    searchQuery.value = ''
  }
})
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa đơn hàng</h3>
    
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
        message="Không có đơn hàng để chỉnh sửa" 
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
        variant="edit"
        @close="handleClose"
      />

      <OrderDetailPanel :order="selectedOrder" />

      <form @submit.prevent="handleSave" class="space-y-4 mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 class="font-semibold text-gray-900 mb-3">Chỉnh sửa thông tin</h4>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tên khách hàng</label>
          <input
            v-model="editedData.customer_name"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
          <input
            v-model="editedData.customer_phone"
            type="tel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Điểm lấy hàng</label>
          <input
            v-model="editedData.pickup_point"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ giao hàng</label>
          <textarea
            v-model="editedData.delivery_address"
            rows="2"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
          <textarea
            v-model="editedData.note"
            rows="2"
            placeholder="Ghi chú về đơn hàng..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          ></textarea>
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-yellow-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Save v-else class="w-5 h-5" />
          {{ isLoading ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
      </form>
    </div>
  </div>
</template>