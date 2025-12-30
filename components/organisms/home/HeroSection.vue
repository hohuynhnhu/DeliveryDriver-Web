<script setup lang="ts">
import { TrendingUp, TrendingDown, Truck, MapPin, DollarSign, Package, ArrowRight, Calendar, Navigation, Clock, Users, Activity, Target, Zap } from 'lucide-vue-next';

// Interface definitions
interface StatCard {
  title: string;
  value: string | number;
  unit?: string;
  change: string;
  trend: 'up' | 'down';
  icon: any;
  color: string;
  description: string;
  subValue: string;
}

interface MonthlyData {
  month: string;
  orders: number;
  revenue: number;
  distance: number;
}

interface RouteData {
  route: string;
  orders: number;
  avgCost: string;
  avgTime: string;
}

interface PerformanceMetric {
  label: string;
  value: number;
  total: number;
  percentage: number;
  color: string;
}

// Props để nhận dữ liệu từ API
interface Props {
  statsData?: StatCard[];
  monthlyData?: MonthlyData[];
  topRoutesData?: RouteData[];
  performanceData?: PerformanceMetric[];
}

const props = withDefaults(defineProps<Props>(), {
  statsData: () => [],
  monthlyData: () => [],
  topRoutesData: () => [],
  performanceData: () => []
});

// Default data (sẽ được thay thế bởi dữ liệu thật từ API)
const deliveryStats = computed(() => {
  if (props.statsData && props.statsData.length > 0) {
    return props.statsData;
  }
  
  // Mock data - sẽ được thay thế
  return [
    {
      title: 'Tổng Chi Phí Vận Chuyển',
      value: '45,678,000',
      unit: 'đ',
      change: '+8.5%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-600',
      description: 'So với tháng trước',
      subValue: '42.1M đ tháng trước'
    },
    {
      title: 'Đơn Hàng Đã Giao',
      value: '1,234',
      change: '+12.3%',
      trend: 'up' as const,
      icon: Package,
      color: 'from-blue-500 to-cyan-600',
      description: 'Tổng đơn tháng này',
      subValue: '1,099 đơn tháng trước'
    },
    {
      title: 'Tổng Quãng Đường',
      value: '45,678',
      unit: 'km',
      change: '+5.2%',
      trend: 'up' as const,
      icon: Navigation,
      color: 'from-purple-500 to-pink-600',
      description: 'Tổng quãng đường tháng này',
      subValue: '43,412 km tháng trước'
    },
    {
      title: 'Số Lượng Shipper',
      value: '20',
      change: '+2',
      trend: 'up' as const,
      icon: Users,
      color: 'from-orange-500 to-red-600',
      description: 'Shipper hoạt động',
      subValue: '18 shipper tháng trước'
    },
    {
      title: 'Đơn Đang Giao',
      value: '24',
      change: '+8',
      trend: 'up' as const,
      icon: Truck,
      color: 'from-indigo-500 to-purple-600',
      description: 'Đang vận chuyển',
      subValue: '16 đơn cùng giờ hôm qua'
    },
    {
      title: 'Tỷ Lệ Giao Thành Công',
      value: '98.5',
      unit: '%',
      change: '+1.2%',
      trend: 'up' as const,
      icon: Target,
      color: 'from-teal-500 to-cyan-600',
      description: 'Tỷ lệ giao hàng thành công',
      subValue: '97.3% tháng trước'
    },
    {
      title: 'Chi Phí Trung Bình / Đơn',
      value: '37,000',
      unit: 'đ',
      change: '-3.5%',
      trend: 'down' as const,
      icon: Activity,
      color: 'from-pink-500 to-rose-600',
      description: 'Chi phí TB mỗi đơn hàng',
      subValue: '38,300đ tháng trước'
    },
    {
      title: 'Thời Gian Giao TB',
      value: '45',
      unit: 'phút',
      change: '-8%',
      trend: 'down' as const,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      description: 'Thời gian giao trung bình',
      subValue: '49 phút tháng trước'
    }
  ];
});

const monthlyStats = computed(() => {
  if (props.monthlyData && props.monthlyData.length > 0) {
    return props.monthlyData;
  }
  
  // Mock data - sẽ được thay thế
  return [
    { month: 'T1', orders: 980, revenue: 36.2, distance: 38400 },
    { month: 'T2', orders: 1050, revenue: 38.5, distance: 41200 },
    { month: 'T3', orders: 1120, revenue: 41.2, distance: 42800 },
    { month: 'T4', orders: 1099, revenue: 42.1, distance: 43412 },
    { month: 'T5', orders: 1234, revenue: 45.7, distance: 45678 },
  ];
});

const topRoutes = computed(() => {
  if (props.topRoutesData && props.topRoutesData.length > 0) {
    return props.topRoutesData;
  }
  
  // Mock data - sẽ được thay thế
  return [
    { route: 'Q.1 - Q.3', orders: 156, avgCost: '42,000đ', avgTime: '35 phút' },
    { route: 'Q.7 - Q.2', orders: 134, avgCost: '48,000đ', avgTime: '42 phút' },
    { route: 'Q.Bình Thạnh - Q.5', orders: 128, avgCost: '38,000đ', avgTime: '38 phút' },
    { route: 'Q.10 - Q.1', orders: 112, avgCost: '35,000đ', avgTime: '32 phút' },
    { route: 'Q.Tân Bình - Q.3', orders: 98, avgCost: '40,000đ', avgTime: '40 phút' },
  ];
});

const performanceMetrics = computed(() => {
  if (props.performanceData && props.performanceData.length > 0) {
    return props.performanceData;
  }
  
  // Mock data - sẽ được thay thế
  return [
    { label: 'Đơn giao thành công', value: 1215, total: 1234, percentage: 98.5, color: 'bg-green-500' },
    { label: 'Đơn đang giao', value: 24, total: 1234, percentage: 1.9, color: 'bg-blue-500' },
    { label: 'Đơn bị hủy', value: 15, total: 1234, percentage: 1.2, color: 'bg-red-500' },
    { label: 'Đơn hoàn trả', value: 4, total: 1234, percentage: 0.3, color: 'bg-yellow-500' },
  ];
});

// Computed values
const totalOrders = computed(() => {
  return performanceMetrics.value.reduce((sum, m) => sum + m.value, 0);
});

const maxOrders = computed(() => {
  return Math.max(...monthlyStats.value.map(m => m.orders));
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
    <!-- Hero Section -->
    <section
  class="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden mb-8"
>

      <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2LTIuNjkgNi02cy0yLjY5LTYtNi02LTYgMi42OS02IDYgMi42OSA2IDYgNk0yNCA0NmMzLjMxIDAgNi0yLjY5IDYtNnMtMi42OS02LTYtNi02IDIuNjktNiA2IDIuNjkgNiA2IDYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      
      <div class="relative w-full px-4 lg:px-6 py-8">
        <div class="flex items-center justify-between">
          <div class="space-y-3 text-white">
            <div class="flex items-center gap-3">
              <div class="px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                <span class="text-xs font-semibold flex items-center gap-2">
                  <Calendar class="w-3.5 h-3.5" />
                  {{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>
            </div>
            
            <h1 class="text-3xl md:text-4xl font-bold">
              Thống Kê Vận Chuyển & Chi Phí
            </h1>
            
            <p class="text-sm text-white/90 max-w-2xl">
              Tổng quan hiệu suất và phân tích chi phí logistics tháng {{ new Date().toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }) }}
            </p>
          </div>
          
          <div class="hidden lg:flex items-center gap-3">
            <button class="px-4 py-2 bg-white/10 backdrop-blur-sm text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/30">
              Xuất Báo Cáo
            </button>
            <NuxtLink to="/admin/analytics" class="px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-all shadow-lg">
              Phân Tích Chi Tiết
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Stats Grid -->
    <section class="w-full px-4 lg:px-6 -mt-6 pb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          v-for="stat in deliveryStats" 
          :key="stat.title"
          class="bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-5 border border-gray-100"
        >
          <div class="flex items-start justify-between mb-3">
            <div :class="`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-md`">
              <component :is="stat.icon" class="w-6 h-6 text-white" />
            </div>
            <div class="flex items-center gap-1 text-xs font-semibold" :class="stat.trend === 'up' ? 'text-green-600' : 'text-red-600'">
              <component :is="stat.trend === 'up' ? TrendingUp : TrendingDown" class="w-3.5 h-3.5" />
              {{ stat.change }}
            </div>
          </div>
          <h3 class="text-gray-500 text-xs font-medium mb-1">{{ stat.title }}</h3>
          <p class="text-gray-900 text-2xl font-bold">
            {{ stat.value }}<span v-if="stat.unit" class="text-base ml-1">{{ stat.unit }}</span>
          </p>
          <p class="text-gray-400 text-xs mt-1.5">{{ stat.description }}</p>
          <p class="text-gray-400 text-xs mt-0.5">{{ stat.subValue }}</p>
        </div>
      </div>
    </section>

    <!-- Statistics Charts -->
    <section class="w-full px-4 lg:px-6 pb-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Monthly Performance -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Hiệu Suất 5 Tháng Gần Đây</h3>
              <p class="text-xs text-gray-500">Theo dõi xu hướng tăng trưởng</p>
            </div>
            <Zap class="w-5 h-5 text-yellow-500" />
          </div>
          
          <div class="space-y-4">
            <div v-for="month in monthlyStats" :key="month.month" class="flex items-center gap-4">
              <div class="w-12 text-center">
                <p class="text-xs font-bold text-gray-700">{{ month.month }}</p>
              </div>
              <div class="flex-1 space-y-2">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-gray-600">Đơn hàng</span>
                  <span class="font-bold text-gray-900">{{ month.orders }}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    class="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                    :style="`width: ${(month.orders / maxOrders) * 100}%`"
                  ></div>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Doanh thu</p>
                <p class="text-sm font-bold text-green-600">{{ month.revenue }}M</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Routes -->
        <div class="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">Top 5 Tuyến Đường Phổ Biến</h3>
              <p class="text-xs text-gray-500">Dựa trên số lượng đơn hàng</p>
            </div>
            <Navigation class="w-5 h-5 text-purple-500" />
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="(route, index) in topRoutes" 
              :key="route.route"
              class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                {{ index + 1 }}
              </div>
              <div class="flex-1">
                <p class="font-semibold text-gray-900 text-sm">{{ route.route }}</p>
                <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
                  <span>{{ route.orders }} đơn</span>
                  <span>•</span>
                  <span>{{ route.avgTime }}</span>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs text-gray-500">Chi phí TB</p>
                <p class="text-sm font-bold text-blue-600">{{ route.avgCost }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Performance Metrics -->
    <section class="w-full px-4 lg:px-6 pb-6">
      <div class="bg-white rounded-xl shadow-md border border-gray-100 p-5">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-gray-900">Phân Tích Trạng Thái Đơn Hàng</h3>
            <p class="text-xs text-gray-500">Tổng: {{ totalOrders }} đơn tháng này</p>
          </div>
          <Activity class="w-5 h-5 text-blue-500" />
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="metric in performanceMetrics" :key="metric.label" class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">{{ metric.label }}</span>
              <span class="text-sm font-bold text-gray-900">{{ metric.value }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div 
                :class="`${metric.color} h-2 rounded-full`"
                :style="`width: ${metric.percentage}%`"
              ></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-500">{{ metric.percentage.toFixed(1) }}%</span>
              <span class="text-gray-400">{{ metric.total }} tổng</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>