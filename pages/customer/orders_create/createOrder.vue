<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Package, ChevronRight, Check } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useOrder } from '@/composables/useOrder'
import { usePostOffice } from '@/composables/usePostOffice'
import type { User } from '@/@type/auth'
import OrderSteps from '@/components/order/OrderSteps.vue'
import SenderInfo from '@/components/order/SenderInfo.vue'
import ReceiverInfo from '@/components/order/ReceiverInfo.vue'
import DestinationsList from '@/components/order/DestinationsList.vue'
import DeliveryMethods from '@/components/order/DeliveryMethods.vue'
import OrderSummary from '@/components/order/OrderSummary.vue'
import type { OrderCreateDTO, GeoPoint } from '@/@type/order'

definePageMeta({
  layout: false,
})

const { user, fetchCurrentUser } = useAuth()
const { createOrder, error: orderError } = useOrder()
const { selectedPostOffice } = usePostOffice()
const router = useRouter()

const step = ref(1)
const isSubmitting = ref(false)

// Sender Info
const senderInfo = ref({
  name: '',
  phone: '',
  address: '',
  areaCode: '',
  location: null as GeoPoint | null
})

watch(user, (u) => {
  if (u && !senderInfo.value.name) {
    senderInfo.value = {
      name: u.full_name || '',
      phone: u.phone || '',
      address: u.address_detail || '',
      areaCode: u.area_code || '',
      location: u.location || null
    }
  }
}, { immediate: true })

// Receiver Info
const receiverInfo = ref({
  name: '',
  phone: '',
  address: '',
  areaCode: '',
  location: null as GeoPoint | null
})

// Destinations
const destinations = ref<Array<{
  id: number
  address: string
  areaCode: string
  location: any
  receiver: string
  phone: string
}>>([])

// Delivery Method & Notes & Post Office
const deliveryMethod = ref('')
const pickupNote = ref('')
const deliveryNote = ref('')
const postOfficeId = ref('')

onMounted(async () => {
  await fetchCurrentUser()
})

// Validation
const canGoNext = computed(() => {
  if (step.value === 1) {
    const isSenderValid = !!(senderInfo.value.name && senderInfo.value.phone && senderInfo.value.address)
    const isReceiverValid = !!(receiverInfo.value.name && receiverInfo.value.phone && receiverInfo.value.address && receiverInfo.value.areaCode)
    return isSenderValid && isReceiverValid
  }
  
  if (step.value === 2) {
    return !!deliveryMethod.value && !!postOfficeId.value 
  }
  
  return true
})

const displaySender = computed(() => {
  if (!user.value) return null
  return {
    ...user.value,
    id: user.value.id!,
    full_name: senderInfo.value.name,
    phone: senderInfo.value.phone,
    address_detail: senderInfo.value.address,
    location: senderInfo.value.location
  } as User
})

// Submit Handler
const handleSubmit = async () => {
  if (!user.value) {
    alert('Vui lòng đăng nhập')
    return
  }

  if (!postOfficeId.value) {
    alert('Vui lòng chọn bưu cục xử lý')
    return
  }

  isSubmitting.value = true

  try {
    const order_details = [
      {
        start_point: receiverInfo.value.address,
        address_detail: receiverInfo.value.address,
        area_code: receiverInfo.value.areaCode,
        location: receiverInfo.value.location || undefined,
        priority_score: 1,
        recipient_id: user.value.id,
        note: deliveryNote.value || undefined
      },
      ...destinations.value.map((dest, idx) => ({
        start_point: dest.address,
        address_detail: dest.address,
        area_code: dest.areaCode,
        location: dest.location || undefined,
        priority_score: idx + 2,
        recipient_id: user.value!.id,
        note: deliveryNote.value || undefined
      }))
    ]

    const payload: OrderCreateDTO = {
      user_id: user.value.id,
      post_office_id: postOfficeId.value, 
      pickup_point: senderInfo.value.address,
      pickup_address: senderInfo.value.address,
      pickup_area_code: senderInfo.value.areaCode,
      pickup_location: senderInfo.value.location || undefined,
      pickup_phone: senderInfo.value.phone,
      pickup_note: pickupNote.value || undefined,
      note_send: deliveryNote.value || undefined,
      order_type: deliveryMethod.value as 'pickup' | 'drop_off',
      order_details
    }

    console.log('📦 Submitting order payload:', payload)

    const result = await createOrder(payload)

    if (result) {
      alert(' Đơn hàng đã được tạo thành công!')
      router.push('/customer')
    } else {
      alert(` Tạo đơn hàng thất bại: ${orderError.value}`)
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert(' Đã xảy ra lỗi hệ thống khi tạo đơn hàng')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      
      <button 
        @click="$router.back()"
        class="fixed top-4 left-4 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow z-50 flex items-center gap-2 text-gray-700 font-medium"
      >
        <span>←</span> Quay lại
      </button>

      <div class="mb-8 mt-8 sm:mt-0">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Tạo Đơn Hàng Mới</h1>
        </div>
        <p class="text-gray-600 ml-16">Điền thông tin để tạo đơn giao hàng</p>
      </div>

      <OrderSteps :current-step="step" class="mb-6" />

      <!-- Step 1 -->
      <div v-if="step === 1" class="space-y-6">
        <SenderInfo :user="user" v-model="senderInfo" />
        <ReceiverInfo v-model="receiverInfo" />
        <DestinationsList v-model="destinations" />
        
        <button
          @click="step = 2"
          :disabled="!canGoNext"
          class="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Tiếp theo
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Step 2 -->
      <div v-if="step === 2" class="space-y-6">
        <DeliveryMethods 
          v-model="deliveryMethod"
          v-model:pickup-note="pickupNote"
          v-model:delivery-note="deliveryNote"
          v-model:post-office-id="postOfficeId"
        />
        
        <div class="flex gap-3">
          <button
            @click="step = 1"
            class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Quay lại
          </button>
          <button
            @click="step = 3"
            :disabled="!canGoNext"
            class="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-if="step === 3" class="space-y-6">
        <OrderSummary
          :sender="displaySender"
          :receiver="receiverInfo"
          :destinations="destinations"
          :delivery-method="deliveryMethod"
          :pickup-note="pickupNote"
          :delivery-note="deliveryNote"
          :post-office="selectedPostOffice"
        />
        
        <div class="flex gap-3">
          <button
            @click="step = 2"
            :disabled="isSubmitting"
            class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
          >
            Quay lại
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check class="w-5 h-5" />
            {{ isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng' }}
          </button>
        </div>
      </div>

    </div>
  </main>
</template>