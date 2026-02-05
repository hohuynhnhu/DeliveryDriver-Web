<script setup lang="ts">
import { Package } from 'lucide-vue-next'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Không có đơn hàng'
})
</script>

<template>
  <div class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
    <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
    <p class="text-gray-500">{{ message }}</p>
  </div>
</template>