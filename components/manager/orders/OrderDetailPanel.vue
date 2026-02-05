<script setup lang="ts">
import dayjs from 'dayjs'

interface Props {
  order: any
}

defineProps<Props>()

const getStatusColor = (status: string) => {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700' },
    completed: { bg: 'bg-green-100', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  }
  return colors[status] || { bg: 'bg-gray-100', text: 'text-gray-700' }
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string) => {
  return dayjs(dateStr).format('DD/MM/YYYY HH:mm')
}
</script>

<template>
  <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <h4 class="text-sm font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div>
        <p class="text-xs text-gray-600 mb-1">Trạng thái</p>
        <span
          :class="[
            'inline-block px-3 py-1 rounded-full text-xs font-semibold',
            getStatusColor(order.status).bg,
            getStatusColor(order.status).text
          ]"
        >
          {{ statusLabel(order.status) }}
        </span>
      </div>
      <div>
        <p class="text-xs text-gray-600 mb-1">Số kiện hàng</p>
        <p class="text-sm font-medium text-gray-900">{{ order.total_packages }} kiện</p>
      </div>
      <div>
        <p class="text-xs text-gray-600 mb-1">Thời gian tạo</p>
        <p class="text-sm text-gray-800">{{ formatDate(order.created_at) }}</p>
      </div>
    </div>
    
    <div class="mb-4">
      <p class="text-xs font-semibold text-gray-700 mb-2">Thông tin lấy hàng</p>
      <p class="text-sm text-gray-600">{{ order.pickup_point }}</p>
      <p class="text-sm text-gray-600">{{ order.pickup_address }}</p>
      <p class="text-sm text-gray-600">{{ order.pickup_phone }}</p>
    </div>
    
    <div v-if="order.pickup_note">
      <p class="text-xs text-gray-600 mb-1">Ghi chú</p>
      <p class="text-sm text-gray-800">{{ order.pickup_note }}</p>
    </div>
  </div>
</template>