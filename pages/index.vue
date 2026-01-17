<script setup lang="ts">
import { Package, UserPlus, LogIn, MapPin, ShoppingBag, Truck, Clock, Shield } from 'lucide-vue-next';

const quickLinks = [
  { 
    name: 'Đăng Nhập', 
    path: '/login', 
    icon: LogIn,
    description: 'Truy cập tài khoản của bạn',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:shadow-blue-500/30'
  },
  { 
    name: 'Đăng Ký', 
    path: '/customer/register', 
    icon: UserPlus,
    description: 'Tạo tài khoản mới',
    color: 'from-glow-primary-500 to-glow-primary-600',
    hoverColor: 'hover:shadow-glow-primary-500/30'
  },
  { 
    name: 'Địa Chỉ', 
    path: '/customer/address', 
    icon: MapPin,
    description: 'Quản lý địa chỉ giao hàng',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:shadow-purple-500/30'
  },
  { 
    name: 'Đơn Hàng', 
    path: '/customer/orders', 
    icon: ShoppingBag,
    description: 'Theo dõi đơn hàng của bạn',
    color: 'from-pink-500 to-pink-600',
    hoverColor: 'hover:shadow-pink-500/30'
  },
];

const features = [
  { icon: Truck, title: 'Giao Hàng Nhanh', description: 'Giao hàng trong 24h' },
  { icon: Clock, title: 'Theo Dõi Đơn Hàng', description: 'Cập nhật realtime' },
  { icon: Shield, title: 'Bảo Mật Cao', description: 'An toàn tuyệt đối' },
];
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Decorative Background -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -top-40 -right-40 w-96 h-96 bg-glow-primary-400/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <!-- Logo & Brand -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-2xl shadow-2xl shadow-glow-primary-500/40 mb-6">
            <Package class="w-10 h-10 text-white" />
          </div>
          <h1 class="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Chào Mừng Đến Với
            <span class="bg-gradient-to-r from-glow-primary-600 to-purple-600 bg-clip-text text-transparent block mt-2">
              DeliveryDriver
            </span>
          </h1>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Hệ thống giao hàng thông minh, nhanh chóng và an toàn
          </p>
        </div>

        <!-- Quick Links Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <NuxtLink 
            v-for="link in quickLinks" 
            :key="link.path"
            :to="link.path"
            class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
            :class="link.hoverColor"
          >
            <!-- Gradient Background on Hover -->
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                 :class="link.color"></div>
            
            <div class="relative">
              <!-- Icon -->
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300"
                   :class="link.color">
                <component :is="link.icon" class="w-7 h-7 text-white" />
              </div>
              
              <!-- Content -->
              <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-glow-primary-600 transition-colors">
                {{ link.name }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ link.description }}
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

        <!-- Features Section -->
        <div class="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          <h2 class="text-3xl font-bold text-center text-gray-900 mb-12">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              v-for="feature in features" 
              :key="feature.title"
              class="text-center group"
            >
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-glow-primary-100 to-purple-100 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <component :is="feature.icon" class="w-8 h-8 text-glow-primary-600" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ feature.title }}</h3>
              <p class="text-gray-600">{{ feature.description }}</p>
            </div>
          </div>
        </div>

        <!-- CTA Section -->
        <div class="mt-16 text-center">
          <div class="inline-flex flex-col sm:flex-row gap-4">
            <NuxtLink 
              to="/customer/register"
              class="px-8 py-4 bg-gradient-to-r from-glow-primary-500 to-glow-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-glow-primary-500/30 hover:shadow-xl hover:shadow-glow-primary-500/40 transform hover:-translate-y-1 transition-all duration-300"
            >
              Bắt Đầu Ngay
            </NuxtLink>
            <NuxtLink 
              to="/login"
              class="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Đăng Nhập
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="bg-gray-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="flex items-center justify-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-xl flex items-center justify-center">
            <Package class="w-5 h-5 text-white" />
          </div>
          <span class="text-xl font-bold">DeliveryDriver</span>
        </div>
        <p class="text-gray-400 mb-6">Giải pháp giao hàng thông minh cho mọi nhu cầu</p>
        <div class="flex items-center justify-center gap-8 text-sm text-gray-400">
          <a href="#" class="hover:text-white transition-colors">Điều Khoản</a>
          <a href="#" class="hover:text-white transition-colors">Bảo Mật</a>
          <a href="#" class="hover:text-white transition-colors">Hỗ Trợ</a>
        </div>
        <p class="text-gray-500 text-sm mt-6">&copy; {{ new Date().getFullYear() }} DeliveryDriver. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>