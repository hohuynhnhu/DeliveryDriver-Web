<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Truck, 
  MapPin, 
  Package,
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  Clock,
  AlertTriangle
} from 'lucide-vue-next'
import type { ScheduleDetail } from '@/@type/schedule'

definePageMeta({
  layout: 'manager',
})

const route = useRoute()
const router = useRouter()

const {
  getScheduleDetail,
  assignDriver,
  confirmSchedule,
  cancelSchedule,
  isLoading
} = useSchedule()

// ============================================================================
// STATE
// ============================================================================
const scheduleId = computed(() => route.params.id as string)
const schedule = ref<ScheduleDetail | null>(null)
const showDriverModal = ref(false)
const showCancelModal = ref(false)
const selectedDriverId = ref<string>('')
const cancelReason = ref<string>('')

// Available drivers (TODO: Fetch from API)
const availableDrivers = ref<any[]>([
  { id: 'driver-1', name: 'Nguyễn Văn A', phone: '0909123456', status: 'available' },
  { id: 'driver-2', name: 'Trần Văn B', phone: '0909234567', status: 'available' },
  { id: 'driver-3', name: 'Lê Văn C', phone: '0909345678', status: 'available' },
])

// ============================================================================
// COMPUTED
// ============================================================================
const canAssignDriver = computed(() => {
  return schedule.value && !schedule.value.driver_id && schedule.value.status === 'draft'
})

const canConfirm = computed(() => {
  return schedule.value && schedule.value.driver_id && schedule.value.status === 'draft'
})

const canCancel = computed(() => {
  return schedule.value && ['draft', 'confirmed'].includes(schedule.value.status)
})

const statusColor = computed(() => {
  if (!schedule.value) return 'bg-gray-100 text-gray-700'
  
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return colors[schedule.value.status] || 'bg-gray-100 text-gray-700'
})

const progressPercentage = computed(() => {
  if (!schedule.value || schedule.value.total_orders === 0) return 0
  return Math.round((schedule.value.completed_orders / schedule.value.total_orders) * 100)
})

// ============================================================================
// METHODS
// ============================================================================
const loadSchedule = async () => {
  const data = await getScheduleDetail(scheduleId.value)
  if (data) {
    schedule.value = data
    console.log('📅 Loaded schedule:', data)
  }
}

const handleAssignDriver = async () => {
  if (!selectedDriverId.value) return

  const success = await assignDriver(scheduleId.value, selectedDriverId.value)

  if (success) {
    alert('✅ Đã gán tài xế thành công!')
    showDriverModal.value = false
    selectedDriverId.value = ''
    await loadSchedule()
  } else {
    alert('❌ Không thể gán tài xế')
  }
}

const handleConfirm = async () => {
  if (!confirm('Xác nhận lịch giao hàng này?')) return

  const success = await confirmSchedule(scheduleId.value)

  if (success) {
    alert('✅ Đã xác nhận lịch thành công!')
    await loadSchedule()
  } else {
    alert('❌ Không thể xác nhận lịch')
  }
}

const handleCancel = async () => {
  if (!cancelReason.value.trim()) {
    alert('⚠️ Vui lòng nhập lý do hủy')
    return
  }

  const success = await cancelSchedule(scheduleId.value, cancelReason.value)

  if (success) {
    alert('✅ Đã hủy lịch thành công!')
    showCancelModal.value = false
    cancelReason.value = ''
    await loadSchedule()
  } else {
    alert('❌ Không thể hủy lịch')
  }
}

const goBack = () => {
  router.push('/manager/orders/schedules')
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  loadSchedule()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-5xl mx-auto">
      
      <!-- HEADER -->
      <div class="mb-6">
        <button 
          @click="goBack"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Quay lại danh sách</span>
        </button>

        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 mb-2">
              Chi tiết lịch giao hàng
            </h1>
            <p class="text-gray-600">ID: {{ scheduleId.slice(0, 8) }}</p>
          </div>

          <span v-if="schedule" :class="['px-4 py-2 text-sm rounded-full font-medium', statusColor]">
            {{ schedule.status }}
          </span>
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- CONTENT -->
      <div v-else-if="schedule" class="space-y-6">
        
        <!-- MAIN INFO CARD -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left column -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <Calendar class="w-5 h-5 text-gray-600" />
                <div>
                  <div class="text-sm text-gray-600">Ngày giao hàng</div>
                  <div class="font-semibold text-gray-900">
                    {{ formatDate(schedule.scheduled_date) }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <MapPin class="w-5 h-5 text-gray-600" />
                <div>
                  <div class="text-sm text-gray-600">Khu vực</div>
                  <div class="font-semibold text-gray-900">{{ schedule.area_code }}</div>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <Package class="w-5 h-5 text-gray-600" />
                <div>
                  <div class="text-sm text-gray-600">Số đơn hàng</div>
                  <div class="font-semibold text-gray-900">{{ schedule.total_orders }} đơn</div>
                </div>
              </div>
            </div>

            <!-- Right column -->
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <Truck class="w-5 h-5 text-gray-600" />
                <div class="flex-1">
                  <div class="text-sm text-gray-600 mb-1">Tài xế</div>
                  <div v-if="schedule.driver_name" class="font-semibold text-gray-900">
                    {{ schedule.driver_name }}
                  </div>
                  <button
                    v-else-if="canAssignDriver"
                    @click="showDriverModal = true"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                  >
                    <User class="w-4 h-4" />
                    Gán tài xế
                  </button>
                  <span v-else class="text-gray-500 text-sm">Chưa gán</span>
                </div>
              </div>

              <!-- Progress -->
              <div v-if="schedule.status !== 'draft'">
                <div class="text-sm text-gray-600 mb-2">Tiến độ</div>
                <div class="flex items-center gap-3">
                  <div class="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      class="bg-green-500 h-full transition-all"
                      :style="{ width: `${progressPercentage}%` }"
                    ></div>
                  </div>
                  <span class="text-sm font-medium text-gray-700">
                    {{ progressPercentage }}%
                  </span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ schedule.completed_orders }} / {{ schedule.total_orders }} đơn hoàn thành
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="flex gap-3">
          <button
            v-if="canConfirm"
            @click="handleConfirm"
            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 class="w-5 h-5" />
            Xác nhận lịch
          </button>

          <button
            v-if="canCancel"
            @click="showCancelModal = true"
            class="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <XCircle class="w-5 h-5" />
            Hủy lịch
          </button>
        </div>

        <!-- SCHEDULE ITEMS -->
        <div class="bg-white rounded-xl p-6 border border-gray-200">
          <h2 class="text-lg font-bold text-gray-900 mb-4">
            Danh sách đơn hàng ({{ schedule.items.length }})
          </h2>

          <div class="space-y-3">
            <div
              v-for="(item, index) in schedule.items"
              :key="item.id"
              class="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <!-- Queue number -->
              <div class="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-blue-700">{{ item.queue }}</span>
              </div>

              <!-- Order info -->
              <div class="flex-1">
                <div class="font-medium text-gray-900 mb-1">
                  #{{ item.order_detail_id.slice(0, 8) }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ item.order_detail?.address_detail || 'N/A' }}
                </div>
                <div class="text-xs text-gray-500 mt-1">
                  Khu vực: {{ item.order_detail?.area_code || 'N/A' }}
                </div>
              </div>

              <!-- Status badge -->
              <div>
                <span 
                  :class="[
                    'px-3 py-1 text-xs rounded-full font-medium',
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    item.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ item.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: GÁN TÀI XẾ -->
      <div v-if="showDriverModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showDriverModal = false">
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4" @click.stop>
          <h3 class="text-xl font-bold mb-4">Gán tài xế cho lịch giao hàng</h3>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Chọn tài xế</label>
            <select
              v-model="selectedDriverId"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Chọn tài xế --</option>
              <option 
                v-for="driver in availableDrivers"
                :key="driver.id"
                :value="driver.id"
              >
                {{ driver.name }} - {{ driver.phone }}
              </option>
            </select>
          </div>

          <div class="flex gap-3">
            <button
              @click="showDriverModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Hủy
            </button>
            <button
              @click="handleAssignDriver"
              :disabled="!selectedDriverId"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL: HỦY LỊCH -->
      <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showCancelModal = false">
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4" @click.stop>
          <div class="flex items-center gap-3 mb-4">
            <AlertTriangle class="w-6 h-6 text-red-600" />
            <h3 class="text-xl font-bold text-red-900">Hủy lịch giao hàng</h3>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Lý do hủy</label>
            <textarea
              v-model="cancelReason"
              rows="4"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Nhập lý do hủy lịch..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <button
              @click="showCancelModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
            >
              Đóng
            </button>
            <button
              @click="handleCancel"
              :disabled="!cancelReason.trim()"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>