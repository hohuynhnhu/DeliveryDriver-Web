<script setup lang="ts">
import { Package, MapPin, Truck, FileText, Plus, X, Check, ChevronRight, Clock, DollarSign, Send, Home, Building2 } from 'lucide-vue-next'

definePageMeta({
  middleware: 'customer-auth'
})

const step = ref(1)

const orderData = ref({
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  deliveryMethod: '',
  destinations: [] as Array<{ id: number; receiver: string; phone: string; address: string }>,
  note: ''
})

const showAddDestination = ref(false)
const newDestination = ref({ address: '', receiver: '', phone: '' })

// Danh sách địa chỉ đã lưu
const savedAddresses = [
  { id: 1, name: 'Nhà riêng', detail: '123 Nguyễn Văn A, P.5, Q.3, TP.HCM', phone: '0909 000 111' },
  { id: 2, name: 'Công ty', detail: '456 Lê Lợi, Q.1, TP.HCM', phone: '0909 222 333' }
]

// Phương thức giao hàng
const deliveryMethods = [
  { 
    id: 'fixed-route', 
    name: 'Tuyến đường cố định', 
    price: '30.000đ - 50.000đ', 
    description: 'Giao hàng theo tuyến đường đã định sẵn, thời gian ổn định',
    deliveryTime: '2-4 giờ',
    iconComponent: 'MapPin',
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  { 
    id: 'flexible-route', 
    name: 'Tuyến đường tự do', 
    price: '50.000đ - 100.000đ', 
    description: 'Tài xế tự do chọn đường đi tối ưu, linh hoạt điểm đến',
    deliveryTime: '1-3 giờ',
    iconComponent: 'Truck',
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  { 
    id: 'emergency', 
    name: 'Giao hàng khẩn cấp', 
    price: '100.000đ - 200.000đ', 
    description: 'Ưu tiên cao nhất, giao hàng nhanh nhất có thể',
    deliveryTime: '30 phút - 1 giờ',
    iconComponent: 'Clock',
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  }
]

const selectSavedAddress = (address: any, type: 'sender' | 'receiver') => {
  if (type === 'sender') {
    orderData.value.senderAddress = address.detail
    orderData.value.senderPhone = address.phone
  } else {
    orderData.value.receiverAddress = address.detail
    orderData.value.receiverPhone = address.phone
  }
}

const addDestination = () => {
  if (newDestination.value.address && newDestination.value.receiver && newDestination.value.phone) {
    orderData.value.destinations.push({
      ...newDestination.value,
      id: Date.now()
    })
    newDestination.value = { address: '', receiver: '', phone: '' }
    showAddDestination.value = false
  }
}

const removeDestination = (id: number) => {
  orderData.value.destinations = orderData.value.destinations.filter(d => d.id !== id)
}

const handleSubmit = () => {
  alert('Đơn hàng đã được tạo thành công!')
  navigateTo('/customer/orders')
}

const selectedMethod = computed(() => {
  return deliveryMethods.find(m => m.id === orderData.value.deliveryMethod)
})
</script>

<template>
  <main class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Package class="w-6 h-6 text-white" />
          </div>
          <h1 class="text-3xl font-bold text-gray-900">Tạo Đơn Hàng Mới</h1>
        </div>
        <p class="text-gray-600 ml-15">Điền thông tin để tạo đơn giao hàng</p>
      </div>

      <!-- Progress Steps -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div class="flex items-center justify-between">
          <template v-for="(s, idx) in [
            { num: 1, label: 'Thông tin' },
            { num: 2, label: 'Phương thức' },
            { num: 3, label: 'Xác nhận' }
          ]" :key="s.num">
            <div class="flex flex-col items-center flex-1">
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                step >= s.num 
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                  : 'bg-gray-200 text-gray-500'
              ]">
                <Check v-if="step > s.num" class="w-5 h-5" />
                <span v-else>{{ s.num }}</span>
              </div>
              <p class="text-sm mt-2 font-medium text-gray-700">{{ s.label }}</p>
            </div>
            <div v-if="idx < 2" :class="[
              'h-1 flex-1 mx-2 rounded-full transition-all',
              step > s.num ? 'bg-purple-600' : 'bg-gray-200'
            ]" />
          </template>
        </div>
      </div>

      <!-- Step 1: Thông tin giao hàng -->
      <div v-if="step === 1" class="space-y-6">
        
        <!-- Thông tin người gửi -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-4">
            <Send class="w-5 h-5 text-purple-600" />
            <h2 class="text-lg font-bold text-gray-900">Thông tin người gửi</h2>
          </div>

          <!-- Địa chỉ đã lưu -->
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">Chọn từ địa chỉ đã lưu:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="addr in savedAddresses"
                :key="addr.id"
                @click="selectSavedAddress(addr, 'sender')"
                class="text-left p-3 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
              >
                <p class="font-semibold text-gray-900">{{ addr.name }}</p>
                <p class="text-sm text-gray-600">{{ addr.detail }}</p>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tên người gửi</label>
              <input
                v-model="orderData.senderName"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                v-model="orderData.senderPhone"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="0909 xxx xxx"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ lấy hàng</label>
              <input
                v-model="orderData.senderAddress"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Số nhà, đường, quận, thành phố"
              />
            </div>
          </div>
        </div>

        <!-- Thông tin người nhận -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-4">
            <Home class="w-5 h-5 text-green-600" />
            <h2 class="text-lg font-bold text-gray-900">Thông tin người nhận</h2>
          </div>

          <!-- Địa chỉ đã lưu -->
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">Chọn từ địa chỉ đã lưu:</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="addr in savedAddresses"
                :key="addr.id"
                @click="selectSavedAddress(addr, 'receiver')"
                class="text-left p-3 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all"
              >
                <p class="font-semibold text-gray-900">{{ addr.name }}</p>
                <p class="text-sm text-gray-600">{{ addr.detail }}</p>
              </button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tên người nhận</label>
              <input
                v-model="orderData.receiverName"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Trần Thị B"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                v-model="orderData.receiverPhone"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="0909 xxx xxx"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
              <input
                v-model="orderData.receiverAddress"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Số nhà, đường, quận, thành phố"
              />
            </div>
          </div>
        </div>

        <!-- Thêm điểm đến -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <Building2 class="w-5 h-5 text-blue-600" />
              <h2 class="text-lg font-bold text-gray-900">Điểm giao hàng bổ sung</h2>
            </div>
            <button
              @click="showAddDestination = !showAddDestination"
              class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus class="w-4 h-4" />
              Thêm điểm đến
            </button>
          </div>

          <div v-if="showAddDestination" class="bg-blue-50 rounded-lg p-4 mb-4 space-y-3">
            <input
              v-model="newDestination.receiver"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none"
              placeholder="Tên người nhận"
            />
            <input
              v-model="newDestination.phone"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none"
              placeholder="Số điện thoại"
            />
            <input
              v-model="newDestination.address"
              type="text"
              class="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none"
              placeholder="Địa chỉ giao hàng"
            />
            <div class="flex gap-3">
              <button
                @click="addDestination"
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Lưu
              </button>
              <button
                @click="showAddDestination = false"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Huỷ
              </button>
            </div>
          </div>

          <div v-if="orderData.destinations.length > 0" class="space-y-3">
            <div
              v-for="(dest, idx) in orderData.destinations"
              :key="dest.id"
              class="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <p class="font-semibold text-gray-900">Điểm {{ idx + 1 }}: {{ dest.receiver }}</p>
                <p class="text-sm text-gray-600">{{ dest.address }}</p>
                <p class="text-sm text-gray-500">SĐT: {{ dest.phone }}</p>
              </div>
              <button
                @click="removeDestination(dest.id)"
                class="text-red-500 hover:text-red-700"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Ghi chú -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-4">
            <FileText class="w-5 h-5 text-orange-600" />
            <h2 class="text-lg font-bold text-gray-900">Ghi chú cho tài xế</h2>
          </div>
          <textarea
            v-model="orderData.note"
            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            rows="4"
            placeholder="Nhập ghi chú đặc biệt cho tài xế (tùy chọn)..."
          />
        </div>

        <button
          @click="step = 2"
          class="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/30"
        >
          Tiếp theo
          <ChevronRight class="w-5 h-5" />
        </button>
      </div>

      <!-- Step 2: Chọn phương thức giao hàng -->
      <div v-if="step === 2" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center gap-3 mb-6">
            <Truck class="w-5 h-5 text-purple-600" />
            <h2 class="text-lg font-bold text-gray-900">Chọn phương thức giao hàng</h2>
          </div>

          <div class="grid grid-cols-1 gap-4">
            <button
              v-for="method in deliveryMethods"
              :key="method.id"
              @click="orderData.deliveryMethod = method.id"
              :class="[
                'text-left p-6 border-2 rounded-xl transition-all',
                orderData.deliveryMethod === method.id
                  ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-500/20'
                  : 'border-gray-200 hover:border-purple-300'
              ]"
            >
              <div class="flex items-start gap-4">
                <div :class="[method.bgColor, 'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0']">
                  <component :is="method.iconComponent" :class="[method.iconColor, 'w-7 h-7']" />
                </div>
                <div class="flex-1">
                  <div class="flex items-start justify-between mb-2">
                    <h3 class="font-bold text-gray-900 text-lg">{{ method.name }}</h3>
                    <div v-if="orderData.deliveryMethod === method.id" class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
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
        </div>

        <div class="flex gap-3">
          <button
            @click="step = 1"
            class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Quay lại
          </button>
          <button
            @click="step = 3"
            :disabled="!orderData.deliveryMethod"
            class="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-xl hover:bg-purple-700 transition-colors font-semibold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tiếp theo
            <ChevronRight class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Step 3: Xác nhận -->
      <div v-if="step === 3" class="space-y-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">Xác nhận thông tin đơn hàng</h2>

          <div class="space-y-4">
            <div class="p-4 bg-purple-50 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Thông tin người gửi</h3>
              <p class="text-sm text-gray-700">{{ orderData.senderName }} - {{ orderData.senderPhone }}</p>
              <p class="text-sm text-gray-600">{{ orderData.senderAddress }}</p>
            </div>

            <div class="p-4 bg-green-50 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Thông tin người nhận</h3>
              <p class="text-sm text-gray-700">{{ orderData.receiverName }} - {{ orderData.receiverPhone }}</p>
              <p class="text-sm text-gray-600">{{ orderData.receiverAddress }}</p>
            </div>

            <div v-if="orderData.destinations.length > 0" class="p-4 bg-blue-50 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Điểm giao hàng bổ sung ({{ orderData.destinations.length }})</h3>
              <p v-for="(dest, idx) in orderData.destinations" :key="dest.id" class="text-sm text-gray-600">
                {{ idx + 1 }}. {{ dest.receiver }} - {{ dest.address }}
              </p>
            </div>

            <div class="p-4 bg-orange-50 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Phương thức giao hàng</h3>
              <p class="text-sm text-gray-700">{{ selectedMethod?.name }}</p>
              <p class="text-xs text-gray-600 mt-1">Thời gian dự kiến: {{ selectedMethod?.deliveryTime }}</p>
            </div>

            <div v-if="orderData.note" class="p-4 bg-gray-50 rounded-lg">
              <h3 class="font-semibold text-gray-900 mb-2">Ghi chú</h3>
              <p class="text-sm text-gray-600">{{ orderData.note }}</p>
            </div>

            <div class="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border-2 border-purple-300">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-gray-900 text-lg">Tổng cước phí ước tính</h3>
                <p class="text-2xl font-bold text-purple-600">{{ selectedMethod?.price.split(' - ')[0] }}</p>
              </div>
              <p class="text-xs text-gray-600 mt-1">* Phí chính xác sẽ được tính sau khi tài xế nhận đơn</p>
            </div>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="step = 2"
            class="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold"
          >
            Quay lại
          </button>
          <button
            @click="handleSubmit"
            class="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-purple-500/30"
          >
            <Check class="w-5 h-5" />
            Xác nhận đặt hàng
          </button>
        </div>
      </div>

    </div>
  </main>
</template>