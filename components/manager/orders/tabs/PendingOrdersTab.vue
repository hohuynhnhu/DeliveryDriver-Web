<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  FileCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  Calendar,
} from 'lucide-vue-next'
import type { OrderSummary } from '@/@type/order'

const emit = defineEmits<{
  refresh: []
}>()

const { processOrder } = useOrder()
const {
  orders,
  loading,
  error,
  filters,
  setFilter,
  resetFilters,
  fetchOrders,
  searchId,
  filteredOrders,
  hasMore,
  currentPage,
  nextPage,
  prevPage,
} = usePostOfficeOrders()

// ─── Tabs ───
const activeTab = ref<'drop_off' | 'pickup'>('drop_off')

watch(activeTab, (val) => {
  setFilter('order_type', val)
})

// Khởi tạo filter order_type theo tab mặc định
setFilter('order_type', 'drop_off')

// ─── Filter panel ───
const showFilters = ref(false)
const filterStatus = ref<string>('')
const filterPickupStatus = ref<string>('')
const filterAreaCode = ref<string>('')

const statusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'confirmed', label: 'Đã duyệt' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'completed', label: 'Hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
]

const pickupStatusOptions = [
  { value: '', label: 'Tất cả' },
  { value: 'pending', label: 'Chờ lấy' },
  { value: 'scheduled', label: 'Đã lên lịch' },
  { value: 'picked', label: 'Đã lấy' },
  { value: 'failed', label: 'Thất bại' },
]

function applyFilters() {
  setFilter('status', filterStatus.value || undefined)
  setFilter('pickup_status', filterPickupStatus.value || undefined)
  setFilter('pickup_area_code', filterAreaCode.value || undefined)
}

function handleResetFilters() {
  filterStatus.value = ''
  filterPickupStatus.value = ''
  filterAreaCode.value = ''
  searchId.value = ''
  resetFilters()
  setFilter('order_type', activeTab.value)
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filterStatus.value) count++
  if (filterPickupStatus.value) count++
  if (filterAreaCode.value) count++
  return count
})

// ─── Order detail / approve ───
const selectedOrder = ref<OrderSummary | null>(null)
const reviewNote = ref('')
const processing = ref(false)

function handleSelectOrder(order: OrderSummary) {
  selectedOrder.value = order
  reviewNote.value = ''
}

function handleClose() {
  selectedOrder.value = null
  reviewNote.value = ''
}

async function handleApprove() {
  if (!selectedOrder.value || processing.value) return
  const confirmed = confirm('Xác nhận duyệt đơn hàng này?')
  if (!confirmed) return

  processing.value = true
  const success = await processOrder(selectedOrder.value.id, 'approve', reviewNote.value)
  processing.value = false

  if (success) {
    selectedOrder.value = null
    reviewNote.value = ''
    fetchOrders()
    emit('refresh')
  }
}

async function handleReject() {
  if (!selectedOrder.value || processing.value) return
  const reason = prompt('Lý do từ chối:')
  if (!reason) return

  processing.value = true
  const success = await processOrder(selectedOrder.value.id, 'reject', reviewNote.value, reason)
  processing.value = false

  if (success) {
    selectedOrder.value = null
    reviewNote.value = ''
    fetchOrders()
    emit('refresh')
  }
}

// ─── Helpers ───
const statusBadge: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Chờ duyệt' },
  confirmed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', label: 'Đã duyệt' },
  processing: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', label: 'Đang xử lý' },
  completed: { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600', label: 'Hoàn thành' },
  cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Đã hủy' },
}

const pickupBadge: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-600', label: 'Chờ lấy' },
  scheduled: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-600', label: 'Đã lên lịch' },
  picked: { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-600', label: 'Đã lấy' },
  failed: { bg: 'bg-red-50 border-red-200', text: 'text-red-600', label: 'Thất bại' },
}

function getBadge(map: Record<string, any>, key: string | null | undefined) {
  if (!key || !map[key]) return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-500', label: key || '—' }
  return map[key]
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function truncateId(id: string) {
  return id.substring(0, 8) + '...'
}
</script>

<template>
  <div class="max-w-4xl mx-auto">
    <!-- ════════ HEADER ════════ -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-1">Quản lý đơn hàng</h2>
      <p class="text-sm text-gray-500">Duyệt, lọc và quản lý đơn hàng bưu cục</p>
    </div>

    <!-- ════════ TABS ════════ -->
    <div class="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
      <button
        @click="activeTab = 'drop_off'"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="
          activeTab === 'drop_off'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        <Package class="w-4 h-4" />
        Gửi tại bưu cục
      </button>
      <button
        @click="activeTab = 'pickup'"
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
        :class="
          activeTab === 'pickup'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        "
      >
        <Truck class="w-4 h-4" />
        Lấy hàng tận nơi
      </button>
    </div>

    <!-- ════════ SEARCH + FILTER BAR ════════ -->
    <div class="flex gap-2 mb-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="searchId"
          type="text"
          placeholder="Tìm theo mã đơn..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition"
        />
        <button
          v-if="searchId"
          @click="searchId = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Filter toggle -->
      <button
        @click="showFilters = !showFilters"
        class="relative flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
      >
        <Filter class="w-4 h-4" />
        Lọc
        <span
          v-if="activeFilterCount > 0"
          class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center"
        >
          {{ activeFilterCount }}
        </span>
      </button>

      <!-- Refresh -->
      <button
        @click="fetchOrders()"
        :disabled="loading"
        class="flex items-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
      </button>
    </div>

    <!-- ════════ FILTER PANEL ════════ -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="showFilters" class="mb-4 p-4 bg-white border border-gray-200 rounded-xl space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <!-- Status -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Trạng thái đơn</label>
            <select
              v-model="filterStatus"
              @change="applyFilters"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Pickup status (chỉ hiện cho tab pickup) -->
          <div v-if="activeTab === 'pickup'">
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Trạng thái lấy hàng</label>
            <select
              v-model="filterPickupStatus"
              @change="applyFilters"
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option v-for="opt in pickupStatusOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <!-- Area code -->
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1.5">Mã khu vực</label>
            <input
              v-model="filterAreaCode"
              @input="applyFilters"
              placeholder="VD: HCMQ12, TD..."
              class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <!-- Reset -->
        <div class="flex justify-end">
          <button
            @click="handleResetFilters"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      </div>
    </Transition>

    <!-- ════════ ERROR ════════ -->
    <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      {{ error }}
    </div>

    <!-- ════════ LOADING ════════ -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-3 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
    </div>

    <!-- ════════ ORDER LIST ════════ -->
    <div v-else-if="!selectedOrder">
      <!-- Empty state -->
      <div v-if="filteredOrders.length === 0" class="text-center py-16">
        <FileCheck class="w-14 h-14 mx-auto mb-3 text-gray-300" />
        <p class="text-gray-500 text-sm">Không tìm thấy đơn hàng nào</p>
        <button
          @click="handleResetFilters"
          class="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Xóa bộ lọc
        </button>
      </div>

      <!-- Orders -->
      <div v-else class="space-y-2">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          @click="handleSelectOrder(order)"
          class="group bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150 cursor-pointer"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <!-- ID + date -->
              <div class="flex items-center gap-2 mb-1.5">
                <code class="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                  {{ truncateId(order.id) }}
                </code>
                <span class="text-xs text-gray-400">
                  {{ formatDate(order.created_at) }}
                </span>
              </div>

              <!-- Address -->
              <p class="text-sm text-gray-800 truncate mb-2">
                {{ order.pickup_point || 'Tại bưu cục' }}
              </p>

              <!-- Badges -->
              <div class="flex flex-wrap gap-1.5">
                <span
                  :class="[getBadge(statusBadge, order.status).bg, getBadge(statusBadge, order.status).text]"
                  class="inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium"
                >
                  {{ getBadge(statusBadge, order.status).label }}
                </span>

                <span
                  v-if="activeTab === 'pickup' && order.pickup_status"
                  :class="[getBadge(pickupBadge, order.pickup_status).bg, getBadge(pickupBadge, order.pickup_status).text]"
                  class="inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium"
                >
                  {{ getBadge(pickupBadge, order.pickup_status).label }}
                </span>

                <span
                  v-if="order.pickup_area_code"
                  class="inline-flex items-center px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-500"
                >
                  {{ order.pickup_area_code }}
                </span>
              </div>
            </div>

            <!-- Packages count -->
            <div class="text-right shrink-0">
              <span class="text-lg font-semibold text-gray-900">{{ order.total_packages }}</span>
              <p class="text-xs text-gray-400">kiện</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ════════ PAGINATION ════════ -->
      <div class="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <button
          @click="prevPage"
          :disabled="currentPage <= 1"
          class="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft class="w-4 h-4" />
          Trước
        </button>
        <span class="text-sm text-gray-500">Trang {{ currentPage }}</span>
        <button
          @click="nextPage"
          :disabled="!hasMore"
          class="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Sau
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- ════════ DETAIL / APPROVE VIEW ════════ -->
    <div v-else class="space-y-4">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div>
          <p class="text-xs text-blue-500 font-medium mb-0.5">Chi tiết đơn hàng</p>
          <code class="text-sm font-mono text-blue-900">{{ selectedOrder.id }}</code>
        </div>
        <button @click="handleClose" class="p-1.5 text-blue-400 hover:text-blue-700 rounded-lg hover:bg-blue-100 transition">
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Info -->
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Địa chỉ</p>
            <p class="text-gray-900">{{ selectedOrder.pickup_point || 'Tại bưu cục'}}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Loại đơn</p>
            <p class="text-gray-900">{{ selectedOrder.order_type === 'pickup' ? 'Lấy hàng tận nơi' : 'Gửi tại bưu cục' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Trạng thái</p>
            <span
              :class="[getBadge(statusBadge, selectedOrder.status).bg, getBadge(statusBadge, selectedOrder.status).text]"
              class="inline-flex items-center px-2 py-0.5 border rounded-md text-xs font-medium"
            >
              {{ getBadge(statusBadge, selectedOrder.status).label }}
            </span>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Ngày tạo</p>
            <p class="text-gray-900">{{ formatDate(selectedOrder.created_at) }}</p>
          </div>
          <div v-if="selectedOrder.pickup_area_code">
            <p class="text-gray-400 text-xs mb-0.5">Khu vực</p>
            <p class="text-gray-900">{{ selectedOrder.pickup_area_code }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs mb-0.5">Số kiện</p>
            <p class="text-gray-900 font-semibold">{{ selectedOrder.total_packages }}</p>
          </div>
        </div>
      </div>

      <!-- Approve/Reject (chỉ hiện khi đơn pending) -->
      <template v-if="selectedOrder.status === 'pending'">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1.5">Ghi chú duyệt đơn</label>
          <textarea
            v-model="reviewNote"
            placeholder="Nhập ghi chú (tùy chọn)..."
            rows="3"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition resize-none"
          />
        </div>

        <div class="flex gap-3">
          <button
            @click="handleReject"
            :disabled="processing"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition disabled:opacity-50"
          >
            <XCircle class="w-4 h-4" />
            Từ chối
          </button>
          <button
            @click="handleApprove"
            :disabled="processing"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition disabled:opacity-50"
          >
            <CheckCircle class="w-4 h-4" />
            Duyệt đơn
          </button>
        </div>
      </template>

      <!-- Back button -->
      <button
        @click="handleClose"
        class="w-full py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
      >
        ← Quay lại danh sách
      </button>
    </div>
  </div>
</template>