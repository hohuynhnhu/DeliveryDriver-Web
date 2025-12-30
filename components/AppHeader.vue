<script setup lang="ts">
import { Bell, Settings, User, Menu, X, LayoutDashboard, Package, ShoppingCart, Users, BarChart3, LogOut, ChevronDown, FileText } from 'lucide-vue-next';

const isMenuOpen = ref(false);
const showNotifications = ref(false);
const showUserMenu = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const navLinks = [
  { name: 'Tổng Quan', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Đơn Hàng', path: '/admin/orders', icon: ShoppingCart },
  { name: 'Shipper', path: '/admin/products', icon: Package },
  { name: 'Khách Hàng', path: '/admin/customers', icon: Users },
  // { name: 'Thống Kê & Báo Cáo', path: '/admin/reports', icon: BarChart3 },
];

const notifications = [
  { id: 1, text: 'Đơn hàng mới #1234 cần xử lý', time: '5 phút trước', unread: true, type: 'order' },
  { id: 2, text: 'Sản phẩm "Serum Vitamin C" sắp hết hàng', time: '1 giờ trước', unread: true, type: 'warning' },
  { id: 3, text: '12 khách hàng mới đăng ký hôm nay', time: '2 giờ trước', unread: false, type: 'info' },
];

const adminInfo = {
  name: 'Nguyễn Văn A',
  email: 'admin@DeliveryDriver.com',
  role: 'Quản Trị Viên',
  avatar: ''
};
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
    <div class="w-full px-4 lg:px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo & Brand -->
        <div class="flex items-center gap-8">
          <NuxtLink to="/admin/dashboard" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-glow-primary-500/30">
              <span class="text-white font-bold text-lg">G</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xl font-bold text-gray-900">DeliveryDriver</span>
              <span class="text-xs text-gray-500 -mt-0.5">Admin Dashboard</span>
            </div>
          </NuxtLink>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-1">
            <NuxtLink 
              v-for="link in navLinks" 
              :key="link.path" 
              :to="link.path"
              class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-glow-primary-600 hover:bg-glow-primary-50 rounded-lg transition-all"
              active-class="text-glow-primary-600 bg-glow-primary-50"
            >
              <component :is="link.icon" class="w-4 h-4" />
              <span class="whitespace-nowrap">{{ link.name }}</span>
            </NuxtLink>
          </nav>
        </div>

        <!-- Right Actions -->
        <div class="flex items-center gap-3">
          <!-- Notifications -->
          <div class="relative">
            <button 
              @click="showNotifications = !showNotifications"
              class="relative p-2.5 text-gray-600 hover:text-glow-primary-600 hover:bg-gray-50 rounded-lg transition-all"
            >
              <Bell class="w-5 h-5" />
              <span class="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </button>

            <!-- Notifications Dropdown -->
            <div 
              v-if="showNotifications" 
              class="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div class="px-4 py-3 bg-gradient-to-r from-glow-primary-50 to-purple-50 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-gray-900">Thông Báo</h3>
                  <span class="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">2</span>
                </div>
              </div>
              <div class="max-h-96 overflow-y-auto">
                <div 
                  v-for="notif in notifications" 
                  :key="notif.id"
                  class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                  :class="{ 'bg-blue-50/50': notif.unread }"
                >
                  <div class="flex items-start gap-3">
                    <div class="w-2 h-2 rounded-full mt-1.5" 
                         :class="notif.unread ? 'bg-blue-500' : 'bg-gray-300'"></div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-900 font-medium">{{ notif.text }}</p>
                      <p class="text-xs text-gray-500 mt-1">{{ notif.time }}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <a href="/admin/notifications" class="text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium">Xem tất cả thông báo →</a>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <NuxtLink 
            to="/admin/settings"
            class="p-2.5 text-gray-600 hover:text-glow-primary-600 hover:bg-gray-50 rounded-lg transition-all hidden md:block"
          >
            <Settings class="w-5 h-5" />
          </NuxtLink>

          <!-- User Menu -->
          <div class="relative">
            <button 
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User class="w-4 h-4 text-white" />
              </div>
              <div class="hidden md:flex flex-col items-start">
                <span class="text-sm font-semibold text-gray-900">{{ adminInfo.name }}</span>
                <span class="text-xs text-gray-500">{{ adminInfo.role }}</span>
              </div>
              <ChevronDown class="w-4 h-4 text-gray-400 hidden md:block" />
            </button>

            <!-- User Dropdown -->
            <div 
              v-if="showUserMenu" 
              class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
            >
              <div class="px-4 py-3 bg-gradient-to-r from-glow-primary-50 to-purple-50 border-b border-gray-200">
                <p class="text-sm font-semibold text-gray-900">{{ adminInfo.name }}</p>
                <p class="text-xs text-gray-500">{{ adminInfo.email }}</p>
              </div>
              <div class="py-2">
                <a href="/admin/profile" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User class="w-4 h-4" />
                  Thông Tin Cá Nhân
                </a>
                <a href="/admin/settings" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings class="w-4 h-4" />
                  Cài Đặt
                </a>
              </div>
              <div class="border-t border-gray-200 py-2">
                <button class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                  <LogOut class="w-4 h-4" />
                  Đăng Xuất
                </button>
              </div>
            </div>
          </div>

          <!-- Mobile Menu Button -->
          <button @click="toggleMenu" class="lg:hidden p-2 text-gray-600 hover:text-glow-primary-600 hover:bg-gray-50 rounded-lg transition-all">
            <Menu v-if="!isMenuOpen" class="w-6 h-6" />
            <X v-else class="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div v-show="isMenuOpen" class="lg:hidden border-t border-gray-200 bg-white">
      <nav class="flex flex-col p-4 space-y-1">
        <NuxtLink 
          v-for="link in navLinks" 
          :key="link.path" 
          :to="link.path"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-glow-primary-600 hover:bg-glow-primary-50 rounded-lg transition-all"
          active-class="text-glow-primary-600 bg-glow-primary-50"
          @click="isMenuOpen = false"
        >
          <component :is="link.icon" class="w-5 h-5" />
          {{ link.name }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>