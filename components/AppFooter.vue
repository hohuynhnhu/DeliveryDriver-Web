<script setup lang="ts">
import { Mail, Phone, MapPin, Clock, HelpCircle, FileText, Shield } from 'lucide-vue-next';

// const quickLinks = [
//   { name: 'Tổng Quan', path: '/admin/dashboard' },
//   { name: 'Quản Lý Đơn Hàng', path: '/admin/orders' },
//   { name: 'Quản Lý Sản Phẩm', path: '/admin/products' },
//   { name: 'Báo Cáo Doanh Thu', path: '/admin/reports/revenue' },
// ];

const supportLinks = [
  { name: 'Trung Tâm Hỗ Trợ', path: '/admin/help', icon: HelpCircle },
  { name: 'Tài Liệu Hướng Dẫn', path: '/admin/docs', icon: FileText },
  { name: 'Chính Sách Bảo Mật', path: '/admin/privacy', icon: Shield },
];

const systemInfo = {
  version: 'v2.5.1',
  lastUpdate: '15/12/2024',
  status: 'Hoạt động bình thường'
};
</script>

<template>
  <footer class="bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
    <div class="w-full px-4 lg:px-6 py-8">
      <div class="grid grid-cols-12 gap-x-8 gap-y-8 mb-8">

        <!-- Brand & System Info -->
        <div class="col-span-12 lg:col-span-4 space-y-4">

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span class="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">DeliveryDriver Admin</h3>
              <p class="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span class="font-medium">{systemInfo.status}</span>
            </div>
            <p class="text-gray-500">Phiên bản: <span class="font-mono font-medium text-gray-700">{{ systemInfo.version }}</span></p>
            <p class="text-gray-500">Cập nhật: {{ systemInfo.lastUpdate }}</p>
          </div>
        </div>


        <!-- Support -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">

          <h4 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Hỗ Trợ</h4>
          <ul class="space-y-5">
            <li v-for="link in supportLinks" :key="link.path">
              <NuxtLink 
                :to="link.path" 
                class="text-sm text-gray-600 hover:text-glow-primary-600 transition-colors flex items-center gap-2.5"
              >
                <component :is="link.icon" class="w-4 h-4" />
                {{ link.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="col-span-12 md:col-span-6 lg:col-span-4">

          <h4 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Liên Hệ Hỗ Trợ</h4>
          <ul class="space-y-3 text-sm text-gray-600">
            <li class="flex items-start gap-2.5">
              <Mail class="w-4 h-4 mt-0.5 text-glow-primary-500 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-700">Email</p>
                <a href="mailto:admin@DeliveryDriver.com" class="hover:text-glow-primary-600 transition-colors">admin@DeliveryDriver.com</a>
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <Phone class="w-4 h-4 mt-0.5 text-glow-primary-500 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-700">Hotline</p>
                <a href="tel:1900xxxx" class="hover:text-glow-primary-600 transition-colors">1900 xxxx</a>
              </div>
            </li>
            <li class="flex items-start gap-2.5">
              <Clock class="w-4 h-4 mt-0.5 text-glow-primary-500 flex-shrink-0" />
              <div>
                <p class="font-medium text-gray-700">Giờ làm việc</p>
                <p>T2-T6: 8:00 - 17:30</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      

      <!-- Bottom -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
        <p>&copy; {{ new Date().getFullYear() }} DeliveryDriver Hệ thống quản lý nội bộ.</p>
        <div class="flex items-center gap-6">
          <a href="/admin/terms" class="hover:text-glow-primary-600 transition-colors">Điều Khoản</a>
          <a href="/admin/privacy" class="hover:text-glow-primary-600 transition-colors">Bảo Mật</a>
          <a href="/admin/docs" class="hover:text-glow-primary-600 transition-colors">Tài Liệu</a>
        </div>
      </div>
    </div>
  </footer>
</template>