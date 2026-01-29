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

      <div v-if="localInfo.location" class="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
        <Map class="w-4 h-4" />
        <span>Tọa độ: {{ formatLocation(localInfo.location) }}</span>
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
import { ref, watch, onMounted, computed } from 'vue'
import { Send, Map, MapPin } from 'lucide-vue-next'
import LocationPickerModal from '../map/LocationPicker.vue' 
import type { User } from '@/@type/auth'
import type { GeoPoint } from '@/@type/order'

// Định nghĩa Props và Emits
const props = defineProps<{
  user: User | null
  // Dùng modelValue để parent có thể v-model dữ liệu này
  modelValue: {
    name: string
    phone: string
    address: string
    areaCode: string
    location: GeoPoint | null
  }
}>()

const emit = defineEmits(['update:modelValue'])

// State nội bộ
const showMapModal = ref(false)
const localInfo = ref({ ...props.modelValue })

// Check xem user có sửa gì so với mặc định không
const isModified = computed(() => {
    if (!props.user) return false
    return localInfo.value.name !== props.user.full_name ||
           localInfo.value.phone !== props.user.phone ||
           localInfo.value.address !== props.user.address_detail
})

// Hàm format tọa độ cho đẹp
const formatLocation = (location: GeoPoint | null | undefined) => {
  if (!location) return ''
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

// Khi chọn từ Modal bản đồ
const handleLocationSelect = (location: GeoPoint, address: string) => {
    localInfo.value.location = location
    localInfo.value.address = address // Tự động điền địa chỉ từ map
    // Bạn có thể xử lý areaCode ở đây nếu API map trả về
}

// Watch sự thay đổi của localInfo để báo lên Parent
watch(localInfo, (newVal) => {
    emit('update:modelValue', newVal)
}, { deep: true })

// Hàm reset về thông tin user gốc
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

// Khởi tạo lần đầu khi props.user load xong (trường hợp user load async)
watch(() => props.user, (newUser) => {
    // Chỉ auto-fill nếu form đang trống (tránh ghi đè khi user đang nhập)
    if (newUser && !localInfo.value.name) {
        resetToDefault()
    }
}, { immediate: true })

</script>