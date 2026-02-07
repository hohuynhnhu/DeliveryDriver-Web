<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { BarChart3, TrendingUp, Package, CheckCircle, RefreshCw } from 'lucide-vue-next'

// ============================================================================
// COMPOSABLE
// ============================================================================
const { 
  statistics, 
  isLoading, 
  error, 
  fetchStatistics, 
  startAutoRefresh 
} = useOrderStatistics()

// ============================================================================
// COMPUTED
// ============================================================================
const totalOrders = computed(() => {
  if (!statistics.value) return 0
  return statistics.value.total_orders || 0
})

const completionRate = computed(() => {
  if (!statistics.value || totalOrders.value === 0) return 0
  const completed = statistics.value.completed_count || 0
  return ((completed / totalOrders.value) * 100).toFixed(1)
})

const pickupRate = computed(() => {
  if (!statistics.value || totalOrders.value === 0) return 0
  const picked = statistics.value.picked_count || 0
  return ((picked / totalOrders.value) * 100).toFixed(1)
})

// ============================================================================
// METHODS
// ============================================================================
const handleRefresh = async () => {
  await fetchStatistics()
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  await fetchStatistics()
  // Auto refresh mỗi 30 giây
  startAutoRefresh(30000)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header với nút Refresh -->
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">Thống kê đơn hàng</h2>
      <button
        @click="handleRefresh"
        :disabled="isLoading"
        class="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
      >
        <RefreshCw 
          class="w-4 h-4" 
          :class="{ 'animate-spin': isLoading }"
        />
        Làm mới
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      ⚠️ {{ error }}
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading && !statistics" class="text-center py-12 text-gray-500">
      <RefreshCw class="w-10 h-10 mx-auto mb-4 animate-spin text-glow-primary-500" />
      <p>Đang tải thống kê...</p>
    </div>

    <!-- Statistics Content -->
    <template v-else-if="statistics">
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
          <div class="text-3xl font-bold text-purple-900 mb-1">{{ pickupRate }}%</div>
          <div class="text-sm text-purple-700">Tỷ lệ lấy hàng</div>
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

          <!-- Confirmed Pickup Pending -->
          <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <div class="font-medium text-blue-900">Chờ lấy hàng</div>
              <div class="text-sm text-blue-700">Đơn đã duyệt, chờ tài xế lấy</div>
            </div>
            <div class="text-2xl font-bold text-blue-900">{{ statistics.confirmed_pickup_pending }}</div>
          </div>

          <!-- Confirmed Pickup Scheduled -->
          <div class="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div>
              <div class="font-medium text-indigo-900">Đã lên lịch lấy</div>
              <div class="text-sm text-indigo-700">Đã gán tài xế lấy hàng</div>
            </div>
            <div class="text-2xl font-bold text-indigo-900">{{ statistics.confirmed_pickup_scheduled || 0 }}</div>
          </div>

          <!-- Picked -->
          <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <div class="font-medium text-green-900">Đã lấy hàng</div>
              <div class="text-sm text-green-700">Sẵn sàng tạo lịch giao</div>
            </div>
            <div class="text-2xl font-bold text-green-900">{{ statistics.picked_count }}</div>
          </div>

          <!-- Completed -->
          <div class="flex items-center justify-between p-4 bg-teal-50 rounded-lg border border-teal-200">
            <div>
              <div class="font-medium text-teal-900">Hoàn thành</div>
              <div class="text-sm text-teal-700">Đã giao thành công</div>
            </div>
            <div class="text-2xl font-bold text-teal-900">{{ statistics.completed_count }}</div>
          </div>

          <!-- Cancelled -->
          <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <div class="font-medium text-red-900">Đã hủy</div>
              <div class="text-sm text-red-700">Đơn bị hủy</div>
            </div>
            <div class="text-2xl font-bold text-red-900">{{ statistics.cancelled_count }}</div>
          </div>
        </div>
      </div>

      <!-- Progress Bars -->
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tiến độ xử lý</h3>
        
        <div class="space-y-6">
          <!-- Pickup Progress -->
          <div>
            <div class="flex mb-2 items-center justify-between">
              <span class="text-sm font-medium text-green-700">Tỷ lệ lấy hàng</span>
              <span class="text-sm font-semibold text-green-700">{{ pickupRate }}%</span>
            </div>
            <div class="overflow-hidden h-3 rounded-full bg-green-100">
              <div
                :style="{ width: pickupRate + '%' }"
                class="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500 rounded-full"
              ></div>
            </div>
          </div>

          <!-- Completion Progress -->
          <div>
            <div class="flex mb-2 items-center justify-between">
              <span class="text-sm font-medium text-blue-700">Tỷ lệ hoàn thành</span>
              <span class="text-sm font-semibold text-blue-700">{{ completionRate }}%</span>
            </div>
            <div class="overflow-hidden h-3 rounded-full bg-blue-100">
              <div
                :style="{ width: completionRate + '%' }"
                class="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 rounded-full"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-gray-500">
      <BarChart3 class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>Không có dữ liệu thống kê</p>
    </div>
  </div>
</template>