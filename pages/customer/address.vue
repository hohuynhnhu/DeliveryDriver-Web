<script setup lang="ts">
definePageMeta({
  middleware: 'customer-auth'
})

import { ref } from 'vue'

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
  <main class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-6 py-10 space-y-8">

      <!-- Title -->
      <section class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          Quản lý địa chỉ
        </h1>

        <button
          @click="showForm = !showForm"
          class="bg-glow-primary-600 hover:bg-glow-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Thêm địa chỉ
        </button>
      </section>

      <!-- Add Address Form -->
      <section v-if="showForm" class="bg-white rounded-xl shadow-sm p-6 space-y-4">

        <h2 class="text-lg font-semibold text-gray-900">
          Địa chỉ mới
        </h2>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Tên địa chỉ</label>
          <input
            v-model="newAddress.name"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="Nhà / Công ty"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Địa chỉ chi tiết</label>
          <input
            v-model="newAddress.detail"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="Số nhà, đường, quận, thành phố"
          />
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">Số điện thoại</label>
          <input
            v-model="newAddress.phone"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="0909 xxx xxx"
          />
        </div>

        <div class="flex gap-3">
          <button
            @click="addAddress"
            class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Lưu
          </button>
          <button
            @click="showForm = false"
            class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm"
          >
            Huỷ
          </button>
        </div>
      </section>

      <!-- Address List -->
      <section class="space-y-4">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          class="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start"
        >
          <div>
            <h3 class="font-semibold text-gray-900">
              {{ addr.name }}
              <span v-if="addr.isDefault" class="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Mặc định
              </span>
            </h3>
            <p class="text-sm text-gray-600 mt-1">
              {{ addr.detail }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              SĐT: {{ addr.phone }}
            </p>
          </div>

          <button
            @click="removeAddress(addr.id)"
            class="text-red-500 text-sm hover:underline"
          >
            Xoá
          </button>
        </div>
      </section>

    </div>
  </main>
</template>
