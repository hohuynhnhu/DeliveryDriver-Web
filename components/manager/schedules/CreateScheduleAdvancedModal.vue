<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Settings, MapPin, Loader2, AlertCircle, Info } from 'lucide-vue-next'
import type { SchedulingResponse, CreateScheduleRequest } from '@/@type/schedule'

const emit = defineEmits<{
  close: []
  success: [response: SchedulingResponse]
}>()

const { createScheduleWithGA, getOrdersGroupedByArea, isLoading } = useSchedule()
const { postOfficeId } = useAuth()

// State
const formData = ref<CreateScheduleRequest>({
  scheduled_date: '',
  area_codes: [],
  post_office_id: postOfficeId.value || '',
  max_orders_per_schedule: 15,
  max_distance_km: 40,
  population_size: 50,
  generations: 100,
  mutation_rate: 0.1,
  crossover_rate: 0.8,
  elite_size: 5
})

const availableAreas = ref<string[]>([])
const showAdvanced = ref(false)
const errorMsg = ref<string>('')

// Computed
const canSubmit = computed(() => {
  return formData.value.scheduled_date && formData.value.area_codes.length > 0
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
  const index = formData.value.area_codes.indexOf(area)
  if (index > -1) {
    formData.value.area_codes.splice(index, 1)
  } else {
    formData.value.area_codes.push(area)
  }
}

const selectAllAreas = () => {
  if (formData.value.area_codes.length === availableAreas.value.length) {
    formData.value.area_codes = []
  } else {
    formData.value.area_codes = [...availableAreas.value]
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return

  errorMsg.value = ''
  
  const result = await createScheduleWithGA(formData.value)

  if (result) {
    emit('success', result)
    emit('close')
  } else {
    errorMsg.value = 'Không thể tạo lịch. Vui lòng thử lại.'
  }
}

onMounted(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.value.scheduled_date = tomorrow.toISOString().split('T')[0]
  formData.value.post_office_id = postOfficeId.value || ''
  loadAreas()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="emit('close')">
    <div 
      class="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b px-6 py-4 rounded-t-xl z-10">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <Settings class="w-6 h-6 text-purple-500" />
          Tạo lịch nâng cao
        </h2>
        <p class="text-sm text-gray-500 mt-1">Tùy chỉnh tham số Genetic Algorithm</p>
      </div>

      <!-- Body -->
      <div class="p-6 space-y-6">
        
        <!-- Basic Settings -->
        <div class="space-y-4">
          <h3 class="font-semibold text-gray-900 flex items-center gap-2">
            📋 Thông tin cơ bản
          </h3>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Ngày giao hàng *
              </label>
              <input
                v-model="formData.scheduled_date"
                type="date"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                :min="new Date().toISOString().split('T')[0]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                Max đơn/lịch
                <Info class="w-4 h-4 text-gray-400" title="Số đơn tối đa trong 1 schedule" />
              </label>
              <input
                v-model.number="formData.max_orders_per_schedule"
                type="number"
                min="5"
                max="30"
                class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <!-- Areas -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">
                Chọn khu vực * ({{ formData.area_codes.length }}/{{ availableAreas.length }})
              </label>
              <button
                v-if="availableAreas.length > 0"
                @click="selectAllAreas"
                class="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                {{ formData.area_codes.length === availableAreas.values.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
              </button>
            </div>

            <div v-if="availableAreas.length === 0" class="text-center py-6 bg-yellow-50 rounded-lg">
              <AlertCircle class="w-10 h-10 mx-auto text-yellow-500 mb-2" />
              <p class="text-sm text-gray-600">{{ errorMsg || 'Đang tải...' }}</p>
            </div>

            <div v-else class="border rounded-lg max-h-48 overflow-y-auto divide-y">
              <label
                v-for="area in availableAreas"
                :key="area"
                class="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="formData.area_codes.includes(area)"
                  @change="toggleArea(area)"
                  class="w-4 h-4 text-purple-600 rounded"
                />
                <MapPin class="w-4 h-4 text-gray-400" />
                <span class="text-sm">{{ area }}</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Advanced Settings (Toggle) -->
        <div class="border-t pt-6">
          <button
            @click="showAdvanced = !showAdvanced"
            class="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-2 mb-4"
          >
            <Settings class="w-4 h-4" />
            {{ showAdvanced ? '▼ Ẩn' : '▶ Hiện' }} cấu hình nâng cao (Genetic Algorithm)
          </button>

          <div v-if="showAdvanced" class="p-4 bg-purple-50 rounded-lg space-y-4">
            <h4 class="font-semibold text-sm text-purple-900 flex items-center gap-2">
              ⚙️ Tham số Genetic Algorithm
            </h4>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Population Size
                  <Info class="w-3 h-3 inline text-gray-400" title="Kích thước quần thể (30-100)" />
                </label>
                <input 
                  v-model.number="formData.population_size" 
                  type="number" 
                  min="30"
                  max="100"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Generations
                  <Info class="w-3 h-3 inline text-gray-400" title="Số thế hệ (50-200)" />
                </label>
                <input 
                  v-model.number="formData.generations" 
                  type="number" 
                  min="50"
                  max="200"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Elite Size
                  <Info class="w-3 h-3 inline text-gray-400" title="Số cá thể ưu tú (2-10)" />
                </label>
                <input 
                  v-model.number="formData.elite_size" 
                  type="number" 
                  min="2"
                  max="10"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Mutation Rate
                  <Info class="w-3 h-3 inline text-gray-400" title="Tỷ lệ đột biến (0.05-0.3)" />
                </label>
                <input 
                  v-model.number="formData.mutation_rate" 
                  type="number" 
                  step="0.01"
                  min="0.05"
                  max="0.3"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Crossover Rate
                  <Info class="w-3 h-3 inline text-gray-400" title="Tỷ lệ lai ghép (0.6-0.9)" />
                </label>
                <input 
                  v-model.number="formData.crossover_rate" 
                  type="number" 
                  step="0.01"
                  min="0.6"
                  max="0.9"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1">
                  Max Distance (km)
                  <Info class="w-3 h-3 inline text-gray-400" title="Khoảng cách tối đa" />
                </label>
                <input 
                  v-model.number="formData.max_distance_km" 
                  type="number" 
                  min="20"
                  max="100"
                  class="w-full px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-purple-500" 
                />
              </div>
            </div>

            <p class="text-xs text-purple-700 mt-2">
              💡 Giá trị mặc định đã được tối ưu. Chỉ thay đổi nếu bạn hiểu rõ ý nghĩa các tham số.
            </p>
          </div>
        </div>

        <!-- Error -->
        <div v-if="errorMsg && !isLoading" class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          <AlertCircle class="w-4 h-4 inline mr-2" />
          {{ errorMsg }}
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-gray-50 border-t px-6 py-4 rounded-b-xl flex gap-3">
        <button
          @click="emit('close')"
          :disabled="isLoading"
          class="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50"
        >
          Hủy
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit || isLoading"
          class="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-5 h-5 animate-spin" />
          <Settings v-else class="w-5 h-5" />
          <span>{{ isLoading ? 'Đang tạo lịch...' : 'Tạo lịch nâng cao' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>