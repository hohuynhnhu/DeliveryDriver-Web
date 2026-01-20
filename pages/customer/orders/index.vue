<script setup lang="ts">
import { Package, Calendar, Clock, DollarSign, Eye, Search, Filter, CheckCircle, XCircle, Truck, PackageCheck, ChevronLeft, ChevronRight } from 'lucide-vue-next';

definePageMeta({
  middleware: 'customer-auth'
});

const searchQuery = ref('');
const selectedStatus = ref('all');

// Phân trang
const currentPage = ref(1);
const itemsPerPage = ref(5);

// Dữ liệu mẫu (giả lập nhiều đơn hàng)
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
  },
  {
    id: 'DH00119',
    date: '11/01/2026',
    time: '15:30',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '280.000đ',
    items: 3,
    shippingAddress: 'Quận 5, TP.HCM'
  },
  {
    id: 'DH00118',
    date: '10/01/2026',
    time: '11:45',
    status: 'shipping',
    statusText: 'Đang giao',
    statusColor: 'yellow',
    total: '175.000đ',
    items: 2,
    shippingAddress: 'Quận 10, TP.HCM'
  },
  {
    id: 'DH00117',
    date: '09/01/2026',
    time: '14:20',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '520.000đ',
    items: 6,
    shippingAddress: 'Quận Bình Thạnh, TP.HCM'
  },
  {
    id: 'DH00116',
    date: '08/01/2026',
    time: '10:00',
    status: 'cancelled',
    statusText: 'Đã huỷ',
    statusColor: 'red',
    total: '125.000đ',
    items: 2,
    shippingAddress: 'Quận 4, TP.HCM'
  },
  {
    id: 'DH00115',
    date: '07/01/2026',
    time: '16:30',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '390.000đ',
    items: 4,
    shippingAddress: 'Quận Tân Bình, TP.HCM'
  },
  {
    id: 'DH00114',
    date: '06/01/2026',
    time: '13:15',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '210.000đ',
    items: 3,
    shippingAddress: 'Quận 6, TP.HCM'
  },
  {
    id: 'DH00113',
    date: '05/01/2026',
    time: '09:45',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '450.000đ',
    items: 5,
    shippingAddress: 'Quận 8, TP.HCM'
  },
  {
    id: 'DH00112',
    date: '04/01/2026',
    time: '15:00',
    status: 'completed',
    statusText: 'Hoàn thành',
    statusColor: 'green',
    total: '180.000đ',
    items: 2,
    shippingAddress: 'Quận 11, TP.HCM'
  }
]);

const statusFilters = computed(() => [
  { value: 'all', label: 'Tất cả', count: orders.value.length },
  { value: 'shipping', label: 'Đang giao', count: orders.value.filter(o => o.status === 'shipping').length },
  { value: 'completed', label: 'Hoàn thành', count: orders.value.filter(o => o.status === 'completed').length },
  { value: 'cancelled', label: 'Đã huỷ', count: orders.value.filter(o => o.status === 'cancelled').length }
]);

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

// Lọc đơn hàng
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

// Tính toán phân trang
const totalPages = computed(() => 
  Math.ceil(filteredOrders.value.length / itemsPerPage.value)
);

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredOrders.value.slice(start, end);
});

// Các trang hiển thị
const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  
  // Luôn hiển thị trang đầu
  pages.push(1);
  
  // Tính toán các trang ở giữa
  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);
  
  // Thêm dấu ... nếu cần
  if (start > 2) {
    pages.push('...');
  }
  
  // Thêm các trang ở giữa
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  // Thêm dấu ... nếu cần
  if (end < total - 1) {
    pages.push('...');
  }
  
  // Luôn hiển thị trang cuối (nếu có nhiều hơn 1 trang)
  if (total > 1) {
    pages.push(total);
  }
  
  return pages;
});

// Thay đổi trang
const goToPage = (page: number | string) => {
  if (typeof page === 'number' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    // Scroll lên đầu danh sách
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

// Reset về trang 1 khi filter thay đổi
watch([selectedStatus, searchQuery], () => {
  currentPage.value = 1;
});

// Tính toán thống kê
const stats = computed(() => ({
  total: orders.value.length,
  shipping: orders.value.filter(o => o.status === 'shipping').length,
  completed: orders.value.filter(o => o.status === 'completed').length,
  totalSpent: orders.value
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.total.replace(/[đ.,]/g, '')), 0)
}));
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/20">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

      <!-- Header Section -->
      <section class="mb-8">
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
      </section>

      <!-- Stats Cards -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 mb-1">Tổng đơn hàng</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
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
              <p class="text-2xl font-bold text-yellow-600">{{ stats.shipping }}</p>
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
              <p class="text-2xl font-bold text-green-600">{{ stats.completed }}</p>
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
              <p class="text-2xl font-bold text-glow-primary-600">{{ (stats.totalSpent / 1000).toFixed(2) }}K</p>
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
        <!-- Hiển thị thông tin phân trang -->
        <div class="flex items-center justify-between text-sm text-gray-600 px-2">
          <p>
            Hiển thị <span class="font-semibold text-gray-900">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> 
            đến <span class="font-semibold text-gray-900">{{ Math.min(currentPage * itemsPerPage, filteredOrders.length) }}</span> 
            trong tổng số <span class="font-semibold text-gray-900">{{ filteredOrders.length }}</span> đơn hàng
          </p>
          
          <!-- Items per page selector -->
          <div class="flex items-center gap-2">
            <span>Hiển thị:</span>
            <select 
              v-model="itemsPerPage"
              class="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent outline-none"
              @change="currentPage = 1"
            >
              <option :value="5">5</option>
              <option :value="10">10</option>
              <option :value="20">20</option>
              <option :value="50">50</option>
            </select>
            <span>đơn/trang</span>
          </div>
        </div>

        <!-- Orders Cards -->
        <div
          v-for="order in paginatedOrders"
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

        <!-- Pagination -->
        <div 
          v-if="totalPages > 1"
          class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6"
        >
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <!-- Previous Button -->
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              :class="currentPage === 1 ? 'text-gray-400' : 'text-gray-700'"
            >
              <ChevronLeft class="w-5 h-5" />
              <span class="hidden sm:inline">Trang trước</span>
            </button>

            <!-- Page Numbers -->
            <div class="flex items-center gap-2 flex-wrap justify-center">
              <button
                v-for="(page, index) in visiblePages"
                :key="index"
                @click="goToPage(page)"
                :disabled="page === '...'"
                class="w-10 h-10 rounded-xl font-semibold transition-all"
                :class="[
                  page === currentPage 
                    ? 'bg-glow-primary-600 text-white shadow-lg shadow-glow-primary-500/30' 
                    : page === '...'
                    ? 'cursor-default text-gray-400'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ page }}
              </button>
            </div>

            <!-- Next Button -->
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              :class="currentPage === totalPages ? 'text-gray-400' : 'text-gray-700'"
            >
              <span class="hidden sm:inline">Trang sau</span>
              <ChevronRight class="w-5 h-5" />
            </button>
          </div>
          
          <!-- Page info -->
          <div class="text-center mt-4 text-sm text-gray-600">
            Trang <span class="font-semibold text-gray-900">{{ currentPage }}</span> 
            / <span class="font-semibold text-gray-900">{{ totalPages }}</span>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>