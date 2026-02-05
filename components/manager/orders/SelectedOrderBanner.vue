<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface Props {
  orderId: string
  variant?: 'info' | 'danger' | 'warning'|'edit'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'info',
  title: 'Đang xử lý'
})

const emit = defineEmits<{
  close: []
}>()

const variantClasses = computed(() => {
  const classes = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    danger: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
     edit: 'bg-orange-50 border-orange-200 text-orange-700'
  }
  return classes[props.variant]
})

const buttonClasses = computed(() => {
  const classes = {
    info: 'text-blue-600 hover:text-blue-800',
    danger: 'text-red-600 hover:text-red-800',
    warning: 'text-yellow-600 hover:text-yellow-800',
    edit:'text-green-600 hover:text-green-800',
  }
  return classes[props.variant]
})
</script>

<template>
  <div :class="['p-3 rounded-lg border mb-4 flex items-center justify-between', variantClasses]">
    <p class="text-sm">
      <strong>{{ title }}:</strong> Đơn hàng #{{ orderId.substring(0, 12) }}...
    </p>
    <button
      @click="emit('close')"
      :class="['text-sm font-medium', buttonClasses]"
    >
      Hủy chọn
    </button>
  </div>
</template>