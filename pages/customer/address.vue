<script setup lang="ts">
import { ref } from 'vue'
import { Plus, MapPin, Phone, Trash2 } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const addresses = ref([
  {
    id: 1,
    name: 'Nhà riêng',
    detail: '123 Nguyễn Văn A, P.5, Q.3, TP.HCM',
    phone: '0909 000 111',
    isDefault: true
  },
  {
    id: 2,
    name: 'Công ty',
    detail: '456 Lê Lợi, Q.1, TP.HCM',
    phone: '0909 222 333',
    isDefault: false
  }
])

const showForm = ref(false)

const newAddress = ref({
  name: '',
  detail: '',
  phone: ''
})

const addAddress = () => {
  if (!newAddress.value.name || !newAddress.value.detail || !newAddress.value.phone) return

  addresses.value.push({
    id: Date.now(),
    ...newAddress.value,
    isDefault: addresses.value.length === 0
  })

  newAddress.value = { name: '', detail: '', phone: '' }
  showForm.value = false
}

const removeAddress = (id: number) => {
  addresses.value = addresses.value.filter(addr => addr.id !== id)
}
</script>

<template>
  <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quản lý địa chỉ</title>
    </head>
    <body class="m-0 p-0">
      <main class="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 overflow-x-hidden">
        <div class="max-w-5xl mx-auto px-6 py-10 space-y-8">

          <!-- Header -->
          <section class="flex items-center justify-between">
            <div>
              <h1 class="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MapPin class="w-6 h-6 text-white" />
                </div>
                Quản lý địa chỉ
              </h1>
              <p class="text-gray-600 mt-2">Thêm, chỉnh sửa và quản lý các địa chỉ giao hàng của bạn</p>
            </div>

            <button
              @click="showForm = !showForm"
              class="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
            >
              <Plus class="w-5 h-5" />
              Thêm địa chỉ
            </button>
          </section>

          <!-- Add Address Form -->
          <section v-if="showForm" class="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 space-y-5">

            <h2 class="text-2xl font-bold text-gray-900">
              Thêm địa chỉ mới
            </h2>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tên địa chỉ</label>
              <input
                v-model="newAddress.name"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="VD: Nhà riêng, Công ty, Nhà bố mẹ..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Địa chỉ chi tiết</label>
              <input
                v-model="newAddress.detail"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="Số nhà, đường, quận, thành phố"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
              <input
                v-model="newAddress.phone"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                placeholder="0909 xxx xxx"
              />
            </div>

            <div class="flex gap-3 pt-4">
              <button
                @click="addAddress"
                class="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/30"
              >
                Lưu địa chỉ
              </button>
              <button
                @click="showForm = false"
                class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Huỷ
              </button>
            </div>
          </section>

          <!-- Address List -->
          <section class="space-y-4">
            <div v-if="addresses.length === 0" class="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <MapPin class="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p class="text-gray-500 font-medium">Chưa có địa chỉ nào</p>
              <p class="text-sm text-gray-400 mt-1">Hãy thêm địa chỉ đầu tiên của bạn</p>
            </div>

            <div
              v-for="addr in addresses"
              :key="addr.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-3">
                    <MapPin class="w-5 h-5 text-purple-600" />
                    <h3 class="text-lg font-bold text-gray-900">
                      {{ addr.name }}
                    </h3>
                    <span v-if="addr.isDefault" class="ml-2 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      Mặc định
                    </span>
                  </div>
                  <p class="text-gray-700 font-medium mb-2">
                    {{ addr.detail }}
                  </p>
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <Phone class="w-4 h-4" />
                    {{ addr.phone }}
                  </div>
                </div>

                <button
                  @click="removeAddress(addr.id)"
                  class="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Xoá địa chỉ"
                >
                  <Trash2 class="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </body>
  </html>
</template>

<style scoped>
body {
  margin: 0;
  padding: 0;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>