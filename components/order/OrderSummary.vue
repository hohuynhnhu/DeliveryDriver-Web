<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">Xác nhận thông tin đơn hàng</h2>

    <div class="space-y-4">
      <!-- Post Office ✅ NEW -->
      <div v-if="postOffice" class="p-4 bg-orange-50 rounded-lg border border-orange-200">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Building class="w-4 h-4" />
          Bưu cục xử lý
        </h3>
        <p class="text-sm text-gray-700 font-medium">{{ postOffice.name }}</p>
        <p class="text-sm text-gray-600">{{ postOffice.address }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ postOffice.area_codes }} • {{ postOffice.phone }}</p>
      </div>

      <!-- Sender -->
      <div class="p-4 bg-purple-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Send class="w-4 h-4" />
          Thông tin người gửi
        </h3>
        <p class="text-sm text-gray-700">{{ sender?.full_name }} - {{ sender?.phone }}</p>
        <p class="text-sm text-gray-600">{{ sender?.address_detail }}</p>
        <p class="text-xs text-gray-500 mt-1">Vị trí: {{ formatLocation(sender?.location) }}</p>
      </div>

      <!-- Receiver -->
      <div class="p-4 bg-green-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Home class="w-4 h-4" />
          Thông tin người nhận
        </h3>
        <p class="text-sm text-gray-700">{{ receiver.name }} - {{ receiver.phone }}</p>
        <p class="text-sm text-gray-600">{{ receiver.address }}</p>
        <p class="text-xs text-gray-500 mt-1">Vị trí: {{ formatLocation(receiver.location) }}</p>
      </div>

      <!-- Destinations -->
      <div v-if="destinations.length > 0" class="p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Building2 class="w-4 h-4" />
          Điểm giao hàng bổ sung ({{ destinations.length }})
        </h3>
        <div v-for="(dest, idx) in destinations" :key="dest.id" class="mb-2 last:mb-0">
          <p class="text-sm text-gray-700 font-medium">{{ idx + 1 }}. {{ dest.receiver }} - {{ dest.phone }}</p>
          <p class="text-sm text-gray-600">{{ dest.address }}</p>
          <p class="text-xs text-gray-500">Vị trí: {{ formatLocation(dest.location) }}</p>
        </div>
      </div>

      <!-- Delivery Method -->
      <div class="p-4 bg-indigo-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Truck class="w-4 h-4" />
          Phương thức giao hàng
        </h3>
        <p class="text-sm text-gray-700">{{ selectedMethodName }}</p>
        <p class="text-xs text-gray-600 mt-1">Thời gian dự kiến: {{ selectedMethodTime }}</p>
      </div>

      <!-- Notes -->
      <div v-if="pickupNote || deliveryNote" class="p-4 bg-gray-50 rounded-lg">
        <h3 class="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <FileText class="w-4 h-4" />
          Ghi chú
        </h3>
        <p v-if="pickupNote" class="text-sm text-gray-600 mb-1">
          <span class="font-medium">Lấy hàng:</span> {{ pickupNote }}
        </p>
        <p v-if="deliveryNote" class="text-sm text-gray-600">
          <span class="font-medium">Giao hàng:</span> {{ deliveryNote }}
        </p>
      </div>

      <!-- Total Price -->
      <div class="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
        <div class="flex items-center justify-between">
          <h3 class="font-bold text-gray-900 text-lg flex items-center gap-2">
            <DollarSign class="w-5 h-5" />
            Tổng cước phí ước tính
          </h3>
          <p class="text-2xl font-bold text-purple-600">{{ estimatedPrice }}</p>
        </div>
        <p class="text-xs text-gray-600 mt-1">* Phí chính xác sẽ được tính sau khi tài xế nhận đơn</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Send, Home, Building2, Building, Truck, FileText, DollarSign } from 'lucide-vue-next'
import type { User } from '@/@type/auth'
import type { GeoPoint } from '@/@type/order'
import type { PostOffice } from '@/@type/postOffice'

interface ReceiverInfo {
  name: string
  phone: string
  address: string
  location: GeoPoint | null
}

interface Destination {
  id: number
  receiver: string
  phone: string
  address: string
  location: GeoPoint | null
}

const props = defineProps<{
  sender: User | null
  receiver: ReceiverInfo
  destinations: Destination[]
  deliveryMethod: string
  pickupNote: string
  deliveryNote: string
  postOffice: PostOffice | null
}>()

const deliveryMethodsMap: Record<string, { name: string; time: string; price: string }> = {
  pickup: {
    name: 'Lấy hàng tận nhà giao hàng tận nơi',
    time: '2-4 giờ',
    price: '30.000đ'
  },
  drop_off: {
    name: 'Đến bưu cục đưa hàng',
    time: '1-3 giờ',
    price: '20.000đ'
  }
}

const selectedMethodName = computed(() => {
  return deliveryMethodsMap[props.deliveryMethod]?.name || 'Chưa chọn'
})

const selectedMethodTime = computed(() => {
  return deliveryMethodsMap[props.deliveryMethod]?.time || ''
})

const estimatedPrice = computed(() => {
  const basePrice = deliveryMethodsMap[props.deliveryMethod]?.price || '0đ'
  
  if (props.destinations.length > 0) {
    const additionalFee = props.destinations.length * 10000
    const basePriceNum = parseInt(basePrice.replace(/\D/g, ''))
    return `${(basePriceNum + additionalFee).toLocaleString('vi-VN')}đ`
  }
  
  return basePrice
})

const formatLocation = (location: GeoPoint | null | undefined) => {
  if (!location) return 'Chưa chọn vị trí'
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}
</script>