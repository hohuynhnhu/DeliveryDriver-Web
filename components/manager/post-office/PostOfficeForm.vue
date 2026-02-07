<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { PostOffice } from '@/@type/postOffice'

const props = defineProps<{
  show: boolean
  office?: PostOffice | null
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [data: Partial<PostOffice>]
}>()

// ============================================================================
// STATE
// ============================================================================
const form = ref<Partial<PostOffice>>({
  code: '',
  name: '',
  address: '',
  ward: '',
  district: '',
  province: '',
  area_codes: [],
  phone: '',
  email: '',
  open_time: '08:00',
  close_time: '17:00',
  working_days: 'Monday-Saturday',
  status: 'active'
})

const areaCodeInput = ref('')

// ============================================================================
// COMPUTED
// ============================================================================
const isEdit = computed(() => !!props.office)
const title = computed(() => isEdit.value ? 'Chỉnh sửa bưu cục' : 'Tạo bưu cục mới')

// ============================================================================
// METHODS
// ============================================================================
const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    area_codes: [],
    phone: '',
    email: '',
    open_time: '08:00',
    close_time: '17:00',
    working_days: 'Monday-Saturday',
    status: 'active'
  }
  areaCodeInput.value = ''
}
// ============================================================================
// WATCHERS
// ============================================================================
watch(() => props.office, (newOffice) => {
  if (newOffice) {
    form.value = { ...newOffice }
  } else {
    resetForm()
  }
}, { immediate: true })


const addAreaCode = () => {
  if (areaCodeInput.value && !form.value.area_codes?.includes(areaCodeInput.value)) {
    form.value.area_codes = [...(form.value.area_codes || []), areaCodeInput.value]
    areaCodeInput.value = ''
  }
}

const removeAreaCode = (code: string) => {
  form.value.area_codes = form.value.area_codes?.filter(c => c !== code) || []
}

const handleSubmit = () => {
  emit('submit', form.value)
}

const handleClose = () => {
  resetForm()
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="handleClose"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black/50 transition-opacity"></div>

        <!-- Modal -->
        <div class="relative min-h-screen flex items-center justify-center p-4">
          <div 
            class="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            @click.stop
          >
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 class="text-xl font-bold text-gray-900">{{ title }}</h3>
              <button
                @click="handleClose"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
              <!-- Basic Info -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Mã bưu cục <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.code"
                    type="text"
                    required
                    :disabled="isEdit"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500 disabled:bg-gray-100"
                    placeholder="VD: HCM001"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tên bưu cục <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                    placeholder="VD: Bưu cục Quận 1"
                  />
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.address"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  placeholder="Số nhà, đường..."
                />
              </div>

              <!-- Location Details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Phường/Xã <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.ward"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Quận/Huyện <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.district"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Tỉnh/Thành phố <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.province"
                    type="text"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  />
                </div>
              </div>

              <!-- Area Codes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Mã vùng phụ trách
                </label>
                <div class="flex gap-2 mb-2">
                  <input
                    v-model="areaCodeInput"
                    type="text"
                    @keyup.enter="addAreaCode"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                    placeholder="Nhập mã vùng và nhấn Enter"
                  />
                  <button
                    type="button"
                    @click="addAreaCode"
                    class="px-4 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700"
                  >
                    Thêm
                  </button>
                </div>
                <div v-if="form.area_codes && form.area_codes.length > 0" class="flex flex-wrap gap-2">
                  <span
                    v-for="code in form.area_codes"
                    :key="code"
                    class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                  >
                    {{ code }}
                    <button
                      type="button"
                      @click="removeAreaCode(code)"
                      class="hover:text-blue-900"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </span>
                </div>
              </div>

              <!-- Contact -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.email"
                    type="email"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                    placeholder="example@mail.com"
                  />
                </div>
              </div>

              <!-- Working Hours -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Giờ mở cửa <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.open_time"
                    type="time"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Giờ đóng cửa <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.close_time"
                    type="time"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ngày làm việc
                  </label>
                  <input
                    v-model="form.working_days"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-glow-primary-500"
                    placeholder="Monday-Saturday"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  @click="handleClose"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  :disabled="loading"
                  class="px-6 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {{ loading ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo mới') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>