<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, X, CheckCircle, AlertCircle } from 'lucide-vue-next'
import type { PostOffice } from '@/@type/postOffice'
import PostOfficeTable from '@/components/manager/post-office/PostOfficeTable.vue'
import PostOfficeForm from '@/components/manager/post-office/PostOfficeForm.vue'

definePageMeta({
  layout: 'manager', 
})

// ============================================================================
// COMPOSABLES
// ============================================================================
const { 
  postOffices,
  isLoading,
  error,
  getAllPostOffices,
  createPostOffice,
  activatePostOffice,
  deactivatePostOffice,
  clearError
} = usePostOffice()

// ============================================================================
// TOAST STATE (thay thế useToast)
// ============================================================================
const toast = ref<{
  show: boolean
  title: string
  message: string
  type: 'success' | 'error' | 'warning'
}>({
  show: false,
  title: '',
  message: '',
  type: 'success'
})

const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  toast.value = { show: true, title, message, type }
  
  // Tự động ẩn sau 3 giây
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ============================================================================
// STATE
// ============================================================================
const showForm = ref(false)
const editingOffice = ref<PostOffice | null>(null)
const formLoading = ref(false)

// ============================================================================
// METHODS
// ============================================================================
const loadData = async () => {
  try {
    await getAllPostOffices()
    console.log('✅ Loaded', postOffices.value.length, 'post offices')
  } catch (e) {
    console.error('❌ Error loading post offices:', e)
  }
}

const handleCreate = () => {
  editingOffice.value = null
  showForm.value = true
}

const handleEdit = (office: PostOffice) => {
  editingOffice.value = office
  showForm.value = true
}

const handleSubmit = async (data: Partial<PostOffice>) => {
  formLoading.value = true
  
  try {
    if (editingOffice.value) {
      showToast('Thông báo', 'Chức năng cập nhật đang được phát triển', 'warning')
    } else {
      const result = await createPostOffice(data)
      
      if (result) {
        showToast('Thành công', 'Tạo bưu cục thành công!', 'success')
        showForm.value = false
        await loadData()
      } else {
        showToast('Lỗi', error.value || 'Không thể tạo bưu cục', 'error')
      }
    }
  } catch (e: any) {
    showToast('Lỗi', e.message || 'Đã xảy ra lỗi', 'error')
  } finally {
    formLoading.value = false
  }
}

const handleActivate = async (id: string) => {
  if (!confirm('Bạn có chắc muốn kích hoạt bưu cục này?')) return
  
  try {
    const success = await activatePostOffice(id)
    
    if (success) {
      showToast('Thành công', 'Kích hoạt bưu cục thành công!', 'success')
      await loadData()
    } else {
      showToast('Lỗi', error.value || 'Không thể kích hoạt bưu cục', 'error')
    }
  } catch (e: any) {
    showToast('Lỗi', e.message || 'Đã xảy ra lỗi', 'error')
  }
}

const handleDeactivate = async (id: string) => {
  if (!confirm('Bạn có chắc muốn vô hiệu hóa bưu cục này?')) return
  
  try {
    const success = await deactivatePostOffice(id)
    
    if (success) {
      showToast('Thành công', 'Vô hiệu hóa bưu cục thành công!', 'success')
      await loadData()
    } else {
      showToast('Lỗi', error.value || 'Không thể vô hiệu hóa bưu cục', 'error')
    }
  } catch (e: any) {
    showToast('Lỗi', e.message || 'Đã xảy ra lỗi', 'error')
  }
}

const handleCloseForm = () => {
  showForm.value = false
  editingOffice.value = null
  clearError()
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">
    
    <!-- Toast Notification -->
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform translate-x-full opacity-0"
      enter-to-class="transform translate-x-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-x-0 opacity-100"
      leave-to-class="transform translate-x-full opacity-0"
    >
      <div
        v-if="toast.show"
        class="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div
          class="p-4 rounded-lg shadow-lg border flex items-start gap-3"
          :class="{
            'bg-green-50 border-green-200': toast.type === 'success',
            'bg-red-50 border-red-200': toast.type === 'error',
            'bg-yellow-50 border-yellow-200': toast.type === 'warning'
          }"
        >
          <!-- Icon -->
          <div class="flex-shrink-0">
            <CheckCircle
              v-if="toast.type === 'success'"
              class="w-5 h-5 text-green-500"
            />
            <AlertCircle
              v-else-if="toast.type === 'error'"
              class="w-5 h-5 text-red-500"
            />
            <AlertCircle
              v-else
              class="w-5 h-5 text-yellow-500"
            />
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <p
              class="font-semibold text-sm"
              :class="{
                'text-green-800': toast.type === 'success',
                'text-red-800': toast.type === 'error',
                'text-yellow-800': toast.type === 'warning'
              }"
            >
              {{ toast.title }}
            </p>
            <p
              class="text-sm mt-1"
              :class="{
                'text-green-700': toast.type === 'success',
                'text-red-700': toast.type === 'error',
                'text-yellow-700': toast.type === 'warning'
              }"
            >
              {{ toast.message }}
            </p>
          </div>
          
          <!-- Close button -->
          <button
            @click="toast.show = false"
            class="flex-shrink-0 p-1 rounded hover:bg-black/5"
          >
            <X class="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </Transition>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Quản lý Bưu cục</h1>
          <p class="text-gray-500 text-sm mt-1">Danh sách và quản lý các bưu cục</p>
        </div>
        
        <button
          @click="handleCreate"
          class="flex items-center gap-2 px-4 py-2 bg-glow-primary-600 text-white rounded-lg hover:bg-glow-primary-700 transition-colors"
        >
          <Plus class="w-5 h-5" />
          Tạo bưu cục mới
        </button>
      </div>

      <!-- Error Alert -->
      <div
        v-if="error"
        class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between"
      >
        <p class="text-red-700 text-sm">⚠️ {{ error }}</p>
        <button
          @click="clearError"
          class="text-red-700 hover:text-red-900"
        >
          ✕
        </button>
      </div>

      <!-- Table -->
      <PostOfficeTable
        :offices="postOffices"
        :loading="isLoading"
        @activate="handleActivate"
        @deactivate="handleDeactivate"
        @edit="handleEdit"
      />

      <!-- Form Modal -->
      <PostOfficeForm
        :show="showForm"
        :office="editingOffice"
        :loading="formLoading"
        @close="handleCloseForm"
        @submit="handleSubmit"
      />
    </main>
  </div>
</template>