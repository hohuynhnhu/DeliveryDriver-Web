<script setup lang="ts">
import { Package, MapPin, ShoppingBag, User, LogOut, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import type { OrderResponse } from '@/@type/order';

definePageMeta({
  layout: false,
});

const { user, logout } = useAuth();
const { getCustomerOrders, isLoading } = useOrder();

// State
const recentOrders = ref<OrderResponse[]>([]);
const orderStats = ref({
  total: 0,
  pending: 0,
  processing: 0,
  completed: 0,
  cancelled: 0
});

// Load dữ liệu đơn hàng
const loadDashboardData = async () => {
  if (!user.value?.id) return;
  
  try {
    // Lấy 10 đơn hàng gần nhất
    const orders = await getCustomerOrders(user.value.id, 0, 10);
    
    if (orders && orders.length > 0) {
      recentOrders.value = orders.slice(0, 3); // Chỉ lấy 3 đơn gần nhất để hiển thị
      
      // Tính toán thống kê
      orderStats.value = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length
      };
    }
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
};

// Load khi component mount
onMounted(() => {
  loadDashboardData();
});

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
];

// Stats động từ dữ liệu thật
const stats = computed(() => [
  { 
    label: 'Tổng Đơn', 
    value: orderStats.value.total.toString(), 
    color: 'text-blue-600',
    icon: Package,
    bgColor: 'bg-blue-100'
  },
  { 
    label: 'Đang Xử Lý', 
    value: (orderStats.value.pending + orderStats.value.processing).toString(), 
    color: 'text-glow-primary-600',
    icon: Clock,
    bgColor: 'bg-glow-primary-100'
  },
  { 
    label: 'Hoàn Thành', 
    value: orderStats.value.completed.toString(), 
    color: 'text-green-600',
    icon: CheckCircle,
    bgColor: 'bg-green-100'
  },
]);

// Format thời gian
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN');
  }
};

// Lấy status text
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã huỷ'
  };
  return statusMap[status] || status;
};

// Lấy màu và icon cho activity
const getActivityConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: any; text: string }> = {
    completed: {
      color: 'from-green-500 to-green-600',
      icon: CheckCircle,
      text: 'đã được giao thành công'
    },
    processing: {
      color: 'from-glow-primary-500 to-glow-primary-600',
      icon: Package,
      text: 'đang được xử lý'
    },
    pending: {
      color: 'from-yellow-500 to-yellow-600',
      icon: Clock,
      text: 'đang chờ xác nhận'
    },
    cancelled: {
      color: 'from-red-500 to-red-600',
      icon: ShoppingBag,
      text: 'đã bị huỷ'
    }
  };
  return configs[status] || configs.pending;
};
</script>

<template>
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
                  Xin chào, {{ user?.full_name || 'Khách hàng' }}!
                </h1>
                <p class="text-gray-600">Chào mừng bạn quay trở lại DeliveryDriver</p>
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              <button
                @click="handleLogout"
                class="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
              >
                <LogOut class="w-5 h-5" />
                <span class="hidden sm:inline">Đăng xuất</span>
              </button>
            </div>
          </div>

          <!-- Stats - Dữ liệu thật -->
          <div class="grid grid-cols-3 gap-4 mt-8">
            <div 
              v-for="stat in stats" 
              :key="stat.label"
              class="group text-center p-6 bg-gray-50 hover:bg-gradient-to-br hover:from-white hover:to-gray-50 rounded-xl border border-gray-100 hover:border-glow-primary-200 transition-all duration-300 cursor-default"
            >
              <div class="flex items-center justify-center mb-3">
                <div :class="['w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110', stat.bgColor]">
                  <component :is="stat.icon" class="w-6 h-6" :class="stat.color" />
                </div>
              </div>
              <div class="text-3xl font-bold mb-1" :class="stat.color">{{ stat.value }}</div>
              <div class="text-sm text-gray-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Create Order Button -->
        <div class="mb-8">
          <NuxtLink 
            to="/customer/orders_create/createOrder"
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

        <!-- Recent Activity - Dữ liệu thật -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Hoạt Động Gần Đây</h2>
            <NuxtLink 
              to="/customer/orders"
              class="text-sm text-glow-primary-600 hover:text-glow-primary-700 font-medium flex items-center gap-1"
            >
              Xem tất cả
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-glow-primary-600"></div>
          </div>

          <!-- Recent Orders -->
          <div v-else-if="recentOrders.length > 0" class="space-y-4">
            <NuxtLink
              v-for="order in recentOrders"
              :key="order.id"
              :to="`/customer/orders/${order.id}`"
              class="group flex items-center gap-4 p-4 bg-gray-50 hover:bg-gradient-to-r hover:from-glow-primary-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-transparent hover:border-glow-primary-200"
            >
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm group-hover:shadow-md transition-shadow"
                :class="getActivityConfig(order.status).color"
              >
                <component :is="getActivityConfig(order.status).icon" class="w-6 h-6 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 group-hover:text-glow-primary-600 transition-colors truncate">
                  Đơn hàng #{{ order.id }} {{ getActivityConfig(order.status).text }}
                </h4>
                <div class="flex items-center gap-3 mt-1">
                  <p class="text-sm text-gray-600">{{ formatDateTime(order.created_at) }}</p>
                  <span class="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700">
                    {{ getStatusText(order.status) }}
                  </span>
                </div>
              </div>
              <div class="text-gray-400 group-hover:text-glow-primary-500 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </NuxtLink>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package class="w-8 h-8 text-gray-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h3>
            <p class="text-gray-600 mb-6">Bắt đầu tạo đơn hàng đầu tiên của bạn</p>
            <NuxtLink
              to="/customer/orders_create/createOrder"
              class="inline-flex items-center gap-2 px-6 py-3 bg-glow-primary-600 text-white rounded-xl hover:bg-glow-primary-700 transition-colors font-medium shadow-lg shadow-glow-primary-500/30"
            >
              <Plus class="w-5 h-5" />
              Tạo đơn hàng
            </NuxtLink>
          </div>
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