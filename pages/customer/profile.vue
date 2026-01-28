<script setup lang="ts">
import { ref } from 'vue'
import { User, Mail, Phone, MapPin, Lock, Camera, Edit2, Save, X, Calendar, Award, Package, Star, TrendingUp } from 'lucide-vue-next'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: false,
})

const { user, fetchCurrentUser } = useAuth()

const isEditing = ref(false)
const showChangePassword = ref(false)
const isLoading = ref(false)

// Sử dụng computed để map dữ liệu từ API
const profileData = computed(() => ({
  name: user.value?.full_name || 'Chưa cập nhật',
  email: user.value?.email || '',
  phone: user.value?.phone || 'Chưa cập nhật',
  address: 'Chưa cập nhật', // Nếu backend có field address thì thêm vào User interface
  avatar: user.value?.avatar_url || '👤',
  memberSince: user.value?.created_at ? new Date(user.value.created_at).toLocaleDateString('vi-VN') : '',
  totalOrders: 45, // Dữ liệu này cần endpoint khác để lấy
  completedOrders: 42,
  rating: 4.8
}))

const editData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const stats = [
  { label: 'Tổng đơn hàng', value: 45, icon: Package, color: 'blue' },
  { label: 'Hoàn thành', value: 42, icon: TrendingUp, color: 'green' },
  { label: 'Đánh giá', value: 4.8, icon: Star, color: 'yellow' },
  { label: 'Thành viên', value: '2 năm', icon: Award, color: 'purple' }
]

// Fetch dữ liệu khi component mount
onMounted(async () => {
  isLoading.value = true
  await fetchCurrentUser()
  isLoading.value = false
})

const handleEdit = () => {
  isEditing.value = true
  editData.value = {
    name: profileData.value.name,
    email: profileData.value.email,
    phone: profileData.value.phone,
    address: profileData.value.address
  }
}

const handleSave = async () => {
  // TODO: Gọi API để update profile
  // const api = useApi()
  // await api.patch('/api/v1/users/me', {
  //   full_name: editData.value.name,
  //   phone: editData.value.phone
  // })
  
  alert('Cập nhật thông tin thành công!')
  isEditing.value = false
  await fetchCurrentUser() // Refresh data
}

const handleCancel = () => {
  editData.value = {
    name: profileData.value.name,
    email: profileData.value.email,
    phone: profileData.value.phone,
    address: profileData.value.address
  }
  isEditing.value = false
}

const handleChangePassword = () => {
  if (!passwordData.value.currentPassword || !passwordData.value.newPassword || !passwordData.value.confirmPassword) {
    alert('Vui lòng điền đầy đủ thông tin!')
    return
  }
  if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
    alert('Mật khẩu xác nhận không khớp!')
    return
  }
  if (passwordData.value.newPassword.length < 6) {
    alert('Mật khẩu mới phải có ít nhất 6 ký tự!')
    return
  }
  
  // TODO: Gọi API đổi mật khẩu
  alert('Đổi mật khẩu thành công!')
  showChangePassword.value = false
  passwordData.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
}

const getColorClasses = (color: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' }
  }
  return colors[color] || colors.blue
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p class="text-gray-600">Đang tải thông tin...</p>
      </div>
    </div>

    <!-- Main Content -->
    <div v-else class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

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
                    <button class="absolute bottom-4 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors shadow-lg">
                      <Camera class="w-5 h-5" />
                    </button>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900">{{ profileData.name }}</h2>
                  <p class="text-sm text-gray-500 mt-1">Khách hàng thân thiết</p>
                </div>

                <!-- Member Info -->
                <div class="space-y-3 mb-6">
                  <div class="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Calendar class="w-5 h-5 text-purple-600" />
                    <div>
                      <p class="text-xs text-gray-500">Thành viên từ</p>
                      <p class="font-semibold text-gray-900">{{ profileData.memberSince }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Award class="w-5 h-5 text-green-600" />
                    <div>
                      <p class="text-xs text-gray-500">Hạng thành viên</p>
                      <p class="font-semibold text-gray-900">Vàng</p>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3">
                  <button
                    v-if="!isEditing"
                    @click="handleEdit"
                    class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30"
                  >
                    <Edit2 class="w-5 h-5" />
                    Chỉnh sửa thông tin
                  </button>
                  <button
                    @click="showChangePassword = !showChangePassword"
                    class="w-full flex items-center justify-center gap-2 border-2 border-purple-300 text-purple-700 py-3 rounded-lg hover:bg-purple-50 transition-colors font-semibold"
                  >
                    <Lock class="w-5 h-5" />
                    Đổi mật khẩu
                  </button>
                </div>

              </div>
            </div>

            <!-- Right Column - Details & Stats -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Stats Cards -->
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  v-for="(stat, idx) in stats"
                  :key="idx"
                  class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
                >
                  <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-3', getColorClasses(stat.color).bg]">
                    <component :is="stat.icon" :class="['w-6 h-6', getColorClasses(stat.color).text]" />
                  </div>
                  <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ stat.label }}</p>
                </div>
              </div>

              <!-- Personal Information -->
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
                  <div v-if="isEditing" class="flex gap-2">
                    <button
                      @click="handleSave"
                      class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      <Save class="w-4 h-4" />
                      Lưu
                    </button>
                    <button
                      @click="handleCancel"
                      class="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <X class="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                </div>

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
                <input
                  v-if="isEditing"
                  v-model="editData.email"
                  type="email"
                  disabled
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
                <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                  {{ profileData.email }}
                </p>
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
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                      {{ profileData.phone }}
                    </p>
                  </div>

                  <!-- Address -->
                  <div>
                    <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin class="w-4 h-4" />
                      Địa chỉ
                    </label>
                    <textarea
                      v-if="isEditing"
                      v-model="editData.address"
                      rows="2"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <p v-else class="px-4 py-2.5 bg-gray-50 rounded-lg text-gray-900 font-medium">
                      {{ profileData.address }}
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

                  <div class="flex gap-3 pt-2">
                    <button
                      @click="handleChangePassword"
                      class="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold shadow-lg shadow-orange-500/30"
                    >
                      Xác nhận đổi mật khẩu
                    </button>
                    <button
                      @click="showChangePassword = false; passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' }"
                      class="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </body>
  </html>
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