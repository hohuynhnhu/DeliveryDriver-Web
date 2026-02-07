<script setup lang="ts">
import { Package } from 'lucide-vue-next'
import dayjs from 'dayjs'

interface Props {
  order: any
  variant?: 'default' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const emit = defineEmits<{
  select: [order: any]
}>()

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

const getTimeAgo = (dateStr: string) => {
  return dayjs(dateStr).fromNow()
}

const borderColor = computed(() => {
  const colors = {
    default: 'hover:border-glow-primary-400',
    danger: 'hover:border-red-400',
    info: 'hover:border-blue-400'
  }
  return colors[props.variant]
})
</script>

<template>
  <div
    @click="emit('select', order)"
    :class="[
      'bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer',
      borderColor
    ]"
  >
    <div class="flex items-start justify-between mb-3">
      <div>
        <h5 class="font-semibold text-gray-900 text-sm">
          #{{ order.id.substring(0, 8) }}...
        </h5>
        
      </div>
      <span
        :class="[
          'px-3 py-1 rounded-full text-xs font-semibold',
          getStatusColor(order.status).bg,
          getStatusColor(order.status).text
        ]"
      >
        {{ statusLabel(order.status) }}
      </span>
    </div>

    <div class="mb-3">
      <p class="text-xs text-gray-500">Địa chỉ lấy hàng</p>
      <p class="text-sm text-gray-700 line-clamp-1">{{ order.pickup_point || 'Tại bưu cục' }}</p>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>{{ formatDate(order.created_at) }}</span>
      <span>{{ getTimeAgo(order.created_at) }}</span>
    </div>
  </div>
</template>