// components/order/ReceiverInfo.vue
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
        <Home class="w-4 h-4 text-green-600" />
      </div>
      <h2 class="text-lg font-bold text-gray-900">Thông tin người nhận</h2>
    </div>

    <!-- Search Section -->
    <div class="mb-6 bg-purple-50 rounded-lg p-4 border border-purple-100">
      <label class="block text-sm font-medium text-purple-900 mb-2">
        Tìm kiếm người nhận có sẵn
      </label>
      <div class="flex gap-2">
        <div class="relative flex-1">
          <input 
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
            type="text" 
            placeholder="Nhập số điện thoại hoặc email..."
            class="w-full pl-10 pr-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
          />
          <Search class="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
        </div>
        <button 
          @click="handleSearch"
          :disabled="isLoading"
          class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
          <span v-else>Tìm</span>
        </button>
      </div>

      <p v-if="searchError" class="text-red-500 text-xs mt-2 flex items-center gap-1">
        <AlertCircle class="w-3 h-3" /> {{ searchError }}
      </p>

      <div v-if="foundUser" class="mt-3 bg-white p-3 rounded border border-purple-200 shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ foundUser.full_name || 'Người dùng ẩn danh' }}</p>
            <p class="text-gray-500 text-xs">{{ foundUser.phone || foundUser.email }}</p>
            <p class="text-gray-500 text-xs mt-1 line-clamp-1">{{ foundUser.address_detail }}</p>
          </div>
          <button 
            @click="applyFoundUser"
            class="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 font-medium transition-colors"
          >
            Chọn
          </button>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="relative">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center">
        <span class="bg-white px-2 text-xs text-gray-500 uppercase tracking-wider">Hoặc nhập thủ công</span>
      </div>
    </div>

    <!-- Form Section -->
    <div class="space-y-4 mt-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Tên người nhận <span class="text-red-500">*</span>
        </label>
        <input
          :value="modelValue.name"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
          placeholder="Trần Thị B"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Số điện thoại <span class="text-red-500">*</span>
        </label>
        <input
          :value="modelValue.phone"
          @input="updateField('phone', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
          placeholder="0909 xxx xxx"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Địa chỉ giao hàng <span class="text-red-500">*</span>
        </label>
        <div class="flex gap-2">
          <textarea
            :value="modelValue.address"
            @input="updateField('address', ($event.target as HTMLInputElement).value)"
            rows="2"
            required
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
            placeholder="Số nhà, đường, quận, thành phố"
          />
          <button
            @click="showMap = true"
            type="button"
            class="px-4 py-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2 border border-green-200 whitespace-nowrap self-start"
          >
            <Map class="w-5 h-5" />
            Bản đồ
          </button>
        </div>
      </div>

      <!-- Hiển thị tọa độ -->
      <div v-if="modelValue.location" class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
        <Map class="w-4 h-4" />
        <span>Tọa độ: {{ formatLocation(modelValue.location) }}</span>
      </div>

      <!-- Hiển thị area code -->
      <div v-if="modelValue.areaCode && modelValue.areaCode !== 'UNKNOWN'" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Mã khu vực (area_code) <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center gap-2">
          <input
            :value="modelValue.areaCode"
            @input="updateField('areaCode', ($event.target as HTMLInputElement).value)"
            type="text"
            class="flex-1 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-800 font-mono text-sm"
            placeholder="HCMQ1, HCMGV..."
          />
          <div class="flex items-center gap-1 text-green-600 text-xs">
            <Check class="w-4 h-4" />
            <span>Tự động</span>
          </div>
        </div>
        <p class="text-xs text-gray-500">Mã khu vực được tự động sinh từ địa chỉ trên bản đồ</p>
      </div>

      <!-- Fallback: nhập thủ công nếu chưa có -->
      <div v-else>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Mã khu vực (area_code) <span class="text-red-500">*</span>
        </label>
        <input
          :value="modelValue.areaCode"
          @input="updateField('areaCode', ($event.target as HTMLInputElement).value)"
          type="text"
          required
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-shadow"
          placeholder="HCMQ1, HCMGV, HNHK..."
        />
        <p class="text-xs text-gray-500 mt-1">
          💡 Chọn địa chỉ trên bản đồ để tự động sinh mã khu vực
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="isGeneratingAreaCode" class="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
        <Loader2 class="w-4 h-4 animate-spin" />
        <span>Đang xác định mã khu vực...</span>
      </div>
    </div>

    <MapModal
      v-model="showMap"
      title="Chọn vị trí người nhận"
      :initial-lat="modelValue.location?.lat || 10.7769"
      :initial-lng="modelValue.location?.lng || 106.7009"
      @select="handleLocationSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Home, Map, Search, Loader2, AlertCircle, Check, MapPin } from 'lucide-vue-next'
import MapModal from '@/components/map/MapModal.vue'
import { useAuth } from '@/composables/useAuth'
import type { GeoPoint } from '@/@type/auth'
import { getAreaCodeFromLocation } from '@/utils/areaCodeService'

interface ReceiverInfo {
  name: string
  phone: string
  address: string
  areaCode: string
  location: GeoPoint | null
}

const props = defineProps<{
  modelValue: ReceiverInfo
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ReceiverInfo]
}>()

// State
const showMap = ref(false)
const searchKeyword = ref('')
const searchError = ref('')
const foundUser = ref<any>(null)
const isGeneratingAreaCode = ref(false)

const { searchUser, isLoading } = useAuth()

// Methods
const updateField = (field: keyof ReceiverInfo, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

// 🔥 XỬ LÝ KHI CHỌN TỪ BẢN ĐỒ
const handleLocationSelect = async (location: GeoPoint, address: string) => {
  // Cập nhật location và address trước
  emit('update:modelValue', {
    ...props.modelValue,
    location,
    address
  })

  // 🎯 TỰ ĐỘNG SINH AREA CODE
  isGeneratingAreaCode.value = true
  try {
    const areaCode = await getAreaCodeFromLocation(location, address)
    emit('update:modelValue', {
      ...props.modelValue,
      location,
      address,
      areaCode
    })
  } catch (error) {
    console.error('Error generating area code:', error)
    emit('update:modelValue', {
      ...props.modelValue,
      location,
      address,
      areaCode: 'UNKNOWN'
    })
  } finally {
    isGeneratingAreaCode.value = false
  }
}

const formatLocation = (location: GeoPoint | null) => {
  if (!location) return 'Chưa chọn vị trí'
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

// Search Logic
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    searchError.value = 'Vui lòng nhập thông tin tìm kiếm'
    return
  }

  searchError.value = ''
  foundUser.value = null

  const result = await searchUser(searchKeyword.value)

  if (result) {
    foundUser.value = result
  } else {
    searchError.value = 'Không tìm thấy người dùng này'
  }
}

const applyFoundUser = () => {
  if (!foundUser.value) return

  emit('update:modelValue', {
    name: foundUser.value.full_name || foundUser.value.name || '', 
    phone: foundUser.value.phone || searchKeyword.value, 
    address: foundUser.value.address_detail || '',
    areaCode: foundUser.value.area_code || '',
    location: foundUser.value.location || null
  })

  searchKeyword.value = ''
  foundUser.value = null
}
</script>