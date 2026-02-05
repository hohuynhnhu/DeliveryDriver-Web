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
  RefreshCw
} from 'lucide-vue-next'
import type { Schedule } from '@/@type/schedule'

definePageMeta({
  layout: 'manager',
})

const router = useRouter()
const { getSchedules, isLoading } = useSchedule()

// ============================================================================
// STATE
// ============================================================================
const schedules = ref<Schedule[]>([])
const filterDate = ref<string>('')
const filterStatus = ref<string>('')

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

  return result
})

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

// ============================================================================
// METHODS
// ============================================================================
const loadSchedules = async () => {
  schedules.value = await getSchedules()
  console.log('📅 Loaded schedules:', schedules.value.length)
}

const viewScheduleDetail = (scheduleId: string) => {
  router.push(`/manager/orders/schedules/${scheduleId}`)
}

const createNewSchedule = () => {
  router.push('/manager/orders/management?tab=confirmed')
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
            Quản lý và theo dõi lịch giao hàng của tài xế
          </p>
        </div>

        <button
          @click="createNewSchedule"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus class="w-5 h-5" />
          Tạo lịch mới
        </button>
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
          
          <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Filter by date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ngày giao hàng</label>
              <input
                v-model="filterDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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

            <!-- Refresh button -->
            <div class="flex items-end">
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

      <div v-else-if="filteredSchedules.length === 0" class="text-center py-12">
        <Calendar class="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p class="text-gray-600">Chưa có lịch giao hàng nào</p>
        <button
          @click="createNewSchedule"
          class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Tạo lịch đầu tiên
        </button>
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
              @click="viewScheduleDetail(schedule.id)"
              class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer"
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

              <!-- Driver info -->
              <div class="flex items-center gap-2 mb-3">
                <Truck class="w-5 h-5 text-gray-600" />
                <span class="text-sm text-gray-700">
                  {{ schedule.driver_name || 'Chưa gán tài xế' }}
                </span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>