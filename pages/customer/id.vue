<script setup lang="ts">
import { Package, MapPin, Truck, Phone, User, Calendar, Clock, DollarSign, MessageSquare, CheckCircle, XCircle, AlertCircle, Navigation, Star, ChevronLeft, FileText, Send, Home, Building2, MapPinned } from 'lucide-vue-next'

definePageMeta({
  middleware: 'customer-auth'
})

const route = useRoute()
const showCancelModal = ref(false)
const cancelReason = ref('')
const rating = ref(0)
const showRatingModal = ref(false)

// Mock data đơn hàng
const order = ref({
  id: route.params.id || 'DH00123',
  status: 'shipping',
  statusText: 'Đang giao hàng',
  createdDate: '15/01/2026',
  createdTime: '14:30',
  estimatedTime: '16:00 - 16:30',
  
  sender: {
    name: 'Nguyễn Văn A',
    phone: '0909 000 111',
    address: '123 Nguyễn Văn A, P.5, Q.3, TP.HCM'
  },
  
  receiver: {
    name: 'Trần Thị B',
    phone: '0909 222 333',
    address: '456 Lê Lợi, Q.1, TP.HCM'
  },
  
  destinations: [
    { id: 1, name: 'Phạm Văn C', phone: '0909 444 555', address: '789 Hai Bà Trưng, Q.3, TP.HCM', completed: true },
    { id: 2, name: 'Lê Thị D', phone: '0909 666 777', address: '321 Võ Văn Tần, Q.3, TP.HCM', completed: false }
  ],
  
  vehicle: {
    type: 'Xe máy',
    icon: '🏍️',
    licensePlate: '59A-12345'
  },
  
  driver: {
    name: 'Nguyễn Văn Tài',
    phone: '0909 888 999',
    avatar: '👨‍💼',
    rating: 4.8,
    totalTrips: 1234
  },
  
  pricing: {
    baseFee: 30000,
    distanceFee: 20000,
    extraStops: 15000,
    total: 65000
  },
  
  note: 'Giao hàng cẩn thận, hàng dễ vỡ',
  
  timeline: [
    { time: '14:30', status: 'Đơn hàng đã được tạo', icon: FileText, color: 'green', completed: true },
    { time: '14:35', status: 'Tài xế đã nhận đơn', icon: User, color: 'blue', completed: true },
    { time: '14:45', status: 'Đã lấy hàng', icon: Package, color: 'purple', completed: true },
    { time: '15:20', status: 'Đang giao hàng', icon: Truck, color: 'yellow', completed: true },
    { time: '16:00', status: 'Giao hàng thành công', icon: CheckCircle, color: 'green', completed: false }
  ]
})

const getStatusBadge = (status: string) => {
  const badges: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Chờ xác nhận' },
    accepted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Đã nhận đơn' },
    picking: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Đang lấy hàng' },
    shipping: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Đang giao' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Hoàn thành' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Đã huỷ' }
  }
  return badges[status] || badges.pending
}

const handleCancelOrder = () => {
  if (cancelReason.value.trim()) {
    alert('Đơn hàng đã được huỷ!')
    showCancelModal.value = false
  }
}

const handleRating = () => {
  if (rating.value > 0) {
    alert(`Cảm ơn bạn đã đánh giá ${rating.value} sao!`)
    showRatingModal.value = false
  }
}

const badge = computed(() => getStatusBadge(order.value.status))
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

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
              Tạo lúc {{ order.createdDate }} - {{ order.createdTime }}
            </p>
          </div>
          <span :class="['px-4 py-2 rounded-lg font-semibold text-sm border-2', badge.bg, badge.text]">
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
              <div v-for="(item, idx) in order.timeline" :key="idx" class="flex gap-4 pb-8 last:pb-0">
                <!-- Timeline Line -->
                <div v-if="idx < order.timeline.length - 1" class="absolute left-6 top-12 w-0.5 bg-gray-200" 
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

            <div v-if="order.status === 'shipping'" class="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div class="flex items-center gap-3">
                <Clock class="w-5 h-5 text-purple-600" />
                <div>
                  <p class="font-semibold text-gray-900">Dự kiến giao hàng</p>
                  <p class="text-sm text-gray-600">{{ order.estimatedTime }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Địa chỉ -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-6">
              <MapPinned class="w-5 h-5 text-purple-600" />
              <h2 class="text-lg font-bold text-gray-900">Thông tin giao nhận</h2>
            </div>

            <div class="space-y-4">
              <!-- Người gửi -->
              <div class="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Send class="w-5 h-5 text-purple-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-purple-600 font-semibold mb-1">NGƯỜI GỬI</p>
                    <p class="font-bold text-gray-900">{{ order.sender.name }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ order.sender.address }}</p>
                    <div class="flex items-center gap-2 mt-2 text-sm">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="text-gray-700">{{ order.sender.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Điểm giao bổ sung -->
              <div
                v-for="(dest, idx) in order.destinations"
                :key="dest.id"
                class="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="flex items-start gap-3 flex-1">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Building2 class="w-5 h-5 text-blue-600" />
                    </div>
                    <div class="flex-1">
                      <p class="text-xs text-blue-600 font-semibold mb-1">ĐIỂM GIAO {{ idx + 1 }}</p>
                      <p class="font-bold text-gray-900">{{ dest.name }}</p>
                      <p class="text-sm text-gray-600 mt-1">{{ dest.address }}</p>
                      <div class="flex items-center gap-2 mt-2 text-sm">
                        <Phone class="w-4 h-4 text-gray-500" />
                        <span class="text-gray-700">{{ dest.phone }}</span>
                      </div>
                    </div>
                  </div>
                  <CheckCircle v-if="dest.completed" class="w-6 h-6 text-green-500 flex-shrink-0" />
                </div>
              </div>

              <!-- Người nhận -->
              <div class="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Home class="w-5 h-5 text-green-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-green-600 font-semibold mb-1">NGƯỜI NHẬN</p>
                    <p class="font-bold text-gray-900">{{ order.receiver.name }}</p>
                    <p class="text-sm text-gray-600 mt-1">{{ order.receiver.address }}</p>
                    <div class="flex items-center gap-2 mt-2 text-sm">
                      <Phone class="w-4 h-4 text-gray-500" />
                      <span class="text-gray-700">{{ order.receiver.phone }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Ghi chú -->
          <div v-if="order.note" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-4">
              <MessageSquare class="w-5 h-5 text-orange-600" />
              <h2 class="text-lg font-bold text-gray-900">Ghi chú</h2>
            </div>
            <p class="text-gray-700 bg-orange-50 p-4 rounded-lg">{{ order.note }}</p>
          </div>

        </div>

        <!-- Right Column - Driver & Pricing -->
        <div class="space-y-6">
          
          <!-- Thông tin tài xế -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-6">
              <Truck class="w-5 h-5 text-purple-600" />
              <h2 class="text-lg font-bold text-gray-900">Tài xế</h2>
            </div>

            <div class="text-center mb-6">
              <div class="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-5xl">
                {{ order.driver.avatar }}
              </div>
              <h3 class="font-bold text-gray-900 text-lg">{{ order.driver.name }}</h3>
              <div class="flex items-center justify-center gap-1 mt-2">
                <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span class="font-semibold text-gray-900">{{ order.driver.rating }}</span>
                <span class="text-sm text-gray-500">({{ order.driver.totalTrips }} chuyến)</span>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Phương tiện</span>
                <span class="font-semibold text-gray-900">{{ order.vehicle.type }} {{ order.vehicle.icon }}</span>
              </div>
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">Biển số xe</span>
                <span class="font-semibold text-gray-900">{{ order.vehicle.licensePlate }}</span>
              </div>
              <a
                :href="`tel:${order.driver.phone}`"
                class="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg shadow-green-500/30"
              >
                <Phone class="w-5 h-5" />
                Gọi tài xế
              </a>
            </div>
          </div>

          <!-- Chi phí -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-6">
              <DollarSign class="w-5 h-5 text-purple-600" />
              <h2 class="text-lg font-bold text-gray-900">Chi phí</h2>
            </div>

            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Phí cơ bản</span>
                <span class="font-semibold text-gray-900">{{ order.pricing.baseFee.toLocaleString() }}đ</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">Phí quãng đường</span>
                <span class="font-semibold text-gray-900">{{ order.pricing.distanceFee.toLocaleString() }}đ</span>
              </div>
              <div v-if="order.destinations.length > 0" class="flex items-center justify-between">
                <span class="text-gray-600">Phí điểm dừng ({{ order.destinations.length }})</span>
                <span class="font-semibold text-gray-900">{{ order.pricing.extraStops.toLocaleString() }}đ</span>
              </div>
              <div class="border-t border-gray-200 pt-3 mt-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-900">Tổng cộng</span>
                  <span class="font-bold text-purple-600 text-xl">{{ order.pricing.total.toLocaleString() }}đ</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
            <button
              v-if="order.status === 'shipping'"
              @click="showCancelModal = true"
              class="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-lg shadow-red-500/30"
            >
              <XCircle class="w-5 h-5" />
              Huỷ đơn hàng
            </button>

            <button
              v-if="order.status === 'completed'"
              @click="showRatingModal = true"
              class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-semibold shadow-lg shadow-yellow-500/30"
            >
              <Star class="w-5 h-5" />
              Đánh giá dịch vụ
            </button>

            <button class="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold">
              <MessageSquare class="w-5 h-5" />
              Hỗ trợ
            </button>
          </div>

        </div>
      </div>

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
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Đóng
          </button>
          <button
            @click="handleCancelOrder"
            class="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Xác nhận huỷ
          </button>
        </div>
      </div>
    </div>

    <!-- Rating Modal -->
    <div v-if="showRatingModal" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl max-w-md w-full p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star class="w-8 h-8 text-yellow-500" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Đánh giá tài xế</h3>
          <p class="text-gray-600">Trải nghiệm của bạn thế nào?</p>
        </div>
        
        <div class="flex justify-center gap-2 mb-6">
          <button
            v-for="star in [1, 2, 3, 4, 5]"
            :key="star"
            @click="rating = star"
            class="transition-transform hover:scale-110"
          >
            <Star
              :class="[
                'w-12 h-12',
                star <= rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              ]"
            />
          </button>
        </div>

        <div class="flex gap-3">
          <button
            @click="showRatingModal = false"
            class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Để sau
          </button>
          <button
            @click="handleRating"
            :disabled="rating === 0"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>

  </main>
</template>