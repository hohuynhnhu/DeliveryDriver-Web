<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <Building2 class="w-4 h-4 text-blue-600" />
        </div>
        <h2 class="text-lg font-bold text-gray-900">Điểm giao hàng bổ sung</h2>
      </div>
      <button
        v-if="!showAddForm"
        @click="showAddForm = true"
        type="button"
        class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm shadow-blue-200"
      >
        <Plus class="w-4 h-4" />
        Thêm điểm đến
      </button>
    </div>

    <div v-if="showAddForm" class="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200 shadow-inner">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-semibold text-gray-800">Thêm điểm giao hàng mới</h3>
        <button @click="cancelAdd" class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <div class="mb-5 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
        <label class="block text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
          Tìm kiếm người nhận nhanh
        </label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <input 
              v-model="searchKeyword"
              @keyup.enter="handleSearch"
              type="text" 
              placeholder="Nhập SĐT hoặc email..."
              class="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
            />
            <Search class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button 
            @click="handleSearch"
            :disabled="isLoading"
            type="button"
            class="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-70 flex items-center gap-2 text-sm"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin" />
            <span v-else>Tìm</span>
          </button>
        </div>

        <p v-if="searchError" class="text-red-500 text-xs mt-2 flex items-center gap-1">
          <AlertCircle class="w-3 h-3" /> {{ searchError }}
        </p>

        <div v-if="foundUser" class="mt-3 bg-blue-50 p-3 rounded border border-blue-200">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-gray-900 text-sm">{{ foundUser.full_name || 'Người dùng ẩn danh' }}</p>
              <p class="text-gray-600 text-xs">{{ foundUser.phone || foundUser.email }}</p>
              <p class="text-gray-500 text-xs mt-1 line-clamp-1">{{ foundUser.address_detail }}</p>
            </div>
            <button 
              @click="applyFoundUser"
              type="button"
              class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              Chọn
            </button>
          </div>
        </div>
      </div>

      <div class="relative mb-5">
        <div class="absolute inset-0 flex items-center" aria-hidden="true">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center">
          <span class="bg-gray-50 px-2 text-xs text-gray-500">Thông tin chi tiết</span>
        </div>
      </div>

      <div class="space-y-3">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            v-model="newDestination.receiver"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Tên người nhận *"
          />
          <input
            v-model="newDestination.phone"
            type="text"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder="Số điện thoại *"
          />
        </div>

        <textarea
          v-model="newDestination.address"
          rows="2"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Địa chỉ giao hàng *"
        />
        
        <input
          v-model="newDestination.areaCode"
          type="text"
          class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          placeholder="Mã khu vực (HCMQ1, HCMSG...) *"
        />
        
        <div>
          <div class="px-4 py-2.5 bg-white rounded-lg text-gray-700 text-sm mb-2 border border-gray-200 flex justify-between items-center">
            <span :class="{'text-gray-400': !newDestination.location}">
              {{ formatLocation(newDestination.location) }}
            </span>
            <Check v-if="newDestination.location" class="w-4 h-4 text-green-500" />
          </div>
          <button
            @click="openMapPicker(null)"
            type="button"
            class="w-full px-4 py-2.5 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 border border-blue-200 font-medium"
          >
            <Map class="w-4 h-4" />
            Chọn vị trí trên bản đồ
          </button>
        </div>

        <div class="flex gap-3 mt-4 pt-4 border-t border-gray-200">
          <button
            @click="cancelAdd"
            type="button"
            class="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy bỏ
          </button>
          <button
            @click="addDestination"
            type="button"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md shadow-blue-200"
          >
            Lưu điểm đến
          </button>
        </div>
      </div>
    </div>

    <div v-if="modelValue.length > 0" class="space-y-3">
      <div
        v-for="(dest, idx) in modelValue"
        :key="dest.id"
        class="group relative flex items-start gap-4 p-4 border border-gray-100 rounded-xl bg-white hover:border-blue-200 hover:shadow-md transition-all"
      >
        <div class="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold flex items-center justify-center text-sm group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
          {{ idx + 1 }}
        </div>

        <div class="flex-1">
          <div class="flex justify-between items-start">
            <h4 class="font-bold text-gray-900">{{ dest.receiver }}</h4>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{{ dest.areaCode }}</span>
          </div>
          <p class="text-sm text-gray-600 mt-0.5">{{ dest.phone }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ dest.address }}</p>
          
          <button
            @click="openMapPicker(idx)"
            type="button"
            class="mt-2 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            <Map class="w-3 h-3" />
            {{ dest.location ? 'Cập nhật vị trí' : 'Thêm vị trí' }}
          </button>
        </div>

        <button
          @click="removeDestination(dest.id)"
          type="button"
          class="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Xóa điểm đến"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-else-if="!showAddForm" class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <Building2 class="w-10 h-10 text-gray-300 mx-auto mb-2" />
      <p class="text-sm text-gray-500">Chưa có điểm giao hàng bổ sung</p>
      <button 
        @click="showAddForm = true"
        class="mt-2 text-sm text-blue-600 font-medium hover:underline"
      >
        Thêm ngay
      </button>
    </div>

    <MapModal
      v-model="showMapPicker"
      :title="editingIndex !== null ? 'Chỉnh sửa vị trí điểm giao hàng' : 'Chọn vị trí điểm giao hàng bổ sung'"
      :initial-lat="getEditingLat()"
      :initial-lng="getEditingLng()"
      @select="handleLocationSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Building2, Plus, X, Map, Search, Loader2, AlertCircle, Check } from 'lucide-vue-next'
import MapModal from '@/components/map/MapModal.vue'
import { useAuth } from '@/composables/useAuth' // Import useAuth
import type { GeoPoint } from '@/@type/auth'

interface Destination {
  id: number
  receiver: string
  phone: string
  address: string
  areaCode: string
  location: GeoPoint | null
}

const props = defineProps<{
  modelValue: Destination[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Destination[]]
}>()

// --- State ---
const showAddForm = ref(false)
const showMapPicker = ref(false)
const editingIndex = ref<number | null>(null)

// Search State
const { searchUser, isLoading } = useAuth()
const searchKeyword = ref('')
const searchError = ref('')
const foundUser = ref<any>(null)

// Form Model
const newDestination = ref<Omit<Destination, 'id'>>({
  receiver: '',
  phone: '',
  address: '',
  areaCode: '',
  location: null
})

// --- Search Logic ---
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
  
  newDestination.value = {
    ...newDestination.value,
    receiver: foundUser.value.full_name || foundUser.value.name || '',
    phone: foundUser.value.phone || searchKeyword.value, // Fallback phone
    address: foundUser.value.address_detail || '',
    areaCode: foundUser.value.area_code || '',
    location: foundUser.value.location || null
  }
  
  // Clear search results visually but keep form filled
  foundUser.value = null
  searchKeyword.value = ''
}

// --- CRUD & Helpers ---
const formatLocation = (location: GeoPoint | null) => {
  if (!location) return 'Chưa chọn vị trí'
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

const addDestination = () => {
  if (!newDestination.value.receiver || !newDestination.value.phone || !newDestination.value.address) {
    alert('Vui lòng điền các trường bắt buộc (*)')
    return
  }

  const destinations = [...props.modelValue, {
    ...newDestination.value,
    id: Date.now()
  }]
  
  emit('update:modelValue', destinations)
  resetForm()
}

const cancelAdd = () => {
  resetForm()
}

const resetForm = () => {
  showAddForm.value = false
  newDestination.value = {
    receiver: '',
    phone: '',
    address: '',
    areaCode: '',
    location: null
  }
  // Reset search state too
  searchKeyword.value = ''
  searchError.value = ''
  foundUser.value = null
}

const removeDestination = (id: number) => {
  if(!confirm('Bạn có chắc muốn xóa điểm giao hàng này?')) return
  const destinations = props.modelValue.filter(d => d.id !== id)
  emit('update:modelValue', destinations)
}

// --- Map Logic ---
const openMapPicker = (index: number | null) => {
  editingIndex.value = index
  showMapPicker.value = true
}

const handleLocationSelect = (location: GeoPoint, address: string) => {
  if (editingIndex.value !== null) {
    // Edit existing destination
    const destinations = [...props.modelValue]
    destinations[editingIndex.value] = {
      ...destinations[editingIndex.value],
      location,
      address
    }
    emit('update:modelValue', destinations)
  } else {
    // New destination form
    newDestination.value.location = location
    newDestination.value.address = address
  }
  editingIndex.value = null
}

const getEditingLat = () => {
  if (editingIndex.value !== null && props.modelValue[editingIndex.value]) {
    return props.modelValue[editingIndex.value].location?.lat || 10.7769
  }
  return newDestination.value.location?.lat || 10.7769
}

const getEditingLng = () => {
  if (editingIndex.value !== null && props.modelValue[editingIndex.value]) {
    return props.modelValue[editingIndex.value].location?.lng || 106.7009
  }
  return newDestination.value.location?.lng || 106.7009
}
</script>