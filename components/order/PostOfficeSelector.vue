<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          <Building class="w-4 h-4 text-orange-600" />
        </div>
        <h2 class="text-lg font-bold text-gray-900">Chọn bưu cục xử lý</h2>
      </div>
      
      <button
        v-if="selectedPostOffice"
        @click="clearSelection"
        type="button"
        class="text-sm text-gray-500 hover:text-gray-700 underline"
      >
        Hủy chọn
      </button>
    </div>

    <!-- Filter by Area -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Lọc theo khu vực
      </label>
      <div class="flex gap-2">
        <input
          v-model="filterAreaCode"
          type="text"
          placeholder="Nhập mã khu vực (Q1, THUDUC...)"
          @keyup.enter="handleFilter"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
        />
        <button
          @click="handleFilter"
          :disabled="isLoading"
          type="button"
          class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <Filter v-else class="w-4 h-4" />
          Lọc
        </button>
        <button
          @click="loadAllPostOffices"
          :disabled="isLoading"
          type="button"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
        >
          Tất cả
        </button>
      </div>
    </div>

    <!-- Selected Post Office -->
    <div v-if="selectedPostOffice" class="mb-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <Check class="w-5 h-5 text-orange-600" />
            <h3 class="font-bold text-gray-900">{{ selectedPostOffice.name }}</h3>
          </div>
          <p class="text-sm text-gray-600">{{ selectedPostOffice.address }}</p>
          <div class="flex gap-4 mt-2 text-xs text-gray-500">
            <span> {{ selectedPostOffice.area_codes }}</span>
            <span> {{ selectedPostOffice.phone }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Office List -->
    <div v-if="!selectedPostOffice" class="space-y-3 max-h-96 overflow-y-auto">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <Loader2 class="w-8 h-8 animate-spin text-orange-600 mx-auto" />
        <p class="text-sm text-gray-500 mt-2">Đang tải danh sách bưu cục...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="postOffices.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <Building class="w-12 h-12 text-gray-300 mx-auto mb-2" />
        <p class="text-sm text-gray-500">Không tìm thấy bưu cục</p>
        <p class="text-xs text-gray-400 mt-1">Thử lọc theo khu vực khác hoặc nhấn "Tất cả"</p>
      </div>

      <!-- Post Office Cards -->
      <button
        v-else
        v-for="office in postOffices"
        :key="office.id"
        @click="selectOffice(office)"
        type="button"
        class="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all group"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                {{ office.name }}
              </h3>
              
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ office.address }}</p>
            <div class="flex flex-wrap gap-2 mt-2">
              <span 
                v-for="area in office.area_codes" 
                :key="area"
                class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                 {{ area }}
              </span>
            </div>
            <div class="flex gap-4 mt-2 text-xs text-gray-500">
              <span> {{ office.phone }}</span>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors flex-shrink-0 ml-2" />
        </div>
      </button>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-4 text-sm text-red-500 flex items-center gap-2">
      <AlertCircle class="w-4 h-4" />
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Building, Filter, Loader2, Check, ChevronRight, AlertCircle } from 'lucide-vue-next'
import { usePostOffice } from '@/composables/usePostOffice'
import type { PostOffice } from '@/@type/postOffice'

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const props = defineProps<{
  modelValue: string
}>()

const { 
  postOffices, 
  selectedPostOffice, 
  isLoading, 
  error,
  getAllPostOffices,
  getPostOfficesByArea,
  selectPostOffice,
  clearError
} = usePostOffice()

const filterAreaCode = ref('')

onMounted(async () => {
  console.log(' PostOfficeSelector mounted')
  await loadAllPostOffices()
  console.log(' Post offices after mount:', postOffices.value.length, 'offices')
  
  if (props.modelValue && postOffices.value.length > 0) {
    const found = postOffices.value.find(po => po.id === props.modelValue)
    if (found) {
      selectPostOffice(found)
    }
  }
})

const loadAllPostOffices = async () => {
  console.log(' Loading all post offices...')
  filterAreaCode.value = ''
  await getAllPostOffices()
  console.log(' Loaded:', postOffices.value.length, 'offices')
}

const handleFilter = async () => {
  if (!filterAreaCode.value.trim()) {
    await loadAllPostOffices()
    return
  }
  
  console.log(' Filtering by:', filterAreaCode.value)
  await getPostOfficesByArea(filterAreaCode.value.trim().toUpperCase())
}

const selectOffice = (office: PostOffice) => {
  console.log(' Office selected:', office.name)
  selectPostOffice(office)
  emit('update:modelValue', office.id)
}

const clearSelection = () => {
  console.log(' Selection cleared')
  selectPostOffice(null)
  emit('update:modelValue', '')
}

// Debug watches
watch(postOffices, (newVal) => {
  console.log(' Post offices changed. Count:', newVal.length)
}, { immediate: true })

watch(isLoading, (newVal) => {
  console.log(' Loading state:', newVal)
})

watch(error, (newVal) => {
  if (newVal) {
    console.error(' Error:', newVal)
  }
})
</script>
