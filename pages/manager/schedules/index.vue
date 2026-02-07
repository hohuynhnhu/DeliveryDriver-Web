<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Calendar, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Plus,
  Filter,
  RefreshCw,
  UserPlus,
  Zap,
  Settings as SettingsIcon,
  Trash2,
  Eye
} from 'lucide-vue-next'
import type { Schedule, SchedulingResponse } from '@/@type/schedule'
import AssignDriverModal from '@/components/modals/AssignDriverModal.vue'
import CreateScheduleQuickModal from '@/components/manager/schedules/CreateScheduleQuickModal.vue'
import CreateScheduleAdvancedModal from '@/components/manager/schedules/CreateScheduleAdvancedModal.vue'

definePageMeta({
  layout: 'manager',
})

const router = useRouter()
const { getSchedules, deleteSchedule,confirmSchedule,cancelSchedule, isLoading } = useSchedule()

// ============================================================================
// STATE
// ============================================================================
const schedules = ref<Schedule[]>([])
const filterDate = ref<string>('')
const filterStatus = ref<string>('')
const filterArea = ref<string>('')

// Modal states
const showAssignModal = ref(false)
const showQuickModal = ref(false)
const showAdvancedModal = ref(false)
const selectedSchedule = ref<Schedule | null>(null)

// ============================================================================
// COMPUTED
// ============================================================================
const filteredSchedules = computed(() => {
  let result = schedules.value

  if (filterDate.value) {
    result = result.filter(s => s.scheduled_date === filterDate.value)
  }

  if (filterStatus.value) {
    result = result.filter(s => s.status === filterStatus.value)
  }

  if (filterArea.value) {
    result = result.filter(s => s.area_code === filterArea.value)
  }

  return result
})
const handleConfirmSchedule = async (schedule: Schedule, event: Event) => {
  event.stopPropagation()

  if (schedule.status !== 'draft') {
    alert('❌ Chỉ có thể xác nhận lịch ở trạng thái bản nháp')
    return
  }

  const ok = confirm(`Xác nhận lịch giao hàng ${schedule.area_code} - ${schedule.scheduled_date}?`)
  if (!ok) return

  const success = await confirmSchedule(schedule.id)

  if (success) {
    alert('✅ Đã xác nhận lịch')
    loadSchedules()
  } else {
    alert('❌ Không thể xác nhận lịch')
  }
}

const handleCancelSchedule = async (schedule: Schedule, event: Event) => {
  event.stopPropagation()

  if (schedule.status === 'completed') {
    alert('❌ Không thể hủy lịch đã hoàn thành')
    return
  }

  const reason = prompt('Nhập lý do hủy lịch (không bắt buộc):') || undefined

  const ok = confirm(`Bạn chắc chắn muốn hủy lịch ${schedule.area_code} - ${schedule.scheduled_date}?`)
  if (!ok) return

  const success = await cancelSchedule(schedule.id, reason)

  if (success) {
    alert('✅ Đã hủy lịch')
    loadSchedules()
  } else {
    alert('❌ Không thể hủy lịch')
  }
}

const groupedSchedules = computed(() => {
  // Nhóm theo ngày
  const grouped: Record<string, Schedule[]> = {}

  filteredSchedules.value.forEach(schedule => {
    const date = schedule.scheduled_date
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(schedule)
  })

  return grouped
})

const statistics = computed(() => {
  return {
    total: schedules.value.length,
    draft: schedules.value.filter(s => s.status === 'draft').length,
    confirmed: schedules.value.filter(s => s.status === 'confirmed').length,
    in_progress: schedules.value.filter(s => s.status === 'in_progress').length,
    completed: schedules.value.filter(s => s.status === 'completed').length,
  }
})

const availableAreas = computed(() => {
  return [...new Set(schedules.value.map(s => s.area_code))].sort()
})

// ============================================================================
// METHODS
// ============================================================================
const loadSchedules = async () => {
  schedules.value = await getSchedules()
  console.log('📋 Loaded schedules:', schedules.value.length)
}

const viewScheduleDetail = (scheduleId: string) => {
  router.push(`/manager/schedules/${scheduleId}`)
}

const openAssignModal = (schedule: Schedule, event: Event) => {
  event.stopPropagation()
  console.log('👤 Opening assign modal for schedule:', schedule.id)
  selectedSchedule.value = schedule
  showAssignModal.value = true
}

const handleDriverAssigned = (driverId: string) => {
  console.log('✅ Driver assigned successfully:', driverId)
  showAssignModal.value = false
  selectedSchedule.value = null
  loadSchedules()
}

const handleDeleteSchedule = async (schedule: Schedule, event: Event) => {
  event.stopPropagation()

  // Validate
  if (schedule.status !== 'draft') {
    alert('❌ Chỉ có thể xóa lịch ở trạng thái draft')
    return
  }

  if (schedule.driver_id) {
    alert('❌ Không thể xóa lịch đã gán tài xế')
    return
  }

  if (!confirm(`Xóa lịch ${schedule.area_code} - ${schedule.scheduled_date}?\n\nĐơn hàng sẽ được trả về trạng thái pending.`)) {
    return
  }

  const success = await deleteSchedule(schedule.id)
  
  if (success) {
    alert('✅ Đã xóa lịch thành công')
    loadSchedules()
  } else {
    alert('❌ Không thể xóa lịch')
  }
}

const handleScheduleCreated = (response: SchedulingResponse) => {
  console.log('🎉 Created schedules:', response)
  
  const message = `
 Tạo lịch thành công!

${response.unassigned_order_ids.length > 0 ? `⚠️ ${response.unassigned_order_ids.length} đơn chưa xếp được` : ''}
  `.trim()
  
  alert(message)
  loadSchedules()
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    confirmed: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Bản nháp',
    confirmed: 'Đã xác nhận',
    in_progress: 'Đang thực hiện',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
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

const clearFilters = () => {
  filterDate.value = ''
  filterStatus.value = ''
  filterArea.value = ''
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  loadSchedules()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">
            Lịch giao hàng
          </h1>
          <p class="text-gray-600">
            Quản lý và theo dõi lịch giao hàng với Genetic Algorithm
          </p>
        </div>

        <!-- Create buttons -->
        <div class="flex gap-3">
          <button
            @click="showQuickModal = true"
            class="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Zap class="w-5 h-5" />
            Tạo nhanh (GA)
          </button>

          <button
            @click="showAdvancedModal = true"
            class="px-4 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <SettingsIcon class="w-5 h-5" />
            Tạo nâng cao
          </button>
        </div>
      </div>

      <!-- STATISTICS CARDS -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-sm text-gray-600 mb-1">Tổng số</div>
          <div class="text-2xl font-bold text-gray-900">{{ statistics.total }}</div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-gray-200">
          <div class="text-sm text-gray-600 mb-1">Bản nháp</div>
          <div class="text-2xl font-bold text-gray-600">{{ statistics.draft }}</div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-blue-100 bg-blue-50">
          <div class="text-sm text-blue-600 mb-1">Đã xác nhận</div>
          <div class="text-2xl font-bold text-blue-700">{{ statistics.confirmed }}</div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-yellow-100 bg-yellow-50">
          <div class="text-sm text-yellow-600 mb-1">Đang thực hiện</div>
          <div class="text-2xl font-bold text-yellow-700">{{ statistics.in_progress }}</div>
        </div>

        <div class="bg-white rounded-lg p-4 border border-green-100 bg-green-50">
          <div class="text-sm text-green-600 mb-1">Hoàn thành</div>
          <div class="text-2xl font-bold text-green-700">{{ statistics.completed }}</div>
        </div>
      </div>

      <!-- FILTERS -->
      <div class="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div class="flex items-center gap-4">
          <Filter class="w-5 h-5 text-gray-600" />
          
          <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- Filter by date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giao hàng</label>
              <input
                v-model="filterDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <!-- Filter by area -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
              <select
                v-model="filterArea"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option v-for="area in availableAreas" :key="area" :value="area">
                  {{ area }}
                </option>
              </select>
            </div>

            <!-- Filter by status -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                v-model="filterStatus"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả</option>
                <option value="draft">Bản nháp</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            <!-- Action buttons -->
            <div class="flex items-end gap-2">
              <button
                v-if="filterDate || filterStatus || filterArea"
                @click="clearFilters"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
              >
                Xóa bộ lọc
              </button>
              
              <button
                @click="loadSchedules"
                :disabled="isLoading"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
                Làm mới
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SCHEDULES LIST -->
      <div v-if="isLoading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="filteredSchedules.length === 0" class="text-center py-12 bg-white rounded-lg border border-gray-200">
        <Calendar class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600 mb-4">
          {{ filterDate || filterStatus || filterArea ? 'Không tìm thấy lịch phù hợp' : 'Chưa có lịch giao hàng nào' }}
        </p>
        <div class="flex gap-3 justify-center">
          <button
            @click="showQuickModal = true"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Zap class="w-4 h-4" />
            Tạo lịch nhanh
          </button>
        </div>
      </div>

      <!-- Grouped by date -->
      <div v-else class="space-y-8">
        <div v-for="(schedulesForDate, date) in groupedSchedules" :key="date">
          <!-- Date header -->
          <div class="flex items-center gap-3 mb-4">
            <Calendar class="w-6 h-6 text-blue-600" />
            <h2 class="text-xl font-bold text-gray-900">
              {{ formatDate(date) }}
            </h2>
            <span class="text-sm text-gray-500">
              ({{ schedulesForDate.length }} lịch)
            </span>
          </div>

          <!-- Schedules grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="schedule in schedulesForDate"
              :key="schedule.id"
              class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer relative group"
              @click="viewScheduleDetail(schedule.id)"
            >
              <!-- Status badge -->
              <div class="flex items-center justify-between mb-3">
                <span 
                  :class="['px-3 py-1 text-xs rounded-full font-medium', getStatusColor(schedule.status)]"
                >
                  {{ getStatusLabel(schedule.status) }}
                </span>
                <span class="text-xs text-gray-500">
                  #{{ schedule.id.slice(0, 8) }}
                </span>
              </div>

              <!-- Area code -->
              <div class="flex items-center gap-2 mb-3">
                <MapPin class="w-5 h-5 text-gray-600" />
                <span class="font-semibold text-gray-900">{{ schedule.area_code }}</span>
              </div>

              <!-- Driver info with assign button -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <Truck class="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <span class="text-sm text-gray-700 truncate">
                    {{ schedule.driver_name || 'Chưa gán tài xế' }}
                  </span>
                </div>

                <!-- Assign driver button -->
                <button
                  v-if="schedule.status !== 'completed' && schedule.status !== 'cancelled'"
                  @click.stop="openAssignModal(schedule, $event)"
                  :class="[
                    'p-2 rounded-lg transition-all flex-shrink-0',
                    schedule.driver_id 
                      ? 'text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100'
                      : 'text-orange-600 hover:bg-orange-50 opacity-100 animate-pulse'
                  ]"
                  :title="schedule.driver_id ? 'Đổi tài xế' : 'Gán tài xế'"
                >
                  <UserPlus class="w-5 h-5" />
                </button>
              </div>

              <!-- Orders count -->
              <div class="flex items-center justify-between pt-3 border-t border-gray-200">
                <div class="flex items-center gap-1 text-sm text-gray-600">
                  <Clock class="w-4 h-4" />
                  <span>{{ schedule.total_orders }} đơn</span>
                </div>

                <div v-if="schedule.status === 'completed'" class="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 class="w-4 h-4" />
                  <span>{{ schedule.completed_orders }}/{{ schedule.total_orders }}</span>
                </div>
              </div>

              <!-- Action buttons (show on hover) -->
                <div
  class="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
>
  <!-- Xem -->
  <button
    @click.stop="viewScheduleDetail(schedule.id)"
    class="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1"
  >
    <Eye class="w-4 h-4" />
    Xem
  </button>

  <!-- Xác nhận lịch -->
  <button
    v-if="schedule.status === 'draft'"
    @click.stop="handleConfirmSchedule(schedule, $event)"
    class="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center justify-center gap-1"
  >
    <CheckCircle2 class="w-4 h-4" />
    Xác nhận
  </button>

  <!-- Hủy lịch -->
  <button
    v-if="schedule.status !== 'completed' && schedule.status !== 'cancelled'"
    @click.stop="handleCancelSchedule(schedule, $event)"
    class="flex-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center justify-center gap-1"
  >
    <Trash2 class="w-4 h-4" />
    Hủy
  </button>

</div>

            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODALS -->
    <AssignDriverModal
      :show="showAssignModal"
      :schedule="selectedSchedule"
      @close="showAssignModal = false"
      @assigned="handleDriverAssigned"
    />

    <CreateScheduleQuickModal
      v-if="showQuickModal"
      @close="showQuickModal = false"
      @success="handleScheduleCreated"
    />

    <CreateScheduleAdvancedModal
      v-if="showAdvancedModal"
      @close="showAdvancedModal = false"
      @success="handleScheduleCreated"
    />
  </div>
</template>