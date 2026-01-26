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
                Theo Dõi Trạng Thái
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

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      <!-- UNGROUPED ORDERS -->
      <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 class="text-lg font-bold text-gray-900 mb-4">Đơn hàng chưa phân công</h2>
        
        <!-- FILTER -->
        <div class="flex flex-wrap items-center gap-4 mb-6">
          <label class="font-medium text-sm text-gray-700">Tạo công việc theo:</label>
          <select
            v-model="groupType"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
          >
            <option value="area">Khu vực</option>
            <option value="priority">Mức độ ưu tiên</option>
            <option value="time">Thời gian</option>
          </select>

          <button
            class="px-4 py-2 bg-gradient-to-r from-glow-primary-500 to-glow-primary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-glow-primary-500/30 transition-all"
            @click="createTasksByFilter"
          >
            Tạo công việc
          </button>
        </div>

        <!-- Orders List -->
        <div v-if="unGroupedOrders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p class="text-gray-500">Không có đơn hàng chưa phân công</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="o in unGroupedOrders"
            :key="o.id"
            class="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-glow-primary-300 transition-all"
          >
            <div class="flex items-start justify-between mb-2">
              <h3 class="font-semibold text-gray-900">Đơn hàng #{{ o.id }}</h3>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-semibold',
                  o.priority === 'high' ? 'bg-red-100 text-red-700' :
                  o.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                ]"
              >
                {{ formatPriority(o.priority) }}
              </span>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p class="text-xs text-gray-500">Từ</p>
                <p class="text-gray-700">{{ o.pickupAddress }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Đến</p>
                <p class="text-gray-700">{{ o.deliveryAddress }}</p>
              </div>
            </div>

            <div class="flex items-center justify-between mt-3 text-xs text-gray-500">
              <span>{{ o.vehicleType }}</span>
              <span>{{ o.pickupTime.split('T')[0] }} {{ o.pickupTime.split('T')[1] }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TASK LIST -->
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ task.name }}</h3>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold',
              task.status === 'pending' ? 'bg-blue-100 text-blue-700' :
              task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            ]"
          >
            {{ task.status === 'pending' ? 'Chờ xử lý' : task.status === 'in_progress' ? 'Đang thực hiện' : 'Hoàn thành' }}
          </span>
        </div>

        <div class="mb-4 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-700">
            <span class="font-medium">Tài xế:</span> {{ getDriverName(task.driverId) }}
          </p>
        </div>

        <!-- Driver Selection -->
        <div v-if="!task.driverId" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Chọn tài xế</label>
          <select
            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
            @change="assignDriverToTask(task, Number(($event.target as HTMLSelectElement).value))"
          >
            <option value="">-- Chọn tài xế --</option>
            <option
              v-for="d in availableDrivers"
              :key="d.id"
              :value="d.id"
            >
              {{ d.name }} (⭐ {{ d.rating }})
            </option>
          </select>
        </div>

        <!-- Task Orders -->
        <div class="space-y-2 mb-4">
          <h4 class="text-sm font-semibold text-gray-700">Đơn hàng trong công việc:</h4>
          <div
            v-for="o in task.orders"
            :key="o.id"
            class="bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center justify-between">
              <span class="font-medium text-gray-900">#{{ o.id }}</span>
              <span class="text-xs text-gray-500">{{ o.vehicleType }}</span>
            </div>
            <p class="text-sm text-gray-600 mt-1">{{ o.deliveryAddress }}</p>
          </div>
        </div>

        <!-- Complete Button -->
        <button
          v-if="task.status === 'in_progress'"
          class="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/30 transition-all"
          @click="completeTask(task)"
        >
          Hoàn thành công việc
        </button>
      </div>

    </main>
  </div>
</template>