<script setup lang="ts">
import { Package, Calendar, Clock, DollarSign, Eye, Search, Filter, Download, CheckCircle, XCircle, Truck, PackageCheck } from 'lucide-vue-next';

definePageMeta({
  middleware: 'customer-auth'
});

const searchQuery = ref('');
const selectedStatus = ref('all');

const orders = ref([
  {
    id: 'DH00123',
    date: '15/01/2026',
    time: '14:30',
    status: 'shipping',
    statusText: 'Đang giao',
    statusColor: 'yellow',
    total: '150.000đ',
    items: 3,
    shippingAddress: 'Quận 1, TP.HCM'
  },
  {
    id: 'DH00122',
    date: '14/01/2026',
    time: '10:15',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '320.000đ',
    items: 5,
    shippingAddress: 'Quận 3, TP.HCM'
  },
  {
    id: 'DH00121',
    date: '13/01/2026',
    time: '16:45',
    status: 'cancelled',
    statusText: 'Đã huỷ',
    statusColor: 'red',
    total: '90.000đ',
    items: 2,
    shippingAddress: 'Quận 7, TP.HCM'
  },
  {
    id: 'DH00120',
    date: '12/01/2026',
    time: '09:20',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '450.000đ',
    items: 4,
    shippingAddress: 'Quận 2, TP.HCM'
  }
]);

const statusFilters = [
  { value: 'all', label: 'Tất cả', count: 4 },
  { value: 'shipping', label: 'Đang giao', count: 1 },
  { value: 'completed', label: 'Hoàn thành', count: 2 },
  { value: 'cancelled', label: 'Đã huỷ', count: 1 }
];

const getStatusIcon = (status: string) => {
  switch(status) {
    case 'shipping': return Truck;
    case 'completed': return CheckCircle;
    case 'cancelled': return XCircle;
    default: return Package;
  }
};

const getStatusBadgeClass = (color: string) => {
  const classes = {
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    green: 'bg-green-100 text-green-700 border-green-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  return classes[color] || classes.blue;
};

const filteredOrders = computed(() => {
  let result = orders.value;
  
  if (selectedStatus.value !== 'all') {
    result = result.filter(order => order.status === selectedStatus.value);
  }
  
  if (searchQuery.value) {
    result = result.filter(order => 
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return result;
});
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <!-- Header Section -->
      <section class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package class="w-6 h-6 text-white" />
              </div>
              Đơn Hàng Của Tôi
            </h1>
            <p class="text-gray-600 mt-2 ml-15">
              Quản lý và theo dõi tất cả đơn hàng của bạn
            </p>
          </div>
          
          <!-- Export Button -->
          <button class="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <Download class="w-4 h-4" />
            <span class="font-medium text-gray-700">Xuất báo cáo</span>
          </button>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
              <p class="text-2xl font-bold text-gray-900">4</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Package class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Đang giao</p>
              <p class="text-2xl font-bold text-yellow-600">1</p>
            </div>
            <div class="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Truck class="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Hoàn thành</p>
              <p class="text-2xl font-bold text-green-600">2</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle class="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Tổng chi tiêu</p>
              <p class="text-2xl font-bold text-glow-primary-600">1.01M</p>
            </div>
            <div class="w-12 h-12 bg-glow-primary-100 rounded-xl flex items-center justify-center">
              <DollarSign class="w-6 h-6 text-glow-primary-600" />
            </div>
          </div>
        </div>
      </section>

      <!-- Filter & Search -->
      <section class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex flex-col lg:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Tìm kiếm theo mã đơn hàng..."
                class="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <!-- Status Filter -->
          <div class="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              @click="selectedStatus = filter.value"
              class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all"
              :class="selectedStatus === filter.value 
                ? 'bg-glow-primary-600 text-white shadow-lg shadow-glow-primary-500/30' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            >
              {{ filter.label }}
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-bold"
                :class="selectedStatus === filter.value ? 'bg-white/20' : 'bg-white'"
              >
                {{ filter.count }}
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Orders List -->
      <section class="space-y-4">
        <div
          v-for="order in filteredOrders"
          :key="order.id"
          class="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
        >
          <div class="p-6">
            <!-- Order Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-glow-primary-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <component :is="getStatusIcon(order.status)" class="w-6 h-6 text-glow-primary-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900 mb-1">{{ order.id }}</h3>
                  <div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <span class="flex items-center gap-1.5">
                      <Calendar class="w-4 h-4" />
                      {{ order.date }}
                    </span>
                    <span class="flex items-center gap-1.5">
                      <Clock class="w-4 h-4" />
                      {{ order.time }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Status Badge -->
              <div class="flex items-center gap-3">
                <span 
                  class="px-4 py-2 rounded-lg font-semibold text-sm border"
                  :class="getStatusBadgeClass(order.statusColor)"
                >
                  {{ order.statusText }}
                </span>
              </div>
            </div>

            <!-- Order Details -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl mb-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Số lượng sản phẩm</p>
                <p class="font-semibold text-gray-900">{{ order.items }} món</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Địa chỉ giao hàng</p>
                <p class="font-semibold text-gray-900">{{ order.shippingAddress }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Tổng tiền</p>
                <p class="font-bold text-glow-primary-600 text-lg">{{ order.total }}</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex flex-wrap gap-3">
              <NuxtLink
                :to="`/customer/orders/${order.id}`"
                class="flex items-center gap-2 px-4 py-2.5 bg-glow-primary-600 text-white rounded-xl hover:bg-glow-primary-700 transition-colors font-medium shadow-lg shadow-glow-primary-500/30"
              >
                <Eye class="w-4 h-4" />
                Xem chi tiết
              </NuxtLink>
              
              <button 
                v-if="order.status === 'completed'"
                class="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <PackageCheck class="w-4 h-4" />
                Mua lại
              </button>
              
              <button 
                v-if="order.status === 'shipping'"
                class="flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
              >
                <XCircle class="w-4 h-4" />
                Huỷ đơn
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredOrders.length === 0"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
        >
          <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package class="w-12 h-12 text-gray-400" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h3>
          <p class="text-gray-600 mb-6">
            {{ searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Bạn chưa có đơn hàng nào' }}
          </p>
          <NuxtLink 
            to="/"
            class="inline-flex items-center gap-2 px-6 py-3 bg-glow-primary-600 text-white rounded-xl hover:bg-glow-primary-700 transition-colors font-medium shadow-lg shadow-glow-primary-500/30"
          >
            <Package class="w-5 h-5" />
            Bắt đầu mua sắm
          </NuxtLink>
        </div>
      </section>

    </div>
  </main>
</template>