<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Package } from 'lucide-vue-next'

definePageMeta({
  layout: 'manager'
});

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
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">
    <!-- CONTENT -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <!-- DANH SÁCH ĐƠN -->
        <aside class="lg:col-span-4">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-900 mb-4">Đơn hàng khẩn cấp</h2>

            <div v-if="orders.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <Package class="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p class="text-gray-500">Không có đơn hàng</p>
            </div>

            <ul v-else class="space-y-1">
              <li
                v-for="order in orders"
                :key="order.id"
                @click="selectedOrder = order"
                class="p-2 rounded-lg cursor-pointer border-2 transition-all hover:shadow-md"
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

            <!-- Action Buttons -->
            <div class="mt-6 flex gap-3">
              <button
                class="flex-1 px-4 py-3 bg-gradient-to-r from-glow-primary-500 to-glow-primary-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-glow-primary-500/30 transition-all"
              >
                Xử lý ngay
              </button>
              <button
                class="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/30 transition-all"
              >
                Hủy đơn
              </button>
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