<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { User, Mail, Phone, MapPin, Lock, Camera, Edit2, Save, X, Map } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import type { GeoPoint } from '@/@type/auth'

definePageMeta({
  layout: false,
})

const { user, fetchCurrentUser, updateProfile, isLoading: authLoading } = useAuth()

const isEditing = ref(false)
const showChangePassword = ref(false)
const showMapPicker = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)
const successMessage = ref('')

// Sử dụng computed để map dữ liệu từ API
const profileData = computed(() => ({
  name: user.value?.full_name || 'Chưa cập nhật',
  email: user.value?.email || '',
  phone: user.value?.phone || 'Chưa cập nhật',
  address: user.value?.address_detail || 'Chưa có địa chỉ',
  area_code: user.value?.area_code || '',
  location: user.value?.location || null,
  avatar: user.value?.avatar_url || '👤',
  memberSince: user.value?.created_at 
    ? new Date(user.value.created_at).toLocaleDateString('vi-VN') 
    : '',
}))

const editData = ref({
  name: '',
  phone: '',
  address: '',
  area_code: '',
  location: null as GeoPoint | null
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Fetch dữ liệu khi component mount
onMounted(async () => {
  isLoading.value = true
  await fetchCurrentUser()
  
  // Initialize edit data
  editData.value = {
    name: user.value?.full_name || '',
    phone: user.value?.phone || '',
    address: user.value?.address_detail || '',
    area_code: user.value?.area_code || '',
    location: user.value?.location || null
  }
  
  isLoading.value = false
})

// Bật/tắt chế độ chỉnh sửa
const toggleEdit = () => {
  if (isEditing.value) {
    // Hủy chỉnh sửa - reset data
    editData.value = {
      name: user.value?.full_name || '',
      phone: user.value?.phone || '',
      address: user.value?.address_detail || '',
      area_code: user.value?.area_code || '',
      location: user.value?.location || null
    }
  }
  isEditing.value = !isEditing.value
}

// Lưu thông tin profile
const saveProfile = async () => {
  isSaving.value = true
  successMessage.value = ''

  try {
    const success = await updateProfile({
      full_name: editData.value.name,
      phone: editData.value.phone,
      address_detail: editData.value.address,
      area_code: editData.value.area_code,
      location: editData.value.location || undefined
    })

    if (success) {
      isEditing.value = false
      successMessage.value = 'Cập nhật thông tin thành công!'
      
      // Tự động ẩn thông báo sau 3s
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Update profile error:', error)
  } finally {
    isSaving.value = false
  }
}

// Xử lý chọn vị trí từ map
const handleLocationSelect = (location: GeoPoint, address: string) => {
  editData.value.location = location
  editData.value.address = address
  showMapPicker.value = false
}

// Format hiển thị location
const formatLocation = (location: GeoPoint | null) => {
  if (!location) return 'Chưa có'
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    <button 
      @click="$router.back()"
      class="fixed top-4 left-4 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow z-50"
    >
      ← Quay lại
    </button>
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Đang tải thông tin...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      <!-- Success Message -->
      <div 
        v-if="successMessage"
        class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        {{ successMessage }}
      </div>

      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <User class="w-6 h-6 text-white" />
          </div>
          Thông Tin Cá Nhân
        </h1>
        <p class="text-gray-600 mt-2 ml-15">
          Quản lý thông tin tài khoản và bảo mật
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column - Profile Card -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            
            <!-- Avatar -->
            <div class="text-center mb-6">
              <div class="relative inline-block">
                <div class="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-6xl border-4 border-white shadow-lg">
                  {{ profileData.avatar }}
                </div>
                <button 
                  v-if="isEditing"
                  class="absolute bottom-4 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Camera class="w-5 h-5" />
                </button>
              </div>
              <h2 class="text-xl font-bold text-gray-900">{{ profileData.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ user?.role || 'Khách hàng' }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-3">
              <button
                v-if="!isEditing"
                @click="toggleEdit"
                class="w-full px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 class="w-4 h-4" />
                Chỉnh sửa thông tin
              </button>

              <template v-else>
                <button
                  @click="saveProfile"
                  :disabled="isSaving"
                  class="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save class="w-4 h-4" />
                  {{ isSaving ? 'Đang lưu...' : 'Lưu thay đổi' }}
                </button>

                <button
                  @click="toggleEdit"
                  :disabled="isSaving"
                  class="w-full px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <X class="w-4 h-4" />
                  Hủy
                </button>
              </template>

              <button
                @click="showChangePassword = !showChangePassword"
                class="w-full px-4 py-2.5 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2 border border-orange-200"
              >
                <Lock class="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </div>

          </div>
        </div>

        <!-- Right Column - Details -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Personal Information -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Thông tin cá nhân</h3>

            <div class="space-y-4">
              <!-- Name -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User class="w-4 h-4" />
                  Họ và tên
                </label>
                <input
                  v-if="isEditing"
                  v-model="editData.name"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.name }}
                </p>
              </div>

              <!-- Email -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Mail class="w-4 h-4" />
                  Email
                </label>
                <p class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.email }}
                </p>
                <p class="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
              </div>

              <!-- Phone -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Phone class="w-4 h-4" />
                  Số điện thoại
                </label>
                <input
                  v-if="isEditing"
                  v-model="editData.phone"
                  type="text"
                  placeholder="0901234567"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.phone }}
                </p>
              </div>

              <!-- Area Code -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin class="w-4 h-4" />
                  Mã khu vực
                </label>
                <input
                  v-if="isEditing"
                  v-model="editData.area_code"
                  type="text"
                  placeholder="Q1, Q2..."
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.area_code || 'Chưa cập nhật' }}
                </p>
              </div>

              <!-- Address -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin class="w-4 h-4" />
                  Địa chỉ chi tiết
                </label>
                <textarea
                  v-if="isEditing"
                  v-model="editData.address"
                  rows="2"
                  placeholder="123 Nguyễn Huệ, Quận 1"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.address }}
                </p>
              </div>

              <!-- Location -->
              <div>
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Map class="w-4 h-4" />
                  Tọa độ vị trí
                </label>
                
                <div v-if="isEditing" class="space-y-2">
                  <div class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-700 text-sm">
                    {{ formatLocation(editData.location) }}
                  </div>
                  <button
                    @click="showMapPicker = true"
                    class="w-full px-4 py-2.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <Map class="w-4 h-4" />
                    Chọn vị trí trên bản đồ
                  </button>
                </div>

                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ formatLocation(profileData.location) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Change Password Section -->
          <div v-if="showChangePassword" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock class="w-5 h-5 text-orange-600" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                <input
                  v-model="passwordData.currentPassword"
                  type="password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                <input
                  v-model="passwordData.newPassword"
                  type="password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                <input
                  v-model="passwordData.confirmPassword"
                  type="password"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                class="w-full px-4 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Cập nhật mật khẩu
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Map Picker Modal -->
    <Teleport to="body">
      <div
        v-if="showMapPicker"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        @click.self="showMapPicker = false"
      >
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900">Chọn vị trí trên bản đồ</h3>
              <button
                @click="showMapPicker = false"
                class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
            
            <LocationPicker
              :initial-lat="editData.location?.lat || 10.7769"
              :initial-lng="editData.location?.lng || 106.7009"
              @select="handleLocationSelect"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>