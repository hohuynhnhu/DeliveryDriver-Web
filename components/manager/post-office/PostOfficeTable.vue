<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Phone, Mail, Clock, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-vue-next'
import type { PostOffice } from '@/@type/postOffice'

const props = defineProps<{
  offices: PostOffice[]
  loading?: boolean
}>()

const emit = defineEmits<{
  activate: [id: string]
  deactivate: [id: string]
  edit: [office: PostOffice]
  delete: [id: string]
}>()

// ============================================================================
// STATE
// ============================================================================
const searchQuery = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')

// ============================================================================
// COMPUTED
// ============================================================================
const filteredOffices = computed(() => {
  let result = props.offices

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(office => 
      office.name.toLowerCase().includes(query) ||
      office.code.toLowerCase().includes(query) ||
      office.address.toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    result = result.filter(office => office.status === statusFilter.value)
  }

  return result
})

const stats = computed(() => ({
  total: props.offices.length,
  active: props.offices.filter(o => o.status === 'active').length,
  inactive: props.offices.filter(o => o.status === 'inactive').length
}))

// ============================================================================
// METHODS
// ============================================================================
const getStatusColor = (status: string) => {
  return status === 'active' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  return status === 'active' ? 'Hoạt động' : 'Ngưng hoạt động'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <!-- Header -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Stats -->
        <div class="flex gap-6">
          <div>
            <p class="text-sm text-gray-500">Tổng số</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Hoạt động</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.active }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Ngưng</p>
            <p class="text-2xl font-bold text-gray-600">{{ stats.inactive }}</p>
          </div>
        </div>

        <!-- Search & Filter -->
        <div class="flex gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Tìm kiếm bưu cục..."
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 focus:border-transparent"
          />
          <select
            v-model="statusFilter"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
          >
            <option value="all">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mã</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tên bưu cục</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Địa chỉ</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Liên hệ</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Giờ mở cửa</th>
            <th class="text-left py-3 px-4 text-sm font-semibold text-gray-700">Trạng thái</th>
            <th class="text-right py-3 px-4 text-sm font-semibold text-gray-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <!-- Loading State -->
          <tr v-if="loading">
            <td colspan="7" class="text-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-glow-primary-500 mx-auto"></div>
              <p class="text-gray-500 mt-2">Đang tải...</p>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="filteredOffices.length === 0">
            <td colspan="7" class="text-center py-12">
              <MapPin class="w-16 h-16 mx-auto mb-4 opacity-30 text-gray-400" />
              <p class="text-gray-500">Không tìm thấy bưu cục nào</p>
            </td>
          </tr>

          <!-- Data Rows -->
          <tr 
            v-else
            v-for="office in filteredOffices" 
            :key="office.id"
            class="border-b border-gray-100 hover:bg-glow-primary-50/30 transition-colors"
          >
            <!-- Code -->
            <td class="py-4 px-4">
              <span class="text-sm font-medium text-gray-900">{{ office.code }}</span>
            </td>

            <!-- Name & Location -->
            <td class="py-4 px-4">
              <div>
                <p class="font-semibold text-gray-900">{{ office.name }}</p>
                <p class="text-sm text-gray-500">{{ office.province }}</p>
              </div>
            </td>

            <!-- Address -->
            <td class="py-4 px-4">
              <div class="flex items-start gap-2">
                <MapPin class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p class="text-sm text-gray-700">{{ office.address }}</p>
              </div>
            </td>

            <!-- Contact -->
            <td class="py-4 px-4">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <Phone class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-700">{{ office.phone }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <Mail class="w-4 h-4 text-gray-400" />
                  <span class="text-sm text-gray-700">{{ office.email }}</span>
                </div>
              </div>
            </td>

            <!-- Working Hours -->
            <td class="py-4 px-4">
              <div class="flex items-center gap-2">
                <Clock class="w-4 h-4 text-gray-400" />
                <span class="text-sm text-gray-700">
                  {{ office.open_time }} - {{ office.close_time }}
                </span>
              </div>
            </td>

            <!-- Status -->
            <td class="py-4 px-4">
              <span 
                class="px-3 py-1 text-xs font-semibold rounded-full"
                :class="getStatusColor(office.status)"
              >
                {{ getStatusLabel(office.status) }}
              </span>
            </td>

            <!-- Actions -->
            <td class="py-4 px-4">
              <div class="flex items-center justify-end gap-2">
                <!-- Activate/Deactivate -->
                <button
                  v-if="office.status === 'inactive'"
                  @click="emit('activate', office.id)"
                  class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Kích hoạt"
                >
                  <CheckCircle2 class="w-4 h-4" />
                </button>
                <button
                  v-else
                  @click="emit('deactivate', office.id)"
                  class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                  title="Vô hiệu hóa"
                >
                  <XCircle class="w-4 h-4" />
                </button>

                <!-- Edit -->
                <button
                  @click="emit('edit', office)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>