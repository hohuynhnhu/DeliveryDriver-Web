<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  Check,
  X,
  Edit2,
  Trash2,
  Package,
  Home,
  UserCheck,
  Activity,
  Zap,
  LogOut,
  Clock,
  Search,
} from 'lucide-vue-next'

// Vô hiệu hóa layout mặc định
definePageMeta({
  layout: false
});

const route = useRoute()
const router = useRouter()

type OrderStatus =
  | 'Pending'
  | 'Approved'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected'

interface OrderHistory {
  time: string
  action: string
}

interface Order {
  id: number
  customer: string
  status: OrderStatus
  note?: string
  sender: string
  receiver: string
  pickupAddress: string
  deliveryAddress: string
  senderPhone: string
  receiverPhone: string
  vehicleType: string
  history: OrderHistory[]
}

const activeTab = ref('duyet')

// Danh sách đơn hàng - sẽ được load từ API/database
const pendingOrders = ref<Order[]>([
  {
    id: 1001,
    customer: 'Nguyễn Văn A',
    status: 'Pending',
    note: 'Giao hàng trước 18h',
    sender: 'Nguyễn Văn A',
    receiver: 'Trần Thị B',
    pickupAddress: '123 Đường ABC, Q1, TP.HCM',
    deliveryAddress: '456 Đường XYZ, Q2, TP.HCM',
    senderPhone: '0901234567',
    receiverPhone: '0907654321',
    vehicleType: 'car',
    history: [
      { time: '2026-01-21 08:30', action: 'Khách hàng đặt đơn' }
    ],
  },
  {
    id: 1002,
    customer: 'Lê Thị C',
    status: 'Pending',
    note: 'Hàng dễ vỡ, cẩn thận',
    sender: 'Lê Thị C',
    receiver: 'Phạm Văn D',
    pickupAddress: '789 Đường DEF, Q3, TP.HCM',
    deliveryAddress: '321 Đường GHI, Q5, TP.HCM',
    senderPhone: '0902345678',
    receiverPhone: '0908765432',
    vehicleType: 'bike',
    history: [
      { time: '2026-01-21 09:15', action: 'Khách hàng đặt đơn' }
    ],
  },
  {
    id: 1003,
    customer: 'Hoàng Minh E',
    status: 'Pending',
    note: 'Giao ngoài giờ hành chính',
    sender: 'Hoàng Minh E',
    receiver: 'Nguyễn Thị F',
    pickupAddress: '555 Đường JKL, Q7, TP.HCM',
    deliveryAddress: '888 Đường MNO, Q9, TP.HCM',
    senderPhone: '0903456789',
    receiverPhone: '0909876543',
    vehicleType: 'van',
    history: [
      { time: '2026-01-21 10:00', action: 'Khách hàng đặt đơn' }
    ],
  },
])

// Đơn hàng được chọn để xử lý
const selectedOrder = ref<Order | null>(null)

const searchOrderId = ref('')
const rejectReason = ref('')
const rejectNote = ref('')
const reviewNote = ref('')
const decision = ref('')

// Filter orders based on search
const filteredPendingOrders = computed(() => {
  if (!searchOrderId.value) return pendingOrders.value
  return pendingOrders.value.filter(order => 
    order.id.toString().includes(searchOrderId.value) ||
    order.customer.toLowerCase().includes(searchOrderId.value.toLowerCase())
  )
})

// Select order to process
const selectOrder = (order: Order) => {
  selectedOrder.value = { ...order }
  searchOrderId.value = order.id.toString()
}

const updateStatus = (status: OrderStatus, actionText: string) => {
  if (!selectedOrder.value) return
  
  selectedOrder.value.status = status
  selectedOrder.value.history.push({
    time: new Date().toLocaleString('vi-VN'),
    action: actionText,
  })
  
  // Update in pendingOrders list
  const index = pendingOrders.value.findIndex(o => o.id === selectedOrder.value!.id)
  if (index !== -1) {
    pendingOrders.value[index] = { ...selectedOrder.value }
  }
}

const approveOrder = () => {
  if (!selectedOrder.value) {
    alert('Vui lòng chọn đơn hàng!')
    return
  }
  if (!decision.value) {
    alert('Vui lòng chọn quyết định!')
    return
  }
  if (decision.value === 'approve') {
    updateStatus('Approved', `Duyệt đơn - ${reviewNote.value || 'Đơn hàng hợp lệ'}`)
    alert('Đã duyệt đơn hàng thành công!')
    reviewNote.value = ''
    decision.value = ''
    selectedOrder.value = null
    searchOrderId.value = ''
  } else if (decision.value === 'request_edit') {
    alert('Đã gửi yêu cầu chỉnh sửa đến khách hàng')
  } else if (decision.value === 'reject') {
    activeTab.value = 'tuchoi'
  }
}

const rejectOrder = () => {
  if (!selectedOrder.value) {
    alert('Vui lòng chọn đơn hàng!')
    return
  }
  if (!rejectReason.value || !rejectNote.value) {
    alert('Vui lòng điền đầy đủ lý do từ chối!')
    return
  }
  updateStatus('Rejected', `Từ chối đơn - ${rejectNote.value}`)
  alert('Đã từ chối đơn hàng!')
  rejectReason.value = ''
  rejectNote.value = ''
  selectedOrder.value = null
  searchOrderId.value = ''
}

const saveOrderEdit = () => {
  if (!selectedOrder.value) {
    alert('Vui lòng chọn đơn hàng!')
    return
  }
  updateStatus(selectedOrder.value.status, 'Chỉnh sửa thông tin đơn hàng')
  alert('Đã lưu thay đổi thành công!')
}

const getStatusColor = (status: OrderStatus) => {
  const colors: Record<OrderStatus, { bg: string; text: string }> = {
    Pending: { bg: 'bg-blue-100', text: 'text-blue-700' },
    Approved: { bg: 'bg-green-100', text: 'text-green-700' },
    Assigned: { bg: 'bg-purple-100', text: 'text-purple-700' },
    'In Progress': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    Completed: { bg: 'bg-green-100', text: 'text-green-700' },
    Cancelled: { bg: 'bg-gray-100', text: 'text-gray-700' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-700' },
  }
  return colors[status]
}

const showTab = (tab: string) => {
  activeTab.value = tab
}

const getRejectReasonText = (value: string) => {
  const reasons: Record<string, string> = {
    info: 'Thông tin không đầy đủ',
    address: 'Địa chỉ không hợp lệ',
    goods: 'Hàng hóa không được phép vận chuyển',
    area: 'Ngoài phạm vi dịch vụ',
    other: 'Lý do khác',
  }
  return reasons[value] || value
}

const getCancelReasonText = (value: string) => {
  const reasons: Record<string, string> = {
    customer: 'Khách hàng yêu cầu',
    error: 'Thông tin sai',
    duplicate: 'Đơn hàng trùng lặp',
    driver: 'Driver không thể nhận',
    other: 'Lý do khác',
  }
  return reasons[value] || value
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">
    <!-- HEADER-->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="px-6">
        <div class="flex justify-between items-center h-16">
          <!-- LEFT -->
          <div class="flex items-center gap-3">
            <button
              @click="router.push('/manager/dashboard')"
              class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>

            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600
                       rounded-xl flex items-center justify-center shadow-lg
                       shadow-glow-primary-500/30"
              >
                <Package class="w-6 h-6 text-white" />
              </div>
              <h1
                class="text-xl font-bold bg-gradient-to-r from-glow-primary-600
                       to-glow-primary-500 bg-clip-text text-transparent"
              >
                Trang chủ
              </h1>
            </div>
          </div>

          <!-- NAV -->
          <nav class="hidden md:block">
            <ul class="flex items-center gap-1">
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Home class="w-4 h-4 mr-2" />
                  Trang Chủ
                </button>
              </li>
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center bg-glow-primary-500 text-white shadow-lg shadow-glow-primary-500/30"
                >
                  <Package class="w-4 h-4 mr-2" />
                  Xử lý đơn hàng
                </button>
              </li>
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <UserCheck class="w-4 h-4 mr-2" />
                  Phân Công Đơn
                </button>
              </li>
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Activity class="w-4 h-4 mr-2" />
                  Theo Dõi Trạng Thái
                </button>
              </li>
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Zap class="w-4 h-4 mr-2" />
                  Xử Lý Đột Xuất
                </button>
              </li>
            </ul>
          </nav>

          <!-- USER -->
          <div class="flex items-center gap-4">
            <button
              class="px-4 py-2 text-sm font-medium text-white
                     bg-gradient-to-r from-glow-primary-500 to-glow-primary-600
                     rounded-lg hover:shadow-lg hover:shadow-glow-primary-500/30
                     transition-all flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div class="flex overflow-x-auto border-b border-gray-200">
          <button
            @click="showTab('duyet')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'duyet'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Duyệt đơn hàng
          </button>
          <button
            @click="showTab('tuchoi')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'tuchoi'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Từ chối đơn hàng
          </button>
          <button
            @click="showTab('chinhsua')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'chinhsua'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >

            Xem lịch sử
          </button>
        </div>

        <!-- Tab Contents -->
        <div class="p-6">
          <!-- Duyệt đơn hàng -->
          <div v-if="activeTab === 'duyet'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Duyệt đơn hàng</h3>
            
            <!-- Search/Filter -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm đơn hàng</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  v-model="searchOrderId"
                  placeholder="Tìm theo mã đơn hoặc số điện thoại khách hàng..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Danh sách đơn hàng chờ duyệt -->
            <div v-if="!selectedOrder" class="space-y-3 mb-6">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-700">
                  Đơn hàng chờ duyệt ({{ filteredPendingOrders.length }})
                </h4>
              </div>

              <div v-if="filteredPendingOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p class="text-gray-500">Không có đơn hàng chờ duyệt</p>
              </div>

              <div
                v-for="order in filteredPendingOrders"
                :key="order.id"
                @click="selectOrder(order)"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:border-glow-primary-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h5 class="font-semibold text-gray-900">Đơn hàng #{{ order.id }}</h5>
                    <p class="text-sm text-gray-600">{{ order.customer }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(order.status).bg,
                      getStatusColor(order.status).text
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p class="text-xs text-gray-500">Từ</p>
                    <p class="text-gray-700 truncate">{{ order.pickupAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Đến</p>
                    <p class="text-gray-700 truncate">{{ order.deliveryAddress }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between text-xs text-gray-500">
                  <span>{{ order.vehicleType === 'bike' ? 'Xe máy' : order.vehicleType === 'car' ? 'Ô tô 4 chỗ' : order.vehicleType === 'van' ? 'Xe Van' : 'Xe tải' }}</span>
                  <span>{{ order.history[order.history.length - 1]?.time }}</span>
                </div>
              </div>
            </div>

            <!-- Form xử lý đơn đã chọn -->
            <div v-if="selectedOrder">
              <div class="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4 flex items-center justify-between">
                <p class="text-sm text-blue-700">
                  <strong>Đang xử lý:</strong> Đơn hàng #{{ selectedOrder.id }} - {{ selectedOrder.customer }}
                </p>
                <button
                  @click="selectedOrder = null; searchOrderId = ''"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Hủy chọn
                </button>
              </div>

              <!-- Thông tin đơn hàng chi tiết -->
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Khách hàng</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedOrder.customer }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Trạng thái</p>
                    <span
                      :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                        getStatusColor(selectedOrder.status).bg,
                        getStatusColor(selectedOrder.status).text
                      ]"
                    >
                      {{ selectedOrder.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Loại xe</p>
                    <p class="text-sm text-gray-800">
                      {{ selectedOrder.vehicleType === 'bike' ? 'Xe máy' : selectedOrder.vehicleType === 'car' ? 'Ô tô 4 chỗ' : selectedOrder.vehicleType === 'van' ? 'Xe Van' : 'Xe tải' }}
                    </p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-700 mb-2">Người gửi</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.sender }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.senderPhone }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.pickupAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-700 mb-2">Người nhận</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.receiver }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.receiverPhone }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.deliveryAddress }}</p>
                  </div>
                </div>
                
                <div>
                  <p class="text-xs text-gray-600 mb-1">Ghi chú</p>
                  <p class="text-sm text-gray-800">{{ selectedOrder.note || 'Không có ghi chú' }}</p>
                </div>
              </div>

              <form @submit.prevent="approveOrder" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    v-model="reviewNote"
                    placeholder="Nhập ghi chú..."
                    rows="3"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Check class="w-5 h-5" />
                  Xác nhận duyệt
                </button>
              </form>
            </div>
          </div>

          <!-- Từ chối đơn hàng -->
          <div v-if="activeTab === 'tuchoi'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Từ chối đơn hàng</h3>

            <!-- Search/Filter -->
            <div class="mb-4" v-if="!selectedOrder">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm đơn hàng</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  v-model="searchOrderId"
                  placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Danh sách đơn hàng -->
            <div v-if="!selectedOrder" class="space-y-3 mb-6">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-700">
                  Đơn hàng ({{ filteredPendingOrders.length }})
                </h4>
              </div>

              <div v-if="filteredPendingOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p class="text-gray-500">Không tìm thấy đơn hàng</p>
              </div>

              <div
                v-for="order in filteredPendingOrders"
                :key="order.id"
                @click="selectOrder(order)"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:border-red-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h5 class="font-semibold text-gray-900">Đơn hàng #{{ order.id }}</h5>
                    <p class="text-sm text-gray-600">{{ order.customer }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(order.status).bg,
                      getStatusColor(order.status).text
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-xs text-gray-500">Từ</p>
                    <p class="text-gray-700 truncate">{{ order.pickupAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Đến</p>
                    <p class="text-gray-700 truncate">{{ order.deliveryAddress }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form từ chối đơn đã chọn -->
            <div v-if="selectedOrder">
              <div class="bg-red-50 p-3 rounded-lg border border-red-200 mb-4 flex items-center justify-between">
                <p class="text-sm text-red-700">
                  <strong>Đang xử lý:</strong> Đơn hàng #{{ selectedOrder.id }} - {{ selectedOrder.customer }}
                </p>
                <button
                  @click="selectedOrder = null; searchOrderId = ''"
                  class="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Hủy chọn
                </button>
              </div>

              <!-- Thông tin đơn hàng chi tiết -->
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Khách hàng</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedOrder.customer }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Trạng thái</p>
                    <span
                      :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                        getStatusColor(selectedOrder.status).bg,
                        getStatusColor(selectedOrder.status).text
                      ]"
                    >
                      {{ selectedOrder.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 mb-1">Loại xe</p>
                    <p class="text-sm text-gray-800">
                      {{ selectedOrder.vehicleType === 'bike' ? 'Xe máy' : selectedOrder.vehicleType === 'car' ? 'Ô tô 4 chỗ' : selectedOrder.vehicleType === 'van' ? 'Xe Van' : 'Xe tải' }}
                    </p>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p class="text-xs font-semibold text-gray-700 mb-2">Người gửi</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.sender }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.senderPhone }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.pickupAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs font-semibold text-gray-700 mb-2">Người nhận</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.receiver }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.receiverPhone }}</p>
                    <p class="text-sm text-gray-600">{{ selectedOrder.deliveryAddress }}</p>
                  </div>
                </div>
                
                <div>
                  <p class="text-xs text-gray-600 mb-1">Ghi chú</p>
                  <p class="text-sm text-gray-800">{{ selectedOrder.note || 'Không có ghi chú' }}</p>
                </div>
              </div>

              <form @submit.prevent="rejectOrder" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lý do từ chối</label>
                  <select
                    v-model="rejectReason"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">-- Chọn lý do --</option>
                    <option value="info">Thông tin không đầy đủ</option>
                    <option value="address">Địa chỉ không hợp lệ</option>
                    <option value="goods">Hàng hóa không được phép vận chuyển</option>
                    <option value="area">Ngoài phạm vi dịch vụ</option>
                    <option value="other">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Ghi chú chi tiết</label>
                  <textarea
                    v-model="rejectNote"
                    placeholder="Nhập chi tiết lý do từ chối..."
                    rows="4"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  class="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <X class="w-5 h-5" />
                  Từ chối đơn hàng
                </button>
              </form>
            </div>
          </div>

          <!-- Chỉnh sửa đơn hàng -->
          <div v-if="activeTab === 'chinhsua'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Chỉnh sửa đơn hàng</h3>

            <!-- Search/Filter -->
            <div class="mb-4" v-if="!selectedOrder">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm đơn hàng</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  v-model="searchOrderId"
                  placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Danh sách đơn hàng -->
            <div v-if="!selectedOrder" class="space-y-3 mb-6">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-700">
                  Đơn hàng ({{ filteredPendingOrders.length }})
                </h4>
              </div>

              <div v-if="filteredPendingOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p class="text-gray-500">Không tìm thấy đơn hàng</p>
              </div>

              <div
                v-for="order in filteredPendingOrders"
                :key="order.id"
                @click="selectOrder(order)"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h5 class="font-semibold text-gray-900">Đơn hàng #{{ order.id }}</h5>
                    <p class="text-sm text-gray-600">{{ order.customer }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(order.status).bg,
                      getStatusColor(order.status).text
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p class="text-xs text-gray-500">Từ</p>
                    <p class="text-gray-700 truncate">{{ order.pickupAddress }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Đến</p>
                    <p class="text-gray-700 truncate">{{ order.deliveryAddress }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- -->
            <div v-if="selectedOrder">
              <div class="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4 flex items-center justify-between">
                <p class="text-sm text-blue-700">
                  <strong>Đang chỉnh sửa:</strong> Đơn hàng #{{ selectedOrder.id }} - 
                  <span :class="getStatusColor(selectedOrder.status).text">{{ selectedOrder.status }}</span>
                </p>
                <button
                  @click="selectedOrder = null; searchOrderId = ''"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Hủy chọn
                </button>
              </div>

             <form @submit.prevent="saveOrderEdit" class="space-y-4">

  <!-- Thông tin người gửi -->
  <div class="space-y-3">
    <label class="block text-sm font-medium text-gray-700">
      Thông tin người gửi
    </label>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Họ và tên</label>
      <input
        type="text"
        v-model="selectedOrder.sender"
        placeholder="Tên người gửi"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Số điện thoại</label>
      <input
        type="tel"
        v-model="selectedOrder.senderPhone"
        placeholder="Số điện thoại"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Địa chỉ lấy hàng</label>
      <input
        type="text"
        v-model="selectedOrder.pickupAddress"
        placeholder="Địa chỉ lấy hàng"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>
  </div>

  <!-- Thông tin người nhận -->
  <div class="space-y-3">
    <label class="block text-sm font-medium text-gray-700">
      Thông tin người nhận
    </label>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Họ và tên</label>
      <input
        type="text"
        v-model="selectedOrder.receiver"
        placeholder="Tên người nhận"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Số điện thoại</label>
      <input
        type="tel"
        v-model="selectedOrder.receiverPhone"
        placeholder="Số điện thoại"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Địa chỉ giao hàng</label>
      <input
        type="text"
        v-model="selectedOrder.deliveryAddress"
        placeholder="Địa chỉ giao hàng"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      />
    </div>
  </div>

  <!-- Loại xe -->
  <div class="space-y-3">
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium text-gray-700 w-32">Loại xe</label>

      <select
        v-model="selectedOrder.vehicleType"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
      >
        <option disabled value="">-- Chọn loại xe --</option>
        <option value="bike">Xe máy</option>
        <option value="car">Ô tô</option>
        <option value="van">Xe van</option>
        <option value="truck">Xe tải</option>
      </select>
    </div>
  </div>

  <!-- Nút lưu -->
  <button
    type="submit"
    class="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
  >
    <Edit2 class="w-5 h-5" />
    Lưu thay đổi
  </button>

</form>

            </div>
          </div>

          <!-- Xem lịch sử -->
          <div v-if="activeTab === 'lichsu'">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Xem lịch sử đơn hàng</h3>
            
            <!-- Search/Filter -->
            <div class="mb-4" v-if="!selectedOrder">
              <label class="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm đơn hàng</label>
              <div class="relative">
                <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  v-model="searchOrderId"
                  placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <!-- Danh sách đơn hàng -->
            <div v-if="!selectedOrder" class="space-y-3 mb-6">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-gray-700">
                  Đơn hàng ({{ filteredPendingOrders.length }})
                </h4>
              </div>

              <div v-if="filteredPendingOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p class="text-gray-500">Không tìm thấy đơn hàng</p>
              </div>

              <div
                v-for="order in filteredPendingOrders"
                :key="order.id"
                @click="selectOrder(order)"
                class="bg-white border border-gray-200 rounded-lg p-4 hover:border-glow-primary-400 hover:shadow-md transition-all cursor-pointer"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h5 class="font-semibold text-gray-900">Đơn hàng #{{ order.id }}</h5>
                    <p class="text-sm text-gray-600">{{ order.customer }}</p>
                  </div>
                  <span
                    :class="[
                      'px-3 py-1 rounded-full text-xs font-semibold',
                      getStatusColor(order.status).bg,
                      getStatusColor(order.status).text
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </div>

                <div class="text-xs text-gray-500">
                  {{ order.history.length }} thao tác - Cập nhật: {{ order.history[order.history.length - 1]?.time }}
                </div>
              </div>
            </div>

            <!-- Chi tiết lịch sử đơn đã chọn -->
            <div v-if="selectedOrder">
              <div class="bg-glow-primary-50 p-3 rounded-lg border border-glow-primary-200 mb-4 flex items-center justify-between">
                <p class="text-sm text-glow-primary-700">
                  <strong>Xem lịch sử:</strong> Đơn hàng #{{ selectedOrder.id }} - {{ selectedOrder.customer }}
                </p>
                <button
                  @click="selectedOrder = null; searchOrderId = ''"
                  class="text-glow-primary-600 hover:text-glow-primary-800 text-sm font-medium"
                >
                  Đóng
                </button>
              </div>

              <!-- Thông tin đơn hàng tóm tắt -->
              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 class="text-sm font-semibold text-gray-900 mb-3">Thông tin đơn hàng</h4>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs text-gray-600">Khách hàng</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedOrder.customer }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Trạng thái hiện tại</p>
                    <span
                      :class="[
                        'inline-block px-3 py-1 rounded-full text-xs font-semibold',
                        getStatusColor(selectedOrder.status).bg,
                        getStatusColor(selectedOrder.status).text
                      ]"
                    >
                      {{ selectedOrder.status }}
                    </span>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600">Loại xe</p>
                    <p class="text-sm text-gray-800">
                      {{ selectedOrder.vehicleType === 'bike' ? 'Xe máy' : selectedOrder.vehicleType === 'car' ? 'Ô tô 4 chỗ' : selectedOrder.vehicleType === 'van' ? 'Xe Van' : 'Xe tải' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Lịch sử thao tác -->
              <div class="space-y-3">
                <h4 class="text-sm font-semibold text-gray-900">Lịch sử thao tác</h4>
                
                <div
                  v-for="(item, index) in selectedOrder.history"
                  :key="index"
                  class="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-glow-primary-300 hover:shadow-sm transition-all"
                >
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 bg-glow-primary-100 rounded-full flex items-center justify-center">
                      <Clock class="w-5 h-5 text-glow-primary-600" />
                    </div>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">{{ item.action }}</p>
                    <p class="text-xs text-gray-500 mt-1">{{ item.time }}</p>
                  </div>
                </div>

                <div v-if="selectedOrder.history.length === 0" class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  Chưa có lịch sử thao tác
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>