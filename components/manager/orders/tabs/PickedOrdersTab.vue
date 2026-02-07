<script setup lang="ts">
import { ref, computed } from 'vue'
import { CheckCircle2, MapPin, Package, Calendar } from 'lucide-vue-next'

interface Props {
  orders: any[]
  isLoading: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  refresh: []
}>()

const {
  getOrderDetails,
  groupOrdersByArea,
  createDeliveryScheduleWithGA
} = useOrderManagement()

const { postOfficeId } = useAuth()

// ============================================================================
// STATE
// ============================================================================
const selectedOrder = ref<any>(null)
const orderDetails = ref<any[]>([])
const groupedOrders = ref<any>({})
const showScheduleModal = ref(false)
const selectedAreas = ref<string[]>([])
const scheduledDate = ref<string>('')

// ============================================================================
// COMPUTED
// ============================================================================
const ordersByArea = computed(() => {
  const grouped: Record<string, any[]> = {}
  
  props.orders.forEach(order => {
    // Giả sử order có pickup_area_code
    const area = order.pickup_area_code || 'UNKNOWN'
    if (!grouped[area]) {
      grouped[area] = []
    }
    grouped[area].push(order)
  })
  
  return grouped
})

const availableAreas = computed(() => {
  return Object.keys(ordersByArea.value).map(areaCode => ({
    code: areaCode,
    count: ordersByArea.value[areaCode].length
  }))
})

// ============================================================================
// METHODS
// ============================================================================
const viewOrderDetails = async (order: any) => {
  selectedOrder.value = order
  orderDetails.value = await getOrderDetails(order.id)
}

const toggleAreaSelection = (areaCode: string) => {
  const index = selectedAreas.value.indexOf(areaCode)
  if (index > -1) {
    selectedAreas.value.splice(index, 1)
  } else {
    selectedAreas.value.push(areaCode)
  }
}

const loadGroupedOrders = async () => {
  groupedOrders.value = await groupOrdersByArea()
}

const createScheduleWithGA = async () => {
  if (selectedAreas.value.length === 0 || !scheduledDate.value || !postOfficeId.value) {
    alert('⚠️ Vui lòng chọn khu vực và ngày giao hàng')
    return
  }

  const result = await createDeliveryScheduleWithGA({
    post_office_id: postOfficeId.value,
    scheduled_date: scheduledDate.value,
    area_codes: selectedAreas.value
  })

  if (result) {
    alert(`✅ Đã tạo lịch giao hàng!\nSchedule: ${result.schedule_id}\nĐơn hàng: ${result.total_orders_scheduled}`)
    showScheduleModal.value = false
    selectedAreas.value = []
    scheduledDate.value = ''
    emit('refresh')
  }
}
</script>

<template>
  <div>
    <!-- ACTION BUTTON -->
    <div class="mb-6">
      <button
        @click="showScheduleModal = true; loadGroupedOrders()"
        class="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
      >
        <Calendar class="w-4 h-4" />
        Tạo lịch giao hàng (GA)
      </button>
    </div>

    <!-- ORDERS BY AREA -->
    <div class="space-y-6">
      <div
        v-for="(areaOrders, areaCode) in ordersByArea"
        :key="areaCode"
        class="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        <!-- Area Header -->
        <div class="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MapPin class="w-5 h-5 text-green-600" />
              <span class="font-semibold text-green-900">{{ areaCode }}</span>
            </div>
            <span class="text-sm text-green-700">{{ areaOrders.length }} đơn</span>
          </div>
        </div>

        <!-- Orders List -->
        <div class="divide-y divide-gray-100">
          <div
            v-for="order in areaOrders"
            :key="order.id"
            class="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="viewOrderDetails(order)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="font-medium text-gray-900 mb-1">{{ order.id }}</div>
                <div class="text-sm text-gray-600 space-y-1">
                  <div class="flex items-center gap-1">
                    <MapPin class="w-4 h-4" />
                    <span>{{ order.pickup_point || 'Tại bưu cục' }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Package class="w-4 h-4" />
                    <span>{{ order.total_packages }} kiện</span>
                  </div>
                </div>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center gap-1">
                <CheckCircle2 class="w-3 h-3" />
                Đã lấy
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EMPTY STATE -->
    <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
      <CheckCircle2 class="w-16 h-16 mx-auto mb-4 opacity-30" />
      <p>Chưa có đơn hàng nào đã lấy</p>
    </div>

    <!-- MODAL: TẠO LỊCH GIAO -->
    <div v-if="showScheduleModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="showScheduleModal = false">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" @click.stop>
        <h3 class="text-xl font-bold mb-4">Tạo lịch giao hàng tự động (GA)</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Ngày giao hàng</label>
          <input
            v-model="scheduledDate"
            type="date"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

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
                class="w-4 h-4 text-green-600 rounded"
              />
              <span class="flex-1 text-sm">{{ area.code }}</span>
              <span class="text-xs text-gray-500">{{ area.count }} đơn</span>
            </label>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="showScheduleModal = false"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium"
          >
            Hủy
          </button>
          <button
            @click="createScheduleWithGA"
            :disabled="selectedAreas.length === 0 || !scheduledDate"
            class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            Tạo lịch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>