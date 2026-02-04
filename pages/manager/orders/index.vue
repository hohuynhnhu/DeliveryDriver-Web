<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, Zap,  RefreshCw, AlertCircle } from 'lucide-vue-next'
import type { OrderSummary } from '@/@type/order'

definePageMeta({
  layout: 'manager'
})

/* ===== COMPOSABLES ===== */
const router = useRouter()
const { fetchPostOfficeOrders, isLoading, error } = useOrder()
const { user, postOfficeId } = useAuth()

/* ===== STATE ===== */
const emergencyOrders = ref<OrderSummary[]>([])
const selectedOrder = ref<OrderSummary | null>(null)

/* ===== COMPUTED ===== */
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

const pickupStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Chờ lấy hàng',
    scheduled: 'Đã lên lịch',
    picked: 'Đã lấy hàng',
    failed: 'Thất bại'
  }
  return labels[status] || status
}

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

const pickupStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    scheduled: 'bg-blue-100 text-blue-700',
    picked: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Tính thời gian đã trôi qua
const getTimeAgo = (dateStr: string) => {
  const now = new Date()
  const created = new Date(dateStr)
  const diffMs = now.getTime() - created.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  
  if (diffMins < 60) return `${diffMins} phút trước`
  if (diffHours < 24) return `${diffHours} giờ trước`
  return `${Math.floor(diffHours / 24)} ngày trước`
}

// Check xem có phải đơn khẩn cấp không (tạo từ hơn 2 giờ mà vẫn pending)
const isUrgent = (order: OrderSummary) => {
  if (order.status !== 'pending') return false
  
  const now = new Date()
  const created = new Date(order.created_at)
  const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
  
  return diffHours > 2 // Quá 2 giờ chưa xử lý
}

/* ===== METHODS ===== */
const loadEmergencyOrders = async () => {
  if (!postOfficeId.value) {
    error.value = 'Bạn chưa được gán bưu cục'
    return
  }

  // Lấy các đơn pending hoặc confirmed (cần xử lý khẩn)
  const pendingOrders = await fetchPostOfficeOrders({ 
    status: 'pending',
    limit: 50 
  })
  
  const confirmedOrders = await fetchPostOfficeOrders({ 
    status: 'confirmed',
    pickup_status: 'pending',
    limit: 50 
  })
  
  // Merge và sort theo thời gian tạo (mới nhất trước)
  emergencyOrders.value = [
    ...(pendingOrders || []),
    ...(confirmedOrders || [])
  ].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
  
  // Auto-select đơn đầu tiên
  if (emergencyOrders.value.length > 0 && !selectedOrder.value) {
    selectedOrder.value = emergencyOrders.value[0]
  }
}


const handleOrder = async (order: OrderSummary) => {
  // TODO: Implement xử lý đơn - chuyển sang màn hình chi tiết hoặc mở modal
  router.push(`/manager/orders/${order.id}`)
}

/* ===== LIFECYCLE ===== */
onMounted(() => {
  loadEmergencyOrders()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- STATS BAR -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Tổng đơn cần xử lý</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ emergencyOrders.length }}</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertCircle class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Đơn khẩn cấp (>2h)</p>
              <p class="text-2xl font-bold text-red-600 mt-1">
                {{ emergencyOrders.filter(o => isUrgent(o)).length }}
              </p>
            </div>
            <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Zap class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">Chờ lấy hàng</p>
              <p class="text-2xl font-bold text-blue-600 mt-1">
                {{ emergencyOrders.filter(o => o.pickup_status === 'pending').length }}
              </p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <p class="text-sm text-red-700">{{ error }}</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- DANH SÁCH ĐƠN -->
        <aside class="lg:col-span-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-gray-900">
                Đơn hàng khẩn cấp
                <span class="ml-2 text-sm font-normal text-gray-500">({{ emergencyOrders.length }})</span>
              </h2>
            </div>

            <!-- LOADING -->
            <div v-if="isLoading" class="text-center py-8">
              <RefreshCw class="w-8 h-8 mx-auto mb-2 text-glow-primary-500 animate-spin" />
              <p class="text-gray-500">Đang tải...</p>
            </div>

            <!-- EMPTY STATE -->
            <div v-else-if="emergencyOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p class="text-gray-500">Không có đơn hàng cần xử lý khẩn</p>
            </div>

            <!-- ORDERS LIST -->
            <ul v-else class="space-y-3 max-h-[600px] overflow-y-auto">
              <li
                v-for="order in emergencyOrders"
                :key="order.id"
                @click="selectedOrder = order"
                class="p-4 rounded-lg cursor-pointer border-2 transition-all hover:shadow-md relative"
                :class="[
                  selectedOrder?.id === order.id 
                    ? 'bg-glow-primary-50 border-glow-primary-400 shadow-sm' 
                    : 'border-gray-200 hover:border-glow-primary-200',
                  isUrgent(order) ? 'ring-2 ring-red-400 ring-offset-2' : ''
                ]"
              >
                <!-- URGENT BADGE -->
                <div v-if="isUrgent(order)" class="absolute -top-2 -right-2">
                  <div class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Zap class="w-3 h-3" />
                    KHẨN
                  </div>
                </div>

                <div class="flex justify-between items-start mb-2">
                  <span class="font-semibold text-gray-900 text-xs">
                    #{{ order.id.substring(0, 8) }}...
                  </span>
                  <span
                    class="px-2 py-0.5 text-xs font-semibold rounded-full"
                    :class="statusColor(order.status)"
                  >
                    {{ statusLabel(order.status) }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-700 mb-2 line-clamp-2">
                 {{ order.pickup_point }}
                </p>
                
                <div class="flex items-center justify-between text-xs">
                  <span
                    class="px-2 py-0.5 rounded-full"
                    :class="pickupStatusColor(order.pickup_status)"
                  >
                    {{ pickupStatusLabel(order.pickup_status) }}
                  </span>
                  <span class="text-gray-500">
                    {{ order.total_packages }} kiện
                  </span>
                </div>
                
                <div class="flex items-center justify-between mt-2">
                  <p class="text-xs text-gray-400">
                    {{ formatDate(order.created_at) }}
                  </p>
                  <p class="text-xs font-medium" :class="isUrgent(order) ? 'text-red-600' : 'text-gray-500'">
                    {{ getTimeAgo(order.created_at) }}
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <!-- CHI TIẾT ĐƠN -->
        <section class="lg:col-span-8">
          <div
            v-if="selectedOrder"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                Chi tiết đơn hàng
                <Zap v-if="isUrgent(selectedOrder)" class="w-5 h-5 text-red-500 animate-pulse" />
              </h2>
              <div class="flex gap-2">
                <span
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="statusColor(selectedOrder.status)"
                >
                  {{ statusLabel(selectedOrder.status) }}
                </span>
                <span
                  class="px-3 py-1 text-sm font-semibold rounded-full"
                  :class="pickupStatusColor(selectedOrder.pickup_status)"
                >
                  {{ pickupStatusLabel(selectedOrder.pickup_status) }}
                </span>
              </div>
            </div>

            <!-- URGENT WARNING -->
            <div v-if="isUrgent(selectedOrder)" class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div class="flex items-start gap-3">
                <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-sm font-semibold text-red-800">Đơn hàng khẩn cấp</p>
                  <p class="text-xs text-red-600 mt-1">
                    Đơn này đã tồn tại {{ getTimeAgo(selectedOrder.created_at) }} mà chưa được xử lý. Vui lòng ưu tiên!
                  </p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1">ID đơn hàng</p>
                <p class="text-sm font-mono font-semibold text-gray-900">{{ selectedOrder.id }}</p>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1">Địa chỉ lấy hàng</p>
                <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.pickup_point }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Thời gian tạo</p>
                  <p class="text-sm font-semibold text-gray-900">{{ formatDate(selectedOrder.created_at) }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ getTimeAgo(selectedOrder.created_at) }}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Tổng số kiện</p>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.total_packages }} kiện</p>
                </div>
              </div>

              <!-- ACTION BUTTONS -->
              <div class="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  @click="handleOrder(selectedOrder)"
                  class="flex-1 px-4 py-3 bg-gradient-to-r from-glow-primary-500 to-glow-primary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-glow-primary-500/30 transition-all"
                >
                  Xử lý ngay
                </button>
                <button
                  class="px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Package class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p class="text-gray-500 text-lg">Chọn một đơn hàng để xem chi tiết</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>