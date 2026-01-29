<script setup lang="ts">
import { Package, MapPin, Truck, Phone, User, Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle, Navigation, ChevronLeft, FileText, Send, Home, Building2, MapPinned } from 'lucide-vue-next'
import type { OrderResponse, OrderDetailResponse } from '@/@type/order'

definePageMeta({
    layout:false
})

const route = useRoute()
const router = useRouter()
const { getOrderById, cancelOrder, isLoading, error } = useOrder()
const { user } = useAuth()

const showCancelModal = ref(false)
const cancelReason = ref('')
const isCancelling = ref(false)

// Dữ liệu đơn hàng
const order = ref<OrderResponse | null>(null)

// Load chi tiết đơn hàng
const loadOrderDetail = async () => {
  const orderId = route.params.id as string
  const result = await getOrderById(orderId)
  
  if (result) {
    order.value = result
  }
}

onMounted(() => {
  loadOrderDetail()
})

const getStatusBadge = (status: string) => {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
    processing: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang xử lý' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã huỷ' }
  }
  return badges[status] || badges.pending
}

const getDetailStatusBadge = (status: string) => {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xử lý' },
    confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã xác nhận' },
    picking: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đang lấy hàng' },
    picked_up: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Đã lấy hàng' },
    delivering: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang giao' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Đã giao' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã huỷ' }
  }
  return badges[status] || badges.pending
}

const handleCancelOrder = async () => {
  if (!cancelReason.value.trim() || !user.value?.id || !order.value?.id) {
    return
  }

  isCancelling.value = true
  const success = await cancelOrder(order.value.id, user.value.id, cancelReason.value)
  
  if (success) {
    showCancelModal.value = false
    cancelReason.value = ''
    // Reload order detail
    await loadOrderDetail()
  }
  
  isCancelling.value = false
}

const badge = computed(() => order.value ? getStatusBadge(order.value.status) : null)

// Format ngày tháng
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN')
}

const formatTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return `${formatDate(dateString)} - ${formatTime(dateString)}`
}

// Timeline steps
const timelineSteps = computed(() => {
  if (!order.value) return []
  
  const steps = [
    {
      time: formatDateTime(order.value.created_at),
      status: 'Đơn hàng đã được tạo',
      icon: FileText,
      completed: true
    }
  ]

  // Kiểm tra trạng thái để thêm các bước
  if (['confirmed', 'processing', 'completed'].includes(order.value.status)) {
    steps.push({
      time: 'Đã xác nhận',
      status: 'Đơn hàng đã được xác nhận',
      icon: CheckCircle,
      completed: true
    })
  }

  if (['processing', 'completed'].includes(order.value.status)) {
    steps.push({
      time: 'Đang xử lý',
      status: 'Đang xử lý đơn hàng',
      icon: Truck,
      completed: true
    })
  }

  if (order.value.status === 'completed') {
    steps.push({
      time: 'Hoàn thành',
      status: 'Đơn hàng đã hoàn thành',
      icon: Package,
      completed: true
    })
  }

  if (order.value.status === 'cancelled') {
    steps.push({
      time: 'Đã huỷ',
      status: 'Đơn hàng đã bị huỷ',
      icon: XCircle,
      completed: true
    })
  }

  return steps
})

// Kiểm tra có thể hủy đơn không
const canCancelOrder = computed(() => {
  return order.value && ['pending', 'confirmed'].includes(order.value.status)
})
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <AlertCircle class="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 class="text-xl font-bold text-gray-900 mb-2">Không thể tải đơn hàng</h2>
          <p class="text-gray-600 mb-6">{{ error }}</p>
          <NuxtLink
            to="/customer/orders"
            class="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium"
          >
            <ChevronLeft class="w-5 h-5" />
            Quay lại danh sách
          </NuxtLink>
        </div>
      </div>

      <!-- Order Detail -->
      <template v-else-if="order">
        <!-- Header -->
        <div class="mb-6">
          <NuxtLink to="/customer/orders" class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4">
            <ChevronLeft class="w-5 h-5" />
            <span class="font-medium">Quay lại danh sách</span>
          </NuxtLink>
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Package class="w-6 h-6 text-white" />
                </div>
                Đơn hàng #{{ order.id }}
              </h1>
              <p class="text-gray-600 mt-1 ml-15">
                Tạo lúc {{ formatDateTime(order.created_at) }}
              </p>
            </div>
            <span v-if="badge" :class="['px-4 py-2 rounded-lg font-semibold text-sm border-2', badge.bg, badge.text]">
              {{ badge.label }}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Left Column - Main Info -->
          <div class="lg:col-span-2 space-y-6">
            
            <!-- Timeline Tracking -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center gap-3 mb-6">
                <Navigation class="w-5 h-5 text-purple-600" />
                <h2 class="text-lg font-bold text-gray-900">Theo dõi đơn hàng</h2>
              </div>

              <div class="relative">
                <div v-for="(item, idx) in timelineSteps" :key="idx" class="flex gap-4 pb-8 last:pb-0">
                  <!-- Timeline Line -->
                  <div v-if="idx < timelineSteps.length - 1" class="absolute left-6 top-12 w-0.5 bg-gray-200" 
                       style="height: calc(100% - 48px)" />
                  
                  <!-- Icon -->
                  <div :class="[
                    'relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    item.completed 
                      ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30' 
                      : 'bg-gray-200'
                  ]">
                    <component :is="item.icon" :class="['w-6 h-6', item.completed ? 'text-white' : 'text-gray-500']" />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 pt-2">
                    <p :class="['font-semibold', item.completed ? 'text-gray-900' : 'text-gray-500']">
                      {{ item.status }}
                    </p>
                    <p class="text-sm text-gray-500 mt-1">{{ item.time }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Thông tin lấy hàng -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center gap-3 mb-6">
                <MapPinned class="w-5 h-5 text-purple-600" />
                <h2 class="text-lg font-bold text-gray-900">Thông tin lấy hàng</h2>
              </div>

              <div class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Send class="w-5 h-5 text-purple-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-purple-600 font-semibold mb-1">ĐIỂM LẤY HÀNG</p>
                    <p class="font-bold text-gray-900">{{ order.pickup_point }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ order.pickup_address }}</p>
                    <p class="text-xs text-gray-500 mt-1">Mã khu vực: {{ order.pickup_area_code }}</p>
                    <div class="flex items-center gap-2 mt-2 text-sm">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="text-gray-700">{{ order.pickup_phone }}</span>
                    </div>
                    <div v-if="order.pickup_note" class="mt-2 p-2 bg-white rounded text-sm">
                      <p class="text-gray-600">
                        <span class="font-semibold">Ghi chú:</span> {{ order.pickup_note }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Danh sách điểm giao hàng -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center gap-3 mb-6">
                <Building2 class="w-5 h-5 text-purple-600" />
                <h2 class="text-lg font-bold text-gray-900">
                  Điểm giao hàng ({{ order.order_details?.length || 0 }})
                </h2>
              </div>

              <div class="space-y-4">
                <div
                  v-for="(detail, idx) in order.order_details"
                  :key="detail.id"
                  class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500"
                >
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <div class="flex items-start gap-3 flex-1">
                      <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="font-bold text-blue-600">{{ idx + 1 }}</span>
                      </div>
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <p class="text-xs text-blue-600 font-semibold">ĐIỂM GIAO {{ idx + 1 }}</p>
                          <span 
                            :class="['px-2 py-0.5 rounded-full text-xs font-semibold border', 
                              getDetailStatusBadge(detail.status).bg,
                              getDetailStatusBadge(detail.status).text
                            ]"
                          >
                            {{ getDetailStatusBadge(detail.status).label }}
                          </span>
                        </div>
                        <p class="font-bold text-gray-900">{{ detail.start_point }}</p>
                        <p class="text-sm text-gray-600 mt-1">{{ detail.address_detail }}</p>
                        <p class="text-xs text-gray-500 mt-1">Mã khu vực: {{ detail.area_code }}</p>
                        <p class="text-xs text-gray-500">Độ ưu tiên: {{ detail.priority_score }}</p>
                        <div v-if="detail.note" class="mt-2 p-2 bg-white rounded text-sm">
                          <p class="text-gray-600">
                            <span class="font-semibold">Ghi chú:</span> {{ detail.note }}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CheckCircle v-if="detail.status === 'completed'" class="w-6 h-6 text-green-500 flex-shrink-0" />
                  </div>

                  <!-- Timestamps -->
                  <div class="flex flex-wrap gap-4 text-xs text-gray-600 mt-3 pt-3 border-t border-blue-200">
                    <div v-if="detail.create_at">
                      <span class="font-semibold">Tạo:</span> {{ formatDateTime(detail.create_at) }}
                    </div>
                    <div v-if="detail.confirmed_at">
                      <span class="font-semibold">Xác nhận:</span> {{ formatDateTime(detail.confirmed_at) }}
                    </div>
                    <div v-if="detail.finish_at">
                      <span class="font-semibold">Hoàn thành:</span> {{ formatDateTime(detail.finish_at) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column - Info -->
          <div class="space-y-6">
            
            <!-- Thông tin đơn hàng -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div class="flex items-center gap-3 mb-6">
                <FileText class="w-5 h-5 text-purple-600" />
                <h2 class="text-lg font-bold text-gray-900">Thông tin</h2>
              </div>

              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">Loại đơn hàng</span>
                  <span class="font-semibold text-gray-900">
                    {{ order.order_type === 'pickup' ? 'Lấy hàng' : 'Gửi hàng' }}
                  </span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">Bưu cục</span>
                  <span class="font-semibold text-gray-900">{{ order.post_office_id }}</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span class="text-sm text-gray-600">Số điểm giao</span>
                  <span class="font-semibold text-gray-900">{{ order.order_details?.length || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-3">
              <button
                v-if="canCancelOrder"
                @click="showCancelModal = true"
                class="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/30"
              >
                <XCircle class="w-5 h-5" />
                Huỷ đơn hàng
              </button>

              <NuxtLink
                to="/customer/orders"
                class="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                <ChevronLeft class="w-5 h-5" />
                Quay lại danh sách
              </NuxtLink>
            </div>

          </div>
        </div>
      </template>

    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle class="w-6 h-6 text-red-600" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Huỷ đơn hàng</h3>
        </div>
        <p class="text-gray-600 mb-4">Vui lòng cho chúng tôi biết lý do huỷ đơn:</p>
        <textarea
          v-model="cancelReason"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          rows="4"
          placeholder="Nhập lý do huỷ đơn..."
        />
        <div class="flex gap-3 mt-6">
          <button
            @click="showCancelModal = false"
            :disabled="isCancelling"
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            @click="handleCancelOrder"
            :disabled="!cancelReason.trim() || isCancelling"
            class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isCancelling ? 'Đang huỷ...' : 'Xác nhận huỷ' }}
          </button>
        </div>
      </div>
    </div>

  </main>
</template>