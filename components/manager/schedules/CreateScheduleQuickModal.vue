<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar, MapPin, Loader2, AlertCircle, Zap } from 'lucide-vue-next'
import type { SchedulingResponse } from '@/@type/schedule'

const emit = defineEmits<{
  close: []
  success: [response: SchedulingResponse]
}>()

const { 
  createScheduleQuick, 
  getOrdersGroupedByArea,
  isLoading 
} = useSchedule()

// State
const scheduledDate = ref<string>('')
const availableAreas = ref<string[]>([])
const selectedAreas = ref<string[]>([])
const errorMsg = ref<string>('')

// Computed
const canSubmit = computed(() => {
  return scheduledDate.value && selectedAreas.value.length > 0
})

// Methods
const loadAreas = async () => {
  try {
    const grouped = await getOrdersGroupedByArea('pending')
    availableAreas.value = Object.keys(grouped).filter(area => grouped[area].total_orders > 0)
    
    if (availableAreas.value.length === 0) {
      errorMsg.value = 'Không có đơn hàng confirmed nào để tạo lịch'
    }
  } catch (e) {
    console.error('Error loading areas:', e)
    errorMsg.value = 'Không thể tải danh sách khu vực'
  }
}

const toggleArea = (area: string) => {
  const index = selectedAreas.value.indexOf(area)
  if (index > -1) {
    selectedAreas.value.splice(index, 1)
  } else {
    selectedAreas.value.push(area)
  }
}

const selectAllAreas = () => {
  if (selectedAreas.value.length === availableAreas.value.length) {
    selectedAreas.value = []
  } else {
    selectedAreas.value = [...availableAreas.value]
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  errorMsg.value = ''
  
  const result = await createScheduleQuick({
    scheduled_date: scheduledDate.value,
    area_codes: selectedAreas.value
  })

  if (result) {
    emit('success', result)
    emit('close')
  } else {
    errorMsg.value = 'Không thể tạo lịch. Vui lòng thử lại.'
  }
}

// Lifecycle
onMounted(() => {
  // Set ngày mặc định = ngày mai
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  scheduledDate.value = tomorrow.toISOString().split('T')[0]
  
  loadAreas()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="emit('close')">
    <div 
      class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl">
        <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Zap class="w-6 h-6 text-blue-500" />
          Tạo lịch giao hàng nhanh
        </h2>
        <p class="text-sm text-gray-500 mt-1">
          Sử dụng Genetic Algorithm với cấu hình mặc định
        </p>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        
        <!-- Chọn ngày -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Ngày giao hàng *
          </label>
          <input
            v-model="scheduledDate"
            type="date"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            :min="new Date().toISOString().split('T')[0]"
          />
        </div>

        <!-- Chọn khu vực -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-semibold text-gray-700">
              Chọn khu vực * ({{ selectedAreas.length }}/{{ availableAreas.length }})
            </label>
            <button
              v-if="availableAreas.length > 0"
              @click="selectAllAreas"
              class="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {{ selectedAreas.length === availableAreas.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
            </button>
          </div>

          <!-- Loading areas -->
          <div v-if="isLoading && availableAreas.length === 0" class="text-center py-8">
            <Loader2 class="w-8 h-8 animate-spin mx-auto text-gray-400" />
            <p class="text-sm text-gray-500 mt-2">Đang tải danh sách khu vực...</p>
          </div>

          <!-- No areas -->
          <div v-else-if="availableAreas.length === 0" class="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle class="w-12 h-12 mx-auto text-yellow-500 mb-2" />
            <p class="text-sm text-gray-600">{{ errorMsg || 'Không có khu vực nào' }}</p>
          </div>

          <!-- Areas list -->
          <div v-else class="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
            <label
              v-for="area in availableAreas"
              :key="area"
              class="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="selectedAreas.includes(area)"
                @change="toggleArea(area)"
                class="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <MapPin class="w-4 h-4 text-gray-400" />
              <span class="flex-1 text-sm font-medium text-gray-700">{{ area }}</span>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="canSubmit" class="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <h4 class="text-sm font-semibold text-blue-900 mb-2">📋 Thông tin tạo lịch</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li>📅 <strong>Ngày:</strong> {{ scheduledDate }}</li>
            <li>📍 <strong>Khu vực:</strong> {{ selectedAreas.length }} khu vực</li>
            <li>⚙️ <strong>Cấu hình:</strong> Mặc định (Max 15 đơn/lịch, GA tự tối ưu)</li>
            <li>🚚 <strong>Số lịch:</strong> Tự động theo số driver available</li>
          </ul>
        </div>

        <!-- Error message -->
        <div v-if="errorMsg && !isLoading" class="bg-red-50 border border-red-200 rounded-lg p-4">
          <div class="flex gap-2">
            <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0" />
            <p class="text-sm text-red-700">{{ errorMsg }}</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-xl flex gap-3">
        <button
          @click="emit('close')"
          :disabled="isLoading"
          class="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit || isLoading"
          class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Zap v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'Đang tạo lịch...' : 'Tạo lịch nhanh' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>