<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X, Search, User, Phone, Truck, CheckCircle2 } from 'lucide-vue-next'
import type { Driver } from '@/@type/driver'
import type { Schedule } from '@/@type/schedule'

interface Props {
  schedule: Schedule | null
  show: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'assigned', driverId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { getAllDrivers, isLoading: isLoadingDrivers } = useDriver()
const { assignDriver, isLoading: isAssigning } = useSchedule()

// ============================================================================
// STATE
// ============================================================================
const drivers = ref<Driver[]>([])
const searchQuery = ref('')
const selectedDriverId = ref<string | null>(null)

// ============================================================================
// COMPUTED
// ============================================================================
const filteredDrivers = computed(() => {
  if (!searchQuery.value) return drivers.value

  const query = searchQuery.value.toLowerCase()
  return drivers.value.filter(driver => 
    driver.name.toLowerCase().includes(query) ||
    driver.phone.includes(query) ||
    driver.email?.toLowerCase().includes(query)
  )
})

const selectedDriver = computed(() => {
  return drivers.value.find(d => d.id === selectedDriverId.value)
})

const canAssign = computed(() => {
  return selectedDriverId.value && props.schedule?.id
})

// ============================================================================
// METHODS
// ============================================================================
const loadDrivers = async () => {
  drivers.value = await getAllDrivers()
  console.log('📦 Loaded drivers:', drivers.value.length)
}

const selectDriver = (driverId: string) => {
  selectedDriverId.value = driverId
}

const handleAssign = async () => {
  if (!canAssign.value || !props.schedule) return

  const success = await assignDriver(props.schedule.id, selectedDriverId.value!)

  if (success) {
    emit('assigned', selectedDriverId.value!)
    handleClose()
  }
}

const handleClose = () => {
  selectedDriverId.value = null
  searchQuery.value = ''
  emit('close')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    busy: 'bg-yellow-100 text-yellow-700',
    offline: 'bg-gray-100 text-gray-700'
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    available: 'Sẵn sàng',
    busy: 'Đang bận',
    offline: 'Offline'
  }
  return labels[status] || status
}

// ============================================================================
// WATCHERS
// ============================================================================
watch(() => props.show, (newShow) => {
  if (newShow) {
    loadDrivers()
    // Pre-select current driver if exists
    if (props.schedule?.driver_id) {
      selectedDriverId.value = props.schedule.driver_id
    }
  }
})
</script>

<template>
  <!-- Modal Overlay -->
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="handleClose"
  >
    <!-- Modal Content -->
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
      
      <!-- HEADER -->
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Gán tài xế
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Lịch: {{ schedule?.area_code }} - {{ schedule?.scheduled_date }}
          </p>
        </div>
        <button
          @click="handleClose"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X class="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <!-- SEARCH BAR -->
      <div class="p-6 border-b border-gray-200">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm tài xế theo tên, số điện thoại..."
            class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- DRIVERS LIST -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Loading -->
        <div v-if="isLoadingDrivers" class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredDrivers.length === 0" class="text-center py-12">
          <User class="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p class="text-gray-600">
            {{ searchQuery ? 'Không tìm thấy tài xế' : 'Chưa có tài xế nào' }}
          </p>
        </div>

        <!-- Drivers Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="driver in filteredDrivers"
            :key="driver.id"
            @click="selectDriver(driver.id)"
            :class="[
              'border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
              selectedDriverId === driver.id
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-blue-300'
            ]"
          >
            <!-- Selection indicator -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <!-- Avatar -->
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                  {{ driver.name.charAt(0).toUpperCase() }}
                </div>

                <!-- Name & Status -->
                <div>
                  <div class="font-semibold text-gray-900">
                    {{ driver.name }}
                  </div>
                  <span 
                    :class="['px-2 py-0.5 text-xs rounded-full font-medium', getStatusColor(driver.status)]"
                  >
                    {{ getStatusLabel(driver.status) }}
                  </span>
                </div>
              </div>

              <!-- Check icon -->
              <CheckCircle2
                v-if="selectedDriverId === driver.id"
                class="w-6 h-6 text-blue-600"
              />
            </div>

            <!-- Contact Info -->
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <Phone class="w-4 h-4" />
                <span>{{ driver.phone }}</span>
              </div>

              <div v-if="driver.vehicle_type" class="flex items-center gap-2 text-gray-600">
                <Truck class="w-4 h-4" />
                <span>{{ driver.vehicle_type }} - {{ driver.license_plate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <!-- Selected Driver Info -->
        <div v-if="selectedDriver" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            {{ selectedDriver.name.charAt(0).toUpperCase() }}
          </div>
          <div>
            <div class="text-sm font-medium text-gray-900">
              {{ selectedDriver.name }}
            </div>
            <div class="text-xs text-gray-600">
              {{ selectedDriver.phone }}
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">
          Chọn một tài xế để gán lịch
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            @click="handleClose"
            class="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            @click="handleAssign"
            :disabled="!canAssign || isAssigning"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <div v-if="isAssigning" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{{ isAssigning ? 'Đang gán...' : 'Xác nhận' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>