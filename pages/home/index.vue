<script setup lang="ts">
import HeroSection from '@/components/organisms/home/HeroSection.vue'

// Composables
const { user, logout, fetchCurrentUser, isAuthenticated } = useAuth()

// Fetch user data khi vào trang
onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchCurrentUser()
  }
})

// Logout
const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header với User Info -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">BarberGo</h1>
        
        <!-- User Info (chỉ hiện khi đã login) -->
        <div v-if="isAuthenticated && user" class="flex items-center gap-4">
          <span class="text-gray-600 text-sm">
            Xin chào, <strong>{{ user.full_name || user.email }}</strong>
          </span>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition"
          >
            Đăng xuất
          </button>
        </div>

        <!-- Login/Register buttons (khi chưa login) -->
        <div v-else class="flex items-center gap-3">
          <NuxtLink 
            to="/login"
            class="px-4 py-2 text-gray-700 text-sm font-medium hover:text-gray-900 transition"
          >
            Đăng nhập
          </NuxtLink>
          <NuxtLink 
            to="/customer/register"
            class="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
          >
            Đăng ký
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <HeroSection />
      <CategorySection />
      
      <!-- User Info Card (chỉ hiện khi đã login) -->
      <section v-if="isAuthenticated && user" class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Thông tin tài khoản</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <p class="text-gray-600">
                <strong>Email:</strong> {{ user.email }}
              </p>
              <p class="text-gray-600">
                <strong>Họ tên:</strong> {{ user.full_name || 'Chưa cập nhật' }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-gray-600">
                <strong>Số điện thoại:</strong> {{ user.phone || 'Chưa cập nhật' }}
              </p>
              <p class="text-gray-600">
                <strong>ID:</strong> {{ user.id }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>