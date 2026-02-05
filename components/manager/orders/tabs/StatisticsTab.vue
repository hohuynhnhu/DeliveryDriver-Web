<script setup lang="ts">
import { computed } from 'vue'
import { BarChart3, TrendingUp, Package, CheckCircle } from 'lucide-vue-next'

interface Props {
  statistics: any
}

const props = defineProps<Props>()

const totalOrders = computed(() => {
  if (!props.statistics) return 0
  return props.statistics.pending_count + props.statistics.total_confirmed + props.statistics.picked_count
})

const completionRate = computed(() => {
  if (!props.statistics || totalOrders.value === 0) return 0
  return ((props.statistics.picked_count / totalOrders.value) * 100).toFixed(1)
})
</script>

<template>
  <div v-if="statistics" class="space-y-6">
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
        <div class="flex items-center justify-between mb-4">
          <Package class="w-10 h-10 text-blue-600" />
          <TrendingUp class="w-6 h-6 text-blue-400" />
        </div>
        <div class="text-3xl font-bold text-blue-900 mb-1">{{ totalOrders }}</div>
        <div class="text-sm text-blue-700">Tổng đơn hàng</div>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
        <div class="flex items-center justify-between mb-4">
          <CheckCircle class="w-10 h-10 text-green-600" />
          <TrendingUp class="w-6 h-6 text-green-400" />
        </div>
        <div class="text-3xl font-bold text-green-900 mb-1">{{ statistics.picked_count }}</div>
        <div class="text-sm text-green-700">Đã lấy hàng</div>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
        <div class="flex items-center justify-between mb-4">
          <BarChart3 class="w-10 h-10 text-purple-600" />
          <TrendingUp class="w-6 h-6 text-purple-400" />
        </div>
        <div class="text-3xl font-bold text-purple-900 mb-1">{{ completionRate }}%</div>
        <div class="text-sm text-purple-700">Tỷ lệ hoàn thành</div>
      </div>
    </div>

    <!-- Detailed Stats -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Chi tiết trạng thái</h3>
      
      <div class="space-y-4">
        <!-- Pending -->
        <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div>
            <div class="font-medium text-yellow-900">Chờ duyệt</div>
            <div class="text-sm text-yellow-700">Đơn hàng mới cần xét duyệt</div>
          </div>
          <div class="text-2xl font-bold text-yellow-900">{{ statistics.pending_count }}</div>
        </div>

        <!-- Confirmed Pickup -->
        <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div>
            <div class="font-medium text-blue-900">Cần lấy hàng</div>
            <div class="text-sm text-blue-700">Đơn PICKUP chờ gán tài xế</div>
          </div>
          <div class="text-2xl font-bold text-blue-900">{{ statistics.confirmed_pickup_count }}</div>
        </div>

        <!-- Confirmed Dropoff -->
        <div class="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div>
            <div class="font-medium text-purple-900">Sẵn sàng giao</div>
            <div class="text-sm text-purple-700">Đơn DROP_OFF có thể tạo lịch ngay</div>
          </div>
          <div class="text-2xl font-bold text-purple-900">{{ statistics.confirmed_dropoff_count }}</div>
        </div>

        <!-- Picked -->
        <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div>
            <div class="font-medium text-green-900">Đã lấy hàng</div>
            <div class="text-sm text-green-700">Sẵn sàng tạo lịch giao</div>
          </div>
          <div class="text-2xl font-bold text-green-900">{{ statistics.picked_count }}</div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Tiến độ xử lý</h3>
      
      <div class="relative pt-1">
        <div class="flex mb-2 items-center justify-between">
          <div>
            <span class="text-xs font-semibold inline-block text-blue-600">
              Hoàn thành
            </span>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold inline-block text-blue-600">
              {{ completionRate }}%
            </span>
          </div>
        </div>
        <div class="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-100">
          <div
            :style="{ width: completionRate + '%' }"
            class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          ></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12 text-gray-500">
    <BarChart3 class="w-16 h-16 mx-auto mb-4 opacity-30" />
    <p>Đang tải thống kê...</p>
  </div>
</template>