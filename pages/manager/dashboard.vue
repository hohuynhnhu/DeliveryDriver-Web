<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Package, Users, AlertCircle, Zap, ShoppingCart, CheckCircle2, BadgeCheck, CircleX } from 'lucide-vue-next'
import type { OrderSummary } from '@/@type/order'

definePageMeta({
  layout: 'manager'
})

const { user } = useAuth()

// ============================================================================
// COMPOSABLES
// ============================================================================
const { 
  fetchStatistics, 
  statistics, 
  isLoading: statsLoading,
  error: statsError,
  startAutoRefresh
} = useOrderStatistics()

const {
  orders,
  loading: ordersLoading,
  error: ordersError,
  filters,
  setFilter,
  resetFilters,
  fetchOrders
} = usePostOfficeOrders()

// ============================================================================
// STATE
// ============================================================================
const recentOrders = computed(() => {
  // Lấy 5 đơn hàng đầu tiên từ orders
  return orders.value.slice(0, 5)
})

// ============================================================================
// COMPUTED - STATS CARDS
// ============================================================================
const stats = computed(() => {
  if (!statistics.value) return []
  
  return [
    { 
      title: 'Tổng đơn hàng', 
      value: statistics.value.total_orders,
      icon: ShoppingCart,
      color: 'blue'
    },
    { 
      title: 'Chờ duyệt', 
      value: statistics.value.pending_count,
      icon: AlertCircle,
      color: 'orange'
    },
    { 
      title: 'Đã duyệt', 
      value: statistics.value.confirmed_count,
      icon: BadgeCheck,
      color: 'purple'
    },
    {
      title: 'Đã hủy',
      value: statistics.value.cancelled_count,
      icon: CircleX,
      color:'red'
    },
    { 
      title: 'Đã lấy hàng', 
      value: statistics.value.picked_count,
      icon: Package,
      color: 'blue'
    },
    {
      title:'Hoàn thành',
      value: statistics.value.completed_count,
      icon: CheckCircle2,
      color:'green'
    },
  ]
})

// Tổng hợp loading state
const isLoading = computed(() => statsLoading.value || ordersLoading.value)

// ============================================================================
// METHODS
// ============================================================================
const loadRecentOrders = async () => {
  try {
    // Set filter để lấy đơn hàng pending, limit 5
    setFilter('status', 'pending')
    setFilter('limit', 5)
    
    // fetchOrders sẽ tự động được gọi do watch trong composable
    // hoặc gọi thủ công nếu cần:
    await fetchOrders()
    
    console.log('📦 Recent orders loaded:', recentOrders.value.length)
  } catch (e) {
    console.error('❌ Error loading recent orders:', e)
  }
}

const loadData = async () => {
  try {
    // Load statistics từ composable
    await fetchStatistics()
    
    // Load recent orders
    await loadRecentOrders()
    
    console.log('✅ Dashboard loaded:', {
      stats: statistics.value,
      orders: recentOrders.value.length
    })
  } catch (e) {
    console.error('❌ Error loading dashboard:', e)
  }
}

const refreshData = async () => {
  await loadData()
}

// ============================================================================
// HELPERS
// ============================================================================
const statusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const statusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Chờ duyệt',
    confirmed: 'Đã duyệt',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(async () => {
  // Load dữ liệu ban đầu
  await loadData()
  
  // Bật auto-refresh mỗi 30 giây
  startAutoRefresh(30000)
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header với nút Refresh -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p class="text-gray-500 text-sm mt-1">Tổng quan quản lý đơn hàng</p>
        </div>
        <button
          @click="refreshData"
          :disabled="isLoading"
          class="px-4 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg 
            class="w-4 h-4" 
            :class="{ 'animate-spin': isLoading }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isLoading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>

      <!-- Error State -->
      <div v-if="statsError || ordersError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-700 text-sm">⚠️ {{ statsError || ordersError }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !statistics" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-glow-primary-500 mx-auto"></div>
        <p class="text-gray-500 mt-4">Đang tải dữ liệu...</p>
      </div>

      <template v-else>
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-2 mb-10">
          <div
            v-for="(stat, index) in stats"
            :key="index"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-glow-primary-200"
          >
            <div class="flex items-center justify-between mb-4">
              <div 
                class="w-12 h-12 rounded-lg flex items-center justify-center"
                :class="{
                  'bg-blue-100': stat.color === 'blue',
                  'bg-green-100': stat.color === 'green',
                  'bg-purple-100': stat.color === 'purple',
                  'bg-orange-100': stat.color === 'orange',
                  'bg-red-100': stat.color === 'red'
                }"
              >
                <component 
                  :is="stat.icon" 
                  class="w-6 h-6"
                  :class="{
                    'text-blue-600': stat.color === 'blue',
                    'text-green-600': stat.color === 'green',
                    'text-purple-600': stat.color === 'purple',
                    'text-orange-600': stat.color === 'orange',
                    'text-red-600': stat.color === 'red'
                  }"
                />
              </div>
            </div>
            <h3 class="text-gray-600 text-sm font-medium mb-1">{{ stat.title }}</h3>
            <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 class="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NuxtLink
              to="/manager/orders/management"
              class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-primary-500 hover:bg-glow-primary-50 transition-all group"
            >
              <div class="w-10 h-10 bg-glow-primary-100 rounded-lg flex items-center justify-center group-hover:bg-glow-primary-200 transition-colors">
                <Package class="w-5 h-5 text-glow-primary-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Quản lý đơn hàng</p>
                <p class="text-sm text-gray-500">Tiến trình đơn hàng</p>
              </div>
            </NuxtLink>
            <NuxtLink
              to="/manager/orders/emergency"
              class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
            >
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <Zap class="w-5 h-5 text-red-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Xử lý đột xuất</p>
                <p class="text-sm text-gray-500">Đơn khẩn cấp</p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/manager/schedules"
              class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
            >
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Users class="w-5 h-5 text-purple-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Phân công</p>
                <p class="text-sm text-gray-500">Gán tài xế</p>
              </div>
            </NuxtLink>

            <NuxtLink
              to="/manager/orders"
              class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <CheckCircle2 class="w-5 h-5 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-gray-900">Duyệt đơn</p>
                <p class="text-sm text-gray-500">Xét duyệt nhanh</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-bold text-gray-900">Đơn hàng gần đây</h3>
            <NuxtLink
              to="/manager/orders/management"
              class="text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium"
            >
              Xem tất cả →
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-if="recentOrders.length === 0" class="text-center py-12 text-gray-500">
            <Package class="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Chưa có đơn hàng nào</p>
          </div>

          <!-- Orders Table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã đơn</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Địa chỉ lấy</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày tạo</th>
                  <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="order in recentOrders" 
                  :key="order.id"
                  class="border-b border-gray-100 hover:bg-glow-primary-50/50 transition-colors"
                >
                  <td class="py-3 px-4 text-sm font-medium text-gray-900">
                    #{{ order.id.substring(0, 8) }}...
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-700">{{ order.pickup_point || 'Tại bưu cục'}}</td>
                  <td class="py-3 px-4">
                    <span 
                      class="px-3 py-1 text-xs font-semibold rounded-full"
                      :class="statusColor(order.status)"
                    >
                      {{ statusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-sm text-gray-500">{{ formatDate(order.created_at) }}</td>
                  <td class="py-3 px-4">
                    <NuxtLink
                      :to="`/manager/orders/${order.id}`"
                      class="text-glow-primary-600 hover:text-glow-primary-700 text-sm font-medium"
                    >
                      Chi tiết
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>