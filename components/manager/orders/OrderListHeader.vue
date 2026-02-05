<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

interface Props {
  count: number
  isLoading?: boolean
}

defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-2">
    <h4 class="text-sm font-semibold text-gray-700">
      Đơn hàng ({{ count }})
    </h4>
    <button 
      @click="emit('refresh')"
      :disabled="isLoading"
      class="text-sm text-glow-primary-600 hover:text-glow-primary-700 flex items-center gap-1 disabled:opacity-50"
    >
      <RefreshCw :class="['w-4 h-4', isLoading && 'animate-spin']" />
      Tải lại
    </button>
  </div>
</template>