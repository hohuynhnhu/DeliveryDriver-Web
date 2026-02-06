<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Package, 
  Truck, 
  Calendar,
  User,
  MapPin,
  ChevronRight,
  Settings
} from 'lucide-vue-next'

interface Props {
  pickupOrders: any[]
  dropoffOrders: any[]
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const {
  getOrderDetails,
  assignDriverToPickup,
  createDeliveryScheduleWithGA,
  groupOrdersByArea
} = useOrderManagement()

const { postOfficeId } = useAuth()

// ============================================================================
// STATE
// ============================================================================
const selectedView = ref<'pickup' | 'dropoff'>('pickup')
const selectedOrder = ref<any>(null)
const orderDetails = ref<any[]>([])
const showScheduleModal = ref(false)
const showDriverModal = ref(false)
const selectedDriver = ref<string>('')

// Delivery scheduling state
const selectedAreas = ref<string[]>([])
const scheduledDate = ref<string>('')
const groupedOrders = ref<any>({})

// ============================================================================
// COMPUTED
// ============================================================================
const currentOrders = computed(() => {
  return selectedView.value === 'pickup' ? props.pickupOrders : props.dropoffOrders
})

const availableAreas = computed(() => {
  if (!groupedOrders.value || Object.keys(groupedOrders.value).length === 0) {
    return []
  }
  return Object.keys(groupedOrders.value).map(areaCode => ({
    code: areaCode,
    count: groupedOrders.value[areaCode].total_orders || 0
  }))
})


/**
 * Xem chi tiết order_details
 */
const viewOrderDetails = async (order: any) => {
  selectedOrder.value = order
  orderDetails.value = await getOrderDetails(order.id)
  console.log('📦 Order details:', orderDetails.value)
}

/**
 * Gán tài xế cho lịch lấy hàng
 */
const assignDriver = async () => {
  if (!selectedOrder.value || !selectedDriver.value) return

  const success = await assignDriverToPickup(selectedOrder.value.id, selectedDriver.value)

  if (success) {
    alert(' Đã gán tài xế thành công!')
    showDriverModal.value = false
    selectedDriver.value = ''
    selectedOrder.value = null
    emit('refresh')
  } else {
    alert(' Không thể gán tài xế')
  }
}

/**
 * Load danh sách đơn hàng nhóm theo area
 */
const loadGroupedOrders = async () => {
  groupedOrders.value = await groupOrdersByArea()
  console.log('Grouped orders by area:', groupedOrders.value)
}

/**
 * Tạo lịch giao hàng tự động (GA)
 */
const createScheduleWithGA = async () => {
  if (selectedAreas.value.length === 0 || !scheduledDate.value || !postOfficeId.value) {
    alert(' Vui lòng chọn khu vực và ngày giao hàng')
    return
  }

  const result = await createDeliveryScheduleWithGA({
    post_office_id: postOfficeId.value,
    scheduled_date: scheduledDate.value,
    area_codes: selectedAreas.value
  })

  if (result) {
    alert(` Đã tạo lịch giao hàng thành công!\nSchedule ID: ${result.schedule_id}\nĐã gán: ${result.total_orders_scheduled} đơn hàng`)
    showScheduleModal.value = false
    selectedAreas.value = []
    scheduledDate.value = ''
    emit('refresh')
  } else {
    alert('Không thể tạo lịch giao hàng')
  }
}

/**
 * Toggle area selection
 */
const toggleAreaSelection = (areaCode: string) => {
  const index = selectedAreas.value.indexOf(areaCode)
  if (index > -1) {
    selectedAreas.value.splice(index, 1)
  } else {
    selectedAreas.value.push(areaCode)
  }
}
</script>

<template>
  <div>
    <!-- SUB TABS: PICKUP vs DROPOFF -->
    <div class="flex gap-4 mb-6">
      <button
        @click="selectedView = 'pickup'"
        :class="[
          'flex-1 px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
          selectedView === 'pickup'
            ? 'bg-blue-500 text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        <Package class="w-5 h-5" />
        Đơn cần lấy hàng ({{ pickupOrders.length }})
      </button>

      <button
        @click="selectedView = 'dropoff'"
        :class="[
          'flex-1 px-6 py-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2',
          selectedView === 'dropoff'
            ? 'bg-purple-500 text-white shadow-lg'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        <Truck class="w-5 h-5" />
        Đơn sẵn sàng giao ({{ dropoffOrders.length }})
      </button>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex gap-3 mb-6">
      <!-- Button: Tạo lịch giao (chỉ show khi view = dropoff hoặc đã có đơn picked) -->
      <button
        @click="showScheduleModal = true; loadGroupedOrders()"
        class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
      >
        <Calendar class="w-4 h-4" />
        Tạo lịch giao hàng (GA)
      </button>
    </div>

    <!-- ORDERS LIST -->
    <div v-if="currentOrders.length === 0" class="text-center py-12 text-gray-500">
      <Package class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>Không có đơn hàng nào</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="order in currentOrders"
        :key="order.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        @click="viewOrderDetails(order)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="font-semibold text-gray-900">{{ order.id }}</span>
              <span 
                :class="[
                  'px-2 py-0.5 text-xs rounded-full font-medium',
                  order.pickup_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.pickup_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                  order.pickup_status === 'picked' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                ]"
              >
                {{ order.pickup_status }}
              </span>
            </div>

            <div class="flex items-center gap-4 text-sm text-gray-600">
              <div class="flex items-center gap-1">
                <MapPin class="w-4 h-4" />
                <span>{{ order.pickup_point }}</span>
              </div>
              <div class="flex items-center gap-1">
                <Package class="w-4 h-4" />
                <span>{{ order.total_packages }} kiện</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2">
            <!-- Gán tài xế (chỉ cho PICKUP chưa gán) -->
            <button
              v-if="selectedView === 'pickup' && order.pickup_status === 'pending'"
              @click.stop="selectedOrder = order; showDriverModal = true"
              class="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors flex items-center gap-1"
            >
              <User class="w-4 h-4" />
              Gán tài xế
            </button>

            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: GÁN TÀI XẾ -->
    <div v-if="showDriverModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showDriverModal = false">
      <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4" @click.stop>
        <h3 class="text-xl font-bold mb-4">Gán tài xế lấy hàng</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Chọn tài xế</label>
          <select
            v-model="selectedDriver"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn tài xế --</option>
            <!-- TODO: Load danh sách tài xế available -->
            <option value="driver-1">Tài xế 1</option>
            <option value="driver-2">Tài xế 2</option>
          </select>
        </div>

        <div class="flex gap-3">
          <button
            @click="showDriverModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            @click="assignDriver"
            :disabled="!selectedDriver"
            class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL: TẠO LỊCH GIAO HÀNG (GA) -->
    <div v-if="showScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showScheduleModal = false">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings class="w-6 h-6" />
          Tạo lịch giao hàng tự động (GA)
        </h3>

        <!-- Chọn ngày -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ngày giao hàng</label>
          <input
            v-model="scheduledDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <!-- Chọn khu vực -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Chọn khu vực ({{ selectedAreas.length }} đã chọn)
          </label>

          <div class="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
            <label
              v-for="area in availableAreas"
              :key="area.code"
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="selectedAreas.includes(area.code)"
                @change="toggleAreaSelection(area.code)"
                class="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <span class="flex-1 text-sm">{{ area.code }}</span>
              <span class="text-xs text-gray-500">{{ area.count }} đơn</span>
            </label>
          </div>
        </div>

        <!-- Summary -->
        <div v-if="selectedAreas.length > 0" class="mb-4 p-4 bg-green-50 rounded-lg">
          <p class="text-sm text-green-800">
            Sẽ tạo lịch giao cho <strong>{{ selectedAreas.length }}</strong> khu vực vào ngày 
            <strong>{{ scheduledDate }}</strong>
          </p>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="showScheduleModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            @click="createScheduleWithGA"
            :disabled="selectedAreas.length === 0 || !scheduledDate"
            class="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tạo lịch với GA
          </button>
        </div>
      </div>
    </div>
  </div>
</template>