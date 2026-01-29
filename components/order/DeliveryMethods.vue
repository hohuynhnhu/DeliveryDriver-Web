<template>
  <div class="space-y-6">
    <!-- Post Office Selector ✅ NEW -->
    <PostOfficeSelector v-model="localPostOfficeId" />

    <!-- Delivery Methods -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-3 mb-6">
        <Truck class="w-5 h-5 text-purple-600" />
        <h2 class="text-lg font-bold text-gray-900">Chọn phương thức giao hàng</h2>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <button
          v-for="method in deliveryMethods"
          :key="method.id"
          @click="selectMethod(method.id)"
          type="button"
          :class="[
            'text-left p-6 border-2 rounded-xl transition-all',
            modelValue === method.id
              ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-500/20'
              : 'border-gray-200 hover:border-purple-300'
          ]"
        >
          <div class="flex items-start gap-4">
            <div :class="[method.bgColor, 'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0']">
              <component :is="method.icon" :class="[method.iconColor, 'w-7 h-7']" />
            </div>
            <div class="flex-1">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-bold text-gray-900 text-lg">{{ method.name }}</h3>
                <div v-if="modelValue === method.id" class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                  <Check class="w-4 h-4 text-white" />
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ method.description }}</p>
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2 text-purple-600 font-semibold">
                  <DollarSign class="w-4 h-4" />
                  {{ method.price }}
                </div>
                <div class="flex items-center gap-2 text-gray-600">
                  <Clock class="w-4 h-4" />
                  <span class="text-sm">{{ method.deliveryTime }}</span>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- Notes Section -->
      <div class="mt-6 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú khi lấy hàng
          </label>
          <textarea
            :value="pickupNote"
            @input="$emit('update:pickupNote', ($event.target as HTMLTextAreaElement).value)"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows="2"
            placeholder="Ví dụ: Gọi trước 15 phút..."
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Ghi chú cho tài xế giao hàng
          </label>
          <textarea
            :value="deliveryNote"
            @input="$emit('update:deliveryNote', ($event.target as HTMLTextAreaElement).value)"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows="2"
            placeholder="Ví dụ: Hàng dễ vỡ, nhẹ tay..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Truck, MapPin, Check, Clock, DollarSign } from 'lucide-vue-next'
import PostOfficeSelector from './PostOfficeSelector.vue'

const props = defineProps<{
  modelValue: string
  pickupNote: string
  deliveryNote: string
  postOfficeId: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:pickupNote': [value: string]
  'update:deliveryNote': [value: string]
  'update:postOfficeId': [value: string]
}>()

const localPostOfficeId = ref(props.postOfficeId)

watch(localPostOfficeId, (newVal) => {
  emit('update:postOfficeId', newVal)
})

const deliveryMethods = [
  {
    id: 'pickup',
    name: 'Lấy hàng tận nhà giao hàng tận nơi',
    price: '30.000đ - 50.000đ',
    description: 'Tài xế sẽ đến tận nhà bạn để lấy hàng',
    deliveryTime: '2-4 giờ',
    icon: MapPin,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    id: 'drop_off',
    name: 'Đến bưu cục đưa hàng',
    price: '20.000đ - 40.000đ',
    description: 'Bạn đến địa chỉ bưu cục để đưa hàng',
    deliveryTime: '1-3 giờ',
    icon: Truck,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
]

const selectMethod = (id: string) => {
  emit('update:modelValue', id)
}
</script>