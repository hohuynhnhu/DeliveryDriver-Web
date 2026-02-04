<script setup lang="ts">
import { useCustomerSession } from '@/composables/useCustomerSession';
import { Package, Users, AlertCircle, LogOut, UserCheck, Activity, Home, Zap, ShoppingCart, DollarSign } from 'lucide-vue-next';

// Vô hiệu hóa layout mặc định
definePageMeta({
  layout:'manager'
});

const { user, logout } = useAuth();
const route = useRoute();


// Mock data
const stats = ref([
  { 
    title: 'Tổng đơn hàng', 
    value: '1,234', 
    change: '+12.5%', 
    icon: ShoppingCart,
    color: 'blue'
  },
  { 
    title: 'Doanh thu', 
    value: '₫45.2M', 
    change: '+8.2%', 
    icon: DollarSign,
    color: 'green'
  },
  { 
    title: 'Khách hàng', 
    value: '856', 
    change: '+15.3%', 
    icon: Users,
    color: 'purple'
  },
  { 
    title: 'Đơn chờ xử lý', 
    value: '23', 
    change: '-5.1%', 
    icon: AlertCircle,
    color: 'orange'
  }
]);


</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          v-for="(stat, index) in stats"
          :key="index"
          class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all hover:border-glow-primary-200"
        >
          <div class="flex items-center justify-between mb-4">
            <div 
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="{
                'bg-blue-100': stat.color === 'blue',
                'bg-green-100': stat.color === 'green',
                'bg-purple-100': stat.color === 'purple',
                'bg-orange-100': stat.color === 'orange'
              }"
            >
              <component 
                :is="stat.icon" 
                class="w-6 h-6"
                :class="{
                  'text-blue-600': stat.color === 'blue',
                  'text-green-600': stat.color === 'green',
                  'text-purple-600': stat.color === 'purple',
                  'text-orange-600': stat.color === 'orange'
                }"
              />
            </div>
            <span 
              class="text-sm font-semibold px-2 py-1 rounded-full"
              :class="{
                'bg-green-100 text-green-700': stat.change.startsWith('+'),
                'bg-red-100 text-red-700': stat.change.startsWith('-')
              }"
            >
              {{ stat.change }}
            </span>
          </div>
          <h3 class="text-gray-600 text-sm font-medium mb-1">{{ stat.title }}</h3>
          <p class="text-2xl font-bold text-gray-900">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Thao tác nhanh</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NuxtLink
            to="/manager/orders/1"
            class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-primary-500 hover:bg-glow-primary-50 transition-all group"
          >
            <div class="w-10 h-10 bg-glow-primary-100 rounded-lg flex items-center justify-center group-hover:bg-glow-primary-200 transition-colors">
              <Package class="w-5 h-5 text-glow-primary-600" />
            </div>
            <div class="text-left">
              <p class="font-semibold text-gray-900">Xử lý đơn hàng</p>
              <p class="text-sm text-gray-500">Quản lý đơn hàng</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/manager/orders/assign"
            class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-glow-primary-500 hover:bg-glow-primary-50 transition-all group"
          >
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <Users class="w-5 h-5 text-purple-600" />
            </div>
            <div class="text-left">
              <p class="font-semibold text-gray-900">Phân công tài xế</p>
              <p class="text-sm text-gray-500">Gán đơn cho tài xế</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/manager/orders/emergency"
            class="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
          >
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
              <Zap class="w-5 h-5 text-red-600" />
            </div>
            <div class="text-left">
              <p class="font-semibold text-gray-900">Xử lý đột xuất</p>
              <p class="text-sm text-gray-500">Đơn hàng khẩn cấp</p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Orders Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-900">Đơn hàng gần đây</h3>
          <NuxtLink
            to="/manager/orders"
            class="text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium"
          >
            Xem tất cả →
          </NuxtLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-200">
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã đơn</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Khách hàng</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tổng tiền</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Ngày</th>
                <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100 hover:bg-glow-primary-50/50 transition-colors">
                <td class="py-3 px-4 text-sm font-medium text-gray-900">#ORD-001</td>
                <td class="py-3 px-4 text-sm text-gray-700">Nguyễn Văn A</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                    Hoàn thành
                  </span>
                </td>
                <td class="py-3 px-4 text-sm font-semibold text-gray-900">₫250,000</td>
                <td class="py-3 px-4 text-sm text-gray-500">19/01/2026</td>
                <td class="py-3 px-4">
                  <NuxtLink
                    to="/manager/orders/1"
                    class="text-glow-primary-600 hover:text-glow-primary-700 text-sm font-medium"
                  >
                    Chi tiết
                  </NuxtLink>
                </td>
              </tr>
              <tr class="border-b border-gray-100 hover:bg-glow-primary-50/50 transition-colors">
                <td class="py-3 px-4 text-sm font-medium text-gray-900">#ORD-002</td>
                <td class="py-3 px-4 text-sm text-gray-700">Trần Thị B</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                    Đang giao
                  </span>
                </td>
                <td class="py-3 px-4 text-sm font-semibold text-gray-900">₫180,000</td>
                <td class="py-3 px-4 text-sm text-gray-500">19/01/2026</td>
                <td class="py-3 px-4">
                  <NuxtLink
                    to="/manager/orders/2"
                    class="text-glow-primary-600 hover:text-glow-primary-700 text-sm font-medium"
                  >
                    Chi tiết
                  </NuxtLink>
                </td>
              </tr>
              <tr class="hover:bg-glow-primary-50/50 transition-colors">
                <td class="py-3 px-4 text-sm font-medium text-gray-900">#ORD-003</td>
                <td class="py-3 px-4 text-sm text-gray-700">Lê Văn C</td>
                <td class="py-3 px-4">
                  <span class="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
                    Chờ xử lý
                  </span>
                </td>
                <td class="py-3 px-4 text-sm font-semibold text-gray-900">₫320,000</td>
                <td class="py-3 px-4 text-sm text-gray-500">19/01/2026</td>
                <td class="py-3 px-4">
                  <NuxtLink
                    to="/manager/orders/3"
                    class="text-glow-primary-600 hover:text-glow-primary-700 text-sm font-medium"
                  >
                    Chi tiết
                  </NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>