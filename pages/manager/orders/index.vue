<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Package, Home, UserCheck, Activity, Zap, LogOut } from 'lucide-vue-next'

// Vô hiệu hóa layout mặc định
definePageMeta({
  layout: false
});

/* ===== INTERFACES ===== */
interface Driver {
  id: number
  name: string
  rating: number
  available: boolean
}

type Priority = 'high' | 'medium' | 'low'
type GroupType = 'area' | 'priority' | 'time'

interface Order {
  id: number
  sender: string
  senderPhone: string
  receiver: string
  receiverPhone: string
  pickupAddress: string
  deliveryAddress: string
  vehicleType: string

  area: string
  priority: Priority
  pickupTime: string        // ISO time
  taskId: number | null
}

interface Task {
  id: number
  name: string
  driverId: number | null
  orders: Order[]
  status: 'pending' | 'in_progress' | 'completed'
}

interface EmergencyOrder {
  id: number
  customer: string
  phone: string
  address: string
  status: string
  createdAt: string
}

/* ===== ROUTER ===== */
const router = useRouter()

/* ===== DRIVERS ===== */
const drivers = ref<Driver[]>([
  { id: 1, name: 'Nguyễn Văn Driver A', rating: 4.8, available: true },
  { id: 2, name: 'Trần Văn Driver B', rating: 4.4, available: true },
  { id: 3, name: 'Lê Văn Driver C', rating: 4.0, available: false }
])

/* ===== ORDERS ===== */
const orders = ref<Order[]>([
  {
    id: 101,
    sender: 'Nguyễn Văn A',
    senderPhone: '0909123456',
    receiver: 'Trần Văn B',
    receiverPhone: '0909988776',
    pickupAddress: 'Quận 3, TP.HCM',
    deliveryAddress: 'Quận 1, TP.HCM',
    vehicleType: 'Xe máy',
    area: 'Trung tâm',
    priority: 'high',
    pickupTime: '2026-01-21T09:00',
    taskId: null
  },
  {
    id: 102,
    sender: 'Lê Thị C',
    senderPhone: '0909777666',
    receiver: 'Phạm Văn D',
    receiverPhone: '0909333444',
    pickupAddress: 'Quận 10, TP.HCM',
    deliveryAddress: 'Quận 7, TP.HCM',
    vehicleType: 'Xe tải',
    area: 'Ngoại thành',
    priority: 'medium',
    pickupTime: '2026-01-21T14:00',
    taskId: null
  }
])

/* ===== EMERGENCY ORDERS ===== */
const emergencyOrders = ref<EmergencyOrder[]>([
  {
    id: 201,
    customer: 'Nguyễn Văn A',
    phone: '0909123456',
    address: 'Quận 3, TP.HCM',
    status: 'pending',
    createdAt: '2026-01-21 09:00'
  },
  {
    id: 202,
    customer: 'Trần Thị B',
    phone: '0909654321',
    address: 'Quận 1, TP.HCM',
    status: 'processing',
    createdAt: '2026-01-21 10:30'
  }
])

const selectedOrder = ref<EmergencyOrder | null>(null)

/* ===== TASKS ===== */
const tasks = ref<Task[]>([])

/* ===== FILTER STATE ===== */
const groupType = ref<GroupType>('area')

/* ===== COMPUTED ===== */
const unGroupedOrders = computed(() =>
  orders.value.filter(o => !o.taskId)
)

const availableDrivers = computed(() =>
  drivers.value.filter(d => d.available)
)

/* ===== HELPERS ===== */
const getDriverName = (id: number | null) =>
  drivers.value.find(d => d.id === id)?.name || '-'

const formatPriority = (p: Priority) =>
  p === 'high' ? 'Cao' : p === 'medium' ? 'Trung bình' : 'Thấp'

const statusColor = (status: string) => {
  if (status === 'pending') return 'bg-blue-100 text-blue-700'
  if (status === 'processing') return 'bg-yellow-100 text-yellow-700'
  if (status === 'completed') return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-700'
}

/* ===== CREATE TASKS BY FILTER ===== */
const createTasksByFilter = () => {
  const map: Record<string, Order[]> = {}

  unGroupedOrders.value.forEach(order => {
    let key = ''

    if (groupType.value === 'area') key = order.area
    if (groupType.value === 'priority') key = order.priority
    if (groupType.value === 'time') key = order.pickupTime.split('T')[0]

    if (!map[key]) map[key] = []
    map[key].push(order)
  })

  Object.keys(map).forEach(key => {
    const taskId = Date.now() + Math.random()

    const task: Task = {
      id: taskId,
      name:
        groupType.value === 'area'
          ? `Công việc khu vực ${key}`
          : groupType.value === 'priority'
          ? `Công việc ưu tiên ${formatPriority(key as Priority)}`
          : `Công việc ngày ${key}`,
      driverId: null,
      orders: map[key],
      status: 'pending'
    }

    map[key].forEach(o => (o.taskId = taskId))
    tasks.value.push(task)
  })
}

/* ===== ASSIGN DRIVER TO TASK ===== */
const assignDriverToTask = (task: Task, driverId: number) => {
  const driver = drivers.value.find(d => d.id === driverId)
  if (!driver || !driver.available) return

  task.driverId = driver.id
  task.status = 'in_progress'
  driver.available = false
}

/* ===== COMPLETE TASK ===== */
const completeTask = (task: Task) => {
  task.status = 'completed'
  const driver = drivers.value.find(d => d.id === task.driverId)
  if (driver) driver.available = true
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">

    <!-- HEADER -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div class="px-6">
        <div class="flex justify-between items-center h-16">
          <!-- LEFT -->
          <div class="flex items-center gap-3">
            <button
              @click="router.push('/manager/dashboard')"
              class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft class="w-5 h-5 text-gray-600" />
            </button>

            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600
                       rounded-xl flex items-center justify-center shadow-lg
                       shadow-glow-primary-500/30"
              >
                <Activity class="w-6 h-6 text-white" />
              </div>
              <h1
                class="text-xl font-bold bg-gradient-to-r from-glow-primary-600
                       to-glow-primary-500 bg-clip-text text-transparent"
              >
                Trang chủ
              </h1>
            </div>
          </div>

          <!-- NAV -->
          <nav class="hidden md:block">
            <ul class="flex items-center gap-1">
              <li>
                <button
                  @click="router.push('/manager/dashboard')"
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Home class="w-4 h-4 mr-2" />
                  Trang Chủ
                </button>
              </li>
              <li>
                <button
                  @click="router.push('/manager/orders/1')"
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Package class="w-4 h-4 mr-2" />
                  Xử lý đơn hàng
                </button>
              </li>
              <li>
                <button
                  @click="router.push('/manager/orders/assign')"
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <UserCheck class="w-4 h-4 mr-2" />
                  Phân Công Đơn
                </button>
              </li>
              <li>
                <button
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center bg-glow-primary-500 text-white shadow-lg shadow-glow-primary-500/30"
                >
                  <Activity class="w-4 h-4 mr-2" />
                  Theo Dõi Trạng Thái
                </button>
              </li>
              <li>
                <button
                  @click="router.push('/manager/orders/emergency')"
                  class="px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600"
                >
                  <Zap class="w-4 h-4 mr-2" />
                  Xử Lý Đột Xuất
                </button>
              </li>
            </ul>
          </nav>

          <!-- USER -->
          <div class="flex items-center gap-4">
            <button
              class="px-4 py-2 text-sm font-medium text-white
                     bg-gradient-to-r from-glow-primary-500 to-glow-primary-600
                     rounded-lg hover:shadow-lg hover:shadow-glow-primary-500/30
                     transition-all flex items-center gap-2"
            >
              <LogOut class="w-4 h-4" />
              <span class="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- DANH SÁCH ĐƠN -->
        <aside class="lg:col-span-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Danh sách đơn hàng</h2>

            <div v-if="emergencyOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p class="text-gray-500">Không có đơn hàng</p>
            </div>

            <ul v-else class="space-y-3">
              <li
                v-for="order in emergencyOrders"
                :key="order.id"
                @click="selectedOrder = order"
                class="p-4 rounded-lg cursor-pointer border-2 transition-all hover:shadow-md"
                :class="selectedOrder?.id === order.id 
                  ? 'bg-glow-primary-50 border-glow-primary-400 shadow-sm' 
                  : 'border-gray-200 hover:border-glow-primary-200'"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-semibold text-gray-900">#{{ order.id }}</span>
                  <span
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="statusColor(order.status)"
                  >
                    {{ order.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 font-medium">{{ order.customer }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ order.phone }}</p>
              </li>
            </ul>
          </div>
        </aside>

        <!-- CHI TIẾT ĐƠN -->
        <section class="lg:col-span-8">
          <div
            v-if="selectedOrder"
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-gray-900">
                Chi tiết đơn hàng #{{ selectedOrder.id }}
              </h2>
              <span
                class="px-3 py-1 text-sm font-semibold rounded-full"
                :class="statusColor(selectedOrder.status)"
              >
                {{ selectedOrder.status }}
              </span>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Khách hàng</p>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.customer }}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Số điện thoại</p>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.phone }}</p>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p class="text-xs text-gray-500 mb-1">Địa chỉ</p>
                <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.address }}</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Thời gian tạo</p>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.createdAt }}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p class="text-xs text-gray-500 mb-1">Thời gian giao dự kiến</p>
                  <p class="text-sm font-semibold text-gray-900">{{ selectedOrder.createdAt }}</p>
                </div>
              </div>
            </div>


          </div>

          <div
            v-else
            class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"
          >
            <Package class="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p class="text-gray-500 text-lg">Chọn một đơn hàng để xem chi tiết</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>