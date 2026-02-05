<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  FileCheck, 
  Package, 
  CheckCircle2, 
  AlertCircle,
  BarChart3
} from 'lucide-vue-next'

// Import các tab components
import PendingOrdersTab from '@/components/manager/orders/tabs/PendingOrdersTab.vue'
import ConfirmedOrdersTab from '@/components/manager/orders/tabs/ConfirmedOrdersTab.vue'
import PickedOrdersTab from '@/components/manager/orders/tabs/PickedOrdersTab.vue'
import StatisticsTab from '@/components/manager/orders/tabs/StatisticsTab.vue'

definePageMeta({
  layout: 'manager',
})

const {
  getPendingOrders,
  getConfirmedOrders,
  getPickedOrders,
  getOrderStatistics,
  isLoading,
  error
} = useOrderManagement()

// ============================================================================
// STATE
// ============================================================================
const activeTab = ref<'pending' | 'confirmed' | 'picked' | 'stats'>('pending')

const pendingOrders = ref<any[]>([])
const confirmedOrders = ref<{ pickup: any[], dropoff: any[] }>({ pickup: [], dropoff: [] })
const pickedOrders = ref<any[]>([])
const statistics = ref<any>(null)

// ============================================================================
// COMPUTED
// ============================================================================
const tabCounts = computed(() => ({
  pending: pendingOrders.value.length,
  confirmed: confirmedOrders.value.pickup.length + confirmedOrders.value.dropoff.length,
  picked: pickedOrders.value.length
}))

// ============================================================================
// METHODS
// ============================================================================
const loadAllData = async () => {
  try {
    const [pending, confirmed, picked, stats] = await Promise.all([
      getPendingOrders(),
      getConfirmedOrders(),
      getPickedOrders(),
      getOrderStatistics()
    ])

    pendingOrders.value = pending
    confirmedOrders.value = confirmed
    pickedOrders.value = picked
    statistics.value = stats

    console.log(' Loaded data:', {
      pending: pending.length,
      confirmed_pickup: confirmed.pickup.length,
      confirmed_dropoff: confirmed.dropoff.length,
      picked: picked.length
    })
  } catch (e) {
    console.error(' Error loading data:', e)
  }
}

const switchTab = (tab: typeof activeTab.value) => {
  activeTab.value = tab
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  loadAllData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 p-6">
    <div class="max-w-7xl mx-auto">
      
      <!-- HEADER -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Quản lý đơn hàng
        </h1>
        <p class="text-gray-600">
          Theo dõi và xử lý đơn hàng từ pending đến hoàn thành
        </p>
      </div>

      <!-- ERROR MESSAGE -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>

      <!-- STATISTICS CARDS -->
      <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <!-- Pending Orders -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <FileCheck class="w-8 h-8 text-yellow-500" />
            <span class="text-2xl font-bold text-gray-900">{{ statistics.pending_count }}</span>
          </div>
          <p class="text-sm text-gray-600">Chờ duyệt</p>
        </div>

        <!-- Confirmed Pickup -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <Package class="w-8 h-8 text-blue-500" />
            <span class="text-2xl font-bold text-gray-900">{{ statistics.confirmed_pickup_count }}</span>
          </div>
          <p class="text-sm text-gray-600">Cần lấy hàng</p>
        </div>

        <!-- Confirmed Dropoff -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <Package class="w-8 h-8 text-purple-500" />
            <span class="text-2xl font-bold text-gray-900">{{ statistics.confirmed_dropoff_count }}</span>
          </div>
          <p class="text-sm text-gray-600">Sẵn sàng giao</p>
        </div>

        <!-- Picked Orders -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between mb-4">
            <CheckCircle2 class="w-8 h-8 text-green-500" />
            <span class="text-2xl font-bold text-gray-900">{{ statistics.picked_count }}</span>
          </div>
          <p class="text-sm text-gray-600">Đã lấy hàng</p>
        </div>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div class="flex overflow-x-auto border-b border-gray-200">
          <!-- Tab 1: Pending -->
          <button
            @click="switchTab('pending')"
            :class="[
              'px-6 py-4 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === 'pending'
                ? 'bg-yellow-500 text-white border-b-2 border-yellow-600'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <FileCheck class="w-4 h-4" />
            Chờ duyệt
            <span v-if="tabCounts.pending > 0" 
              :class="[
                'ml-2 px-2 py-0.5 text-xs font-semibold rounded-full',
                activeTab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700'
              ]">
              {{ tabCounts.pending }}
            </span>
          </button>

          <!-- Tab 2: Confirmed -->
          <button
            @click="switchTab('confirmed')"
            :class="[
              'px-6 py-4 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === 'confirmed'
                ? 'bg-blue-500 text-white border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <Package class="w-4 h-4" />
            Đã duyệt
            <span v-if="tabCounts.confirmed > 0"
              :class="[
                'ml-2 px-2 py-0.5 text-xs font-semibold rounded-full',
                activeTab === 'confirmed' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
              ]">
              {{ tabCounts.confirmed }}
            </span>
          </button>

          <!-- Tab 3: Picked -->
          <button
            @click="switchTab('picked')"
            :class="[
              'px-6 py-4 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === 'picked'
                ? 'bg-green-500 text-white border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <CheckCircle2 class="w-4 h-4" />
            Đã lấy hàng
            <span v-if="tabCounts.picked > 0"
              :class="[
                'ml-2 px-2 py-0.5 text-xs font-semibold rounded-full',
                activeTab === 'picked' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700'
              ]">
              {{ tabCounts.picked }}
            </span>
          </button>

          <!-- Tab 4: Statistics -->
          <button
            @click="switchTab('stats')"
            :class="[
              'px-6 py-4 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2',
              activeTab === 'stats'
                ? 'bg-purple-500 text-white border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            <BarChart3 class="w-4 h-4" />
            Thống kê
          </button>
        </div>

        <!-- TAB CONTENT -->
        <div class="p-6">
          <!-- Pending Tab -->
          <PendingOrdersTab 
            v-if="activeTab === 'pending'"
            :orders="pendingOrders" 
            :is-loading="isLoading"
            @refresh="loadAllData"
          />

          <!-- Confirmed Tab -->
          <ConfirmedOrdersTab 
            v-if="activeTab === 'confirmed'"
            :pickup-orders="confirmedOrders.pickup"
            :dropoff-orders="confirmedOrders.dropoff"
            :is-loading="isLoading"
            @refresh="loadAllData"
          />

          <!-- Picked Tab -->
          <PickedOrdersTab 
            v-if="activeTab === 'picked'"
            :orders="pickedOrders"
            :is-loading="isLoading"
            @refresh="loadAllData"
          />

          <!-- Statistics Tab -->
          <StatisticsTab 
            v-if="activeTab === 'stats'"
            :statistics="statistics" 
          />
        </div>
      </div>
    </div>
  </div>
</template>