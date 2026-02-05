// components/order/SenderInfo.vue
<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <Send class="w-5 h-5 text-purple-600" />
        <h2 class="text-lg font-bold text-gray-900">Thông tin người gửi</h2>
      </div>
      
      <button 
        @click="resetToDefault"
        class="text-sm text-purple-600 hover:text-purple-800 underline"
        v-if="isModified"
      >
        Lấy lại thông tin mặc định
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tên người gửi <span class="text-red-500">*</span></label>
        <input
          v-model="localInfo.name"
          type="text"
          placeholder="Nhập tên người gửi"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại <span class="text-red-500">*</span></label>
        <input
          v-model="localInfo.phone"
          type="tel"
          placeholder="Nhập số điện thoại"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ lấy hàng <span class="text-red-500">*</span></label>
        <div class="flex gap-2">
          <input
            v-model="localInfo.address"
            type="text"
            placeholder="Nhập địa chỉ hoặc chọn trên bản đồ"
            class="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition"
          />
          <button
            @click="showMapModal = true"
            type="button"
            class="px-4 py-2.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2 border border-purple-200 whitespace-nowrap"
          >
            <MapPin class="w-5 h-5" />
            Bản đồ
          </button>
        </div>
      </div>

      <!-- Hiển thị tọa độ -->
      <div v-if="localInfo.location" class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
        <Map class="w-4 h-4" />
        <span>Tọa độ: {{ formatLocation(localInfo.location) }}</span>
      </div>

      <!-- Hiển thị area code đã sinh -->
      <div v-if="localInfo.areaCode" class="space-y-2">
        <label class="block text-sm font-medium text-gray-700">
          Mã khu vực (pickup_area_code)
        </label>
        <div class="flex items-center gap-2">
          <input
            v-model="localInfo.areaCode"
            type="text"
            readonly
            class="flex-1 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-800 font-mono text-sm"
            placeholder="Tự động sinh từ địa chỉ"
          />
          <div class="flex items-center gap-1 text-green-600 text-xs">
            <Check class="w-4 h-4" />
            <span>Tự động</span>
          </div>
        </div>
      </div>

      <!-- Loading state khi đang sinh area code -->
      <div v-if="isGeneratingAreaCode" class="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
        <Loader2 class="w-4 h-4 animate-spin" />
        <span>Đang xác định mã khu vực...</span>
      </div>
    </div>

    <LocationPickerModal
      v-model="showMapModal"
      title="Chọn địa điểm lấy hàng"
      :initial-lat="localInfo.location?.lat"
      :initial-lng="localInfo.location?.lng"
      @select="handleLocationSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Send, Map, MapPin, Check, Loader2 } from 'lucide-vue-next'
import LocationPickerModal from '../map/LocationPicker.vue' 
import type { User } from '@/@type/auth'
import type { GeoPoint } from '@/@type/order'
import { getAreaCodeFromLocation } from '@/utils/areaCodeService'

const props = defineProps<{
  user: User | null
  modelValue: {
    name: string
    phone: string
    address: string
    areaCode: string
    location: GeoPoint | null
  }
}>()

const emit = defineEmits(['update:modelValue'])

// State
const showMapModal = ref(false)
const localInfo = ref({ ...props.modelValue })
const isGeneratingAreaCode = ref(false)

// Check xem user có sửa gì so với mặc định không
const isModified = computed(() => {
  if (!props.user) return false
  return localInfo.value.name !== props.user.full_name ||
         localInfo.value.phone !== props.user.phone ||
         localInfo.value.address !== props.user.address_detail
})

// Format tọa độ
const formatLocation = (location: GeoPoint | null | undefined) => {
  if (!location) return ''
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

// 🔥 XỬ LÝ KHI CHỌN TỪ BẢN ĐỒ
const handleLocationSelect = async (location: GeoPoint, address: string) => {
  localInfo.value.location = location
  localInfo.value.address = address

  // 🎯 TỰ ĐỘNG SINH AREA CODE
  isGeneratingAreaCode.value = true
  try {
    const areaCode = await getAreaCodeFromLocation(location, address)
    localInfo.value.areaCode = areaCode
  } catch (error) {
    console.error('Error generating area code:', error)
    localInfo.value.areaCode = 'UNKNOWN'
  } finally {
    isGeneratingAreaCode.value = false
  }
}

// Watch để emit changes
watch(localInfo, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

// Reset về thông tin mặc định
const resetToDefault = () => {
  if (props.user) {
    localInfo.value = {
      name: props.user.full_name || '',
      phone: props.user.phone || '',
      address: props.user.address_detail || '',
      areaCode: props.user.area_code || '',
      location: props.user.location || null
    }
  }
}

// Auto-fill khi user load xong
watch(() => props.user, (newUser) => {
  if (newUser && !localInfo.value.name) {
    resetToDefault()
  }
}, { immediate: true })
</script>