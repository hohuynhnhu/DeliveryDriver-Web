<script setup lang="ts">
import { ref } from 'vue'
import { FileCheck, X } from 'lucide-vue-next'

interface Props {
  orders: any[]
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const { processOrder } = useOrder()

const selectedOrder = ref<any>(null)
const reviewNote = ref('')

const handleSelectOrder = (order: any) => {
  selectedOrder.value = order
  reviewNote.value = ''
}

const handleApprove = async () => {
  if (!selectedOrder.value) return

  const confirmed = confirm('Xác nhận duyệt đơn hàng này?')
  if (!confirmed) return

  const success = await processOrder(selectedOrder.value.id, 'approve', reviewNote.value)

  if (success) {
    alert(' Đã duyệt đơn hàng thành công!')
    selectedOrder.value = null
    reviewNote.value = ''
    emit('refresh')
  }
}

const handleReject = async () => {
  if (!selectedOrder.value) return

  const reason = prompt('Lý do từ chối:')
  if (!reason) return

  const success = await processOrder(selectedOrder.value.id, 'reject', reviewNote.value, reason)

  if (success) {
    alert(' Đã từ chối đơn hàng!')
    selectedOrder.value = null
    reviewNote.value = ''
    emit('refresh')
  }
}

const handleClose = () => {
  selectedOrder.value = null
  reviewNote.value = ''
}
</script>

<template>
  <div>
    <div v-if="!selectedOrder" class="space-y-3">
      <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
        <FileCheck class="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Không có đơn hàng chờ duyệt</p>
      </div>

      <div
        v-else
        v-for="order in orders"
        :key="order.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="handleSelectOrder(order)"
      >
        <div class="flex items-start justify-between">
          <div>
            <div class="font-semibold text-gray-900 mb-1">{{ order.id }}</div>
            <div class="text-sm text-gray-600">
              <p> {{ order.pickup_point }}</p>
              <p> {{ new Date(order.created_at).toLocaleString('vi-VN') }}</p>
            </div>
          </div>
          <span class="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Chờ duyệt
          </span>
        </div>
      </div>
    </div>

    <!-- DETAIL VIEW -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <span class="font-semibold text-blue-900">Đơn hàng: {{ selectedOrder.id }}</span>
        </div>
        <button @click="handleClose" class="text-blue-600 hover:text-blue-800">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="bg-white border border-gray-200 rounded-lg p-4">
        <h4 class="font-semibold mb-3">Thông tin đơn hàng</h4>
        <div class="space-y-2 text-sm">
          <p><strong>Địa chỉ lấy:</strong> {{ selectedOrder.pickup_point }}</p>
          <p><strong>Loại:</strong> {{ selectedOrder.order_type === 'pickup' ? 'Lấy hàng' : 'Giao hàng' }}</p>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú duyệt đơn</label>
        <textarea
          v-model="reviewNote"
          placeholder="Nhập ghi chú (tùy chọn)..."
          rows="3"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          @click="handleReject"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg"
        >
          Từ chối
        </button>
        <button
          @click="handleApprove"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg"
        >
          Duyệt đơn
        </button>
      </div>
    </div>
  </div>
</template>