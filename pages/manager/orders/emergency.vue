<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

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
  <div class="min-h-screen bg-gray-50">

    <!-- HEADER -->
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="px-6 h-16 flex items-center gap-3">
        <button @click="router.push('/manager/dashboard')">
          <ArrowLeft />
        </button>
        <h1 class="font-bold text-lg">Quay lại</h1>
      </div>
    </header>

    <main class="max-w-6xl mx-auto p-6 space-y-8">

      <!-- UNGROUPED ORDERS -->
      <div class="bg-white p-6 rounded-lg border">
        <!-- FILTER -->
        <div class="flex items-center gap-4 mb-4">
          <label class="font-medium">Tạo công việc theo:</label>
          <select
            v-model="groupType"
            class="border rounded px-3 py-2"
          >
            <option value="area">Khu vực</option>
            <option value="priority">Mức độ ưu tiên</option>
            <option value="time">Thời gian</option>
          </select>

          <button
            class="px-4 py-2 bg-blue-600 text-white rounded"
            @click="createTasksByFilter"
          >
            Tạo công việc
          </button>
        </div>

        <ul>
          <li v-for="o in unGroupedOrders" :key="o.id">
            #{{ o.id }} | {{ o.deliveryAddress }} |
            {{ formatPriority(o.priority) }} |
            {{ o.pickupTime.split('T')[0] }}
          </li>
        </ul>
      </div>

      <!-- TASK LIST -->
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white p-6 rounded-lg border"
      >
        <div class="flex justify-between mb-2">
          <h3 class="font-bold">{{ task.name }}</h3>
          <span class="text-sm">{{ task.status }}</span>
        </div>

        <p>Tài xế: {{ getDriverName(task.driverId) }}</p>

        <select
          v-if="!task.driverId"
          class="mt-2 border rounded px-3 py-2"
          @change="assignDriverToTask(task, Number($event.target.value))"
        >
          <option value="">Chọn tài xế</option>
          <option
            v-for="d in availableDrivers"
            :key="d.id"
            :value="d.id"
          >
            {{ d.name }}
          </option>
        </select>

        <ul class="mt-3">
          <li v-for="o in task.orders" :key="o.id">
            #{{ o.id }} - {{ o.deliveryAddress }}
          </li>
        </ul>

        <button
          v-if="task.status === 'in_progress'"
          class="mt-3 px-3 py-1 bg-green-600 text-white rounded"
          @click="completeTask(task)"
        >
          Phân công 
        </button>
      </div>

    </main>
  </div>
</template>
