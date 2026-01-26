<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

type OrderStatus =
  | 'Pending'
  | 'Approved'
  | 'Assigned'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

interface Order {
  id: number
  customer: string
  phone: string
  address: string
  status: OrderStatus
  createdAt: string
}

const router = useRouter()

/* ===== DANH SÁCH ĐƠN HÀNG ===== */
const orders = ref<Order[]>([
  {
    id: 1,
    customer: 'Nguyen Van A',
    phone: '0901234567',
    address: 'Quận 1, TP.HCM',
    status: 'Pending',
    createdAt: '09:20 22/01/2026'
  },
  {
    id: 2,
    customer: 'Tran Thi B',
    phone: '0909876543',
    address: 'Quận 3, TP.HCM',
    status: 'Assigned',
    createdAt: '09:40 22/01/2026'
  },
])

const selectedOrder = ref<Order | null>(null)

/* ===== MÀU TRẠNG THÁI ===== */
const statusColor = (status: OrderStatus) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'Approved':
      return 'bg-blue-100 text-blue-700'
    case 'Assigned':
      return 'bg-purple-100 text-purple-700'
    case 'In Progress':
      return 'bg-orange-100 text-orange-700'
    case 'Completed':
      return 'bg-green-100 text-green-700'
    case 'Cancelled':
      return 'bg-red-100 text-red-700'
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">

    <!-- HEADER -->
    <header class="bg-white border-b shadow-sm">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center gap-3">
        <button @click="router.push('/manager/dashboard')">
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <h1 class="text-xl font-bold text-gray-900">
          Quay lại
        </h1>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="max-w-6xl mx-auto px-6 py-8 grid grid-cols-12 gap-6">

      <!-- DANH SÁCH ĐƠN -->
      <aside class="col-span-4">
        <div class="bg-white rounded-xl border p-4">
          <h2 class="font-bold mb-4">Đơn hàng</h2>

          <ul class="space-y-2">
            <li
              v-for="order in orders"
              :key="order.id"
              @click="selectedOrder = order"
              class="p-3 rounded-lg cursor-pointer border hover:bg-gray-50"
              :class="selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-300' : ''"
            >
              <div class="flex justify-between items-center">
                <span class="font-medium">#{{ order.id }}</span>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  :class="statusColor(order.status)"
                >
                  {{ order.status }}
                </span>
              </div>
              <p class="text-sm text-gray-600">{{ order.customer }}</p>
            </li>
          </ul>
        </div>
      </aside>

      <!-- CHI TIẾT ĐƠN -->
      <section class="col-span-8">
        <div
          v-if="selectedOrder"
          class="bg-white rounded-xl border p-6"
        >
          <h2 class="text-lg font-bold mb-4">
            Chi tiết đơn hàng #{{ selectedOrder.id }}
          </h2>

          <div class="space-y-3">
            <p>
              <strong>Khách hàng:</strong> {{ selectedOrder.customer }}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {{ selectedOrder.phone }}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {{ selectedOrder.address }}
            </p>
            <p>
              <strong>Thời gian tạo:</strong> {{ selectedOrder.createdAt }}
            </p>
            <p>
              <strong>Thời gian giao dự kiến:</strong> {{ selectedOrder.createdAt }}
            </p>
            <p class="flex items-center gap-2">
              <strong>Trạng thái:</strong>
              <span
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="statusColor(selectedOrder.status)"
              >
                {{ selectedOrder.status }}
              </span>
            </p>
          </div>
        </div>

        <div
          v-else
          class="bg-white rounded-xl border p-6 text-gray-500 text-center"
        >
          Chọn một đơn hàng để xem chi tiết
        </div>
      </section>

    </main>
  </div>
</template>
