<script setup lang="ts">
import { Package, MapPin, ShoppingBag, User, LogOut, Bell, Settings, CreditCard, Plus } from 'lucide-vue-next';
import { useAuth } from '~/composables/useAuth';

definePageMeta({
  layout: false,

});

const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};

const menuItems = [
  { 
    name: 'Hồ Sơ', 
    path: '/customer/profile', 
    icon: User,
    description: 'Thông tin cá nhân',
    color: 'from-blue-500 to-blue-600'
  },
  { 
    name: 'Địa Chỉ', 
    path: '/customer/address', 
    icon: MapPin,
    description: 'Quản lý địa chỉ giao hàng',
    color: 'from-purple-500 to-purple-600'
  },
  { 
    name: 'Đơn Hàng', 
    path: '/customer/orders', 
    icon: ShoppingBag,
    description: 'Theo dõi đơn hàng',
    color: 'from-pink-500 to-pink-600'
  },
  { 
    name: 'Thanh Toán', 
    path: '/customer/payment', 
    icon: CreditCard,
    description: 'Phương thức thanh toán',
    color: 'from-green-500 to-green-600'
  },
];

const stats = [
  { label: 'Đơn Hàng', value: '12', color: 'text-blue-600' },
  { label: 'Đang Giao', value: '3', color: 'text-glow-primary-600' },
  { label: 'Hoàn Thành', value: '9', color: 'text-green-600' },
];
</script>

<template>
  <!-- ✅ Xóa <html>, <head>, <body> đi -->
  <div class="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30 overflow-x-hidden">
    <!-- Decorative Background -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-40 -right-40 w-96 h-96 bg-glow-primary-400/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
    </div>

    <div class="relative z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Header Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Package class="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 class="text-3xl font-bold text-gray-900">
                  Xin chào, {{ user?.name || 'Khách hàng' }}!
                </h1>
                <p class="text-gray-600">Chào mừng bạn quay trở lại DeliveryDriver</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button class="p-3 hover:bg-gray-100 rounded-xl transition-colors relative">
                <Bell class="w-6 h-6 text-gray-600" />
                <span class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button class="p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Settings class="w-6 h-6 text-gray-600" />
              </button>
              <button
                @click="handleLogout"
                class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut class="w-5 h-5" />
                <span class="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 mt-8">
            <div 
              v-for="stat in stats" 
              :key="stat.label"
              class="text-center p-4 bg-gray-50 rounded-xl"
            >
              <div class="text-3xl font-bold mb-1" :class="stat.color">{{ stat.value }}</div>
              <div class="text-sm text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Create Order Button -->
        <div class="mb-8">
          <NuxtLink 
            to="/customer/createOrder"
            class="group relative bg-gradient-to-r from-glow-primary-500 to-glow-primary-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden block"
          >
            <!-- Animated Background -->
            <div class="absolute inset-0 bg-gradient-to-r from-glow-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Plus class="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 class="text-2xl font-bold text-white mb-1">Tạo Đơn Hàng Mới</h3>
                  <p class="text-white/80">Bắt đầu đặt hàng giao hàng ngay bây giờ</p>
                </div>
              </div>
              <div class="hidden md:block">
                <div class="text-white/80 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Quick Actions -->
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Truy Cập Nhanh</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <!-- Gradient Background on Hover -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                 :class="item.color"></div>
            
            <div class="relative">
              <!-- Icon -->
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                   :class="item.color">
                <component :is="item.icon" class="w-7 h-7 text-white" />
              </div>
              
              <!-- Content -->
              <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-glow-primary-600 transition-colors">
                {{ item.name }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ item.description }}
              </p>

              <!-- Arrow Icon -->
              <div class="absolute top-6 right-6 text-gray-300 group-hover:text-glow-primary-500 transform group-hover:translate-x-1 transition-all duration-300">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </NuxtLink>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Hoạt Động Gần Đây</h2>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <ShoppingBag class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Đơn hàng #12345 đã được giao</h4>
                <p class="text-sm text-gray-600">2 giờ trước</p>
              </div>
            </div>
            
            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Đã thêm địa chỉ mới</h4>
                <p class="text-sm text-gray-600">1 ngày trước</p>
              </div>
            </div>

            <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div class="w-12 h-12 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-xl flex items-center justify-center">
                <Package class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-900">Đơn hàng #12344 đang được giao</h4>
                <p class="text-sm text-gray-600">3 ngày trước</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Back to Home -->
        <div class="mt-8 text-center">
          <NuxtLink 
            to="/" 
            class="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay về trang chủ
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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