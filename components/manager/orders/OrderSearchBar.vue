<script setup lang="ts">
import { Search } from 'lucide-vue-next'

const searchQuery = defineModel<string>()
</script>

<template>
  <div class="mb-4">
    <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm đơn hàng</label>
    <div class="relative">
      <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Tìm theo mã đơn hoặc địa chỉ..."
        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>
  </div>
</template>