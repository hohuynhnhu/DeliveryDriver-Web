<script setup lang="ts">
import { RefreshCw } from 'lucide-vue-next'

interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'Đang tải...'
})
</script>

<template>
  <div class="text-center py-12">
    <RefreshCw class="w-8 h-8 mx-auto mb-3 text-glow-primary-500 animate-spin" />
    <p class="text-gray-500">{{ message }}</p>
  </div>
</template>