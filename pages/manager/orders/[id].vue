<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { AlertCircle, X } from 'lucide-vue-next'
import { useRoute } from 'vue-router' 
import ApproveTab from '@/components/manager/orders/tabs/ApproveTab.vue' 
import RejectTab from '@/components/manager/orders/tabs/RejectTab.vue' 
import EditTab from '@/components/manager/orders/tabs/EditTab.vue'
import { nextTick } from 'vue'

definePageMeta({
  layout: 'manager'
})
const route = useRoute()
const { 
  fetchPostOfficeOrders, 
  fetchOrderDetail,
  processOrder, 
  editOrderInfo,
  isLoading, 
  error 
} = useOrder()
const { postOfficeId, user } = useAuth()

const activeTab = ref('duyet')
const pendingOrders = ref<any[]>([])
const approveTabRef = ref()
const rejectTabRef = ref()
const editTabRef = ref()

// 1. Hàm load danh sách đơn
const loadOrders = async () => {
  // Reset error cũ
  error.value = null

  // Chặn nếu chưa có ID bưu cục
  if (!postOfficeId.value) {
    // Chỉ báo lỗi nếu user đã load xong mà vẫn không có postOfficeId
    if (user.value) { 
        error.value = 'Bạn chưa được gán bưu cục hoặc dữ liệu chưa tải xong' 
    }
    return
  }

  try {
    const [pending, confirmed] = await Promise.all([
      fetchPostOfficeOrders({ status: 'pending', limit: 50 }),
      fetchPostOfficeOrders({ status: 'confirmed', limit: 50 })
    ])

    pendingOrders.value = [
      ...(pending || []),
      ...(confirmed || [])
    ].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    console.log('Loaded orders:', pendingOrders.value.length)

    // === LOGIC MỚI: TỰ ĐỘNG CHỌN ĐƠN HÀNG DỰA TRÊN URL ===
    const currentOrderId = route.params.id as string
    if (currentOrderId && pendingOrders.value.length > 0) {
      
      // Tìm xem đơn hàng này có trong list vừa load không
      const targetOrder = pendingOrders.value.find(o => o.id === currentOrderId)
      
      if (targetOrder) {
        // Nếu có, chọn nó ngay lập tức
        await handleSelectOrder(targetOrder)
      } else {
        // Nếu không có trong list (ví dụ đơn cũ hơn limit 50), fetch riêng lẻ
        try {
            const detail = await fetchOrderDetail(currentOrderId)
            if(detail) {
                // Thêm tạm vào list để hiển thị
                pendingOrders.value.unshift(detail)
                await handleSelectOrder(detail)
            }
        } catch(err) {
            console.error("Không tìm thấy đơn hàng trong URL")
        }
      }
    }
    // =====================================================

  } catch (e) {
    console.error('Error loading orders:', e)
    error.value = 'Không thể tải danh sách đơn hàng'
  }
}

// 2. Chọn đơn hàng (giữ nguyên logic cũ nhưng tối ưu)
const handleSelectOrder = async (order: any) => {
  try {
    // Nếu order đã có đủ thông tin chi tiết thì dùng luôn, không cần fetch lại để tối ưu
    let detail = order
    
    // Nếu thiếu thông tin (ví dụ items), mới fetch lại
    if (!order.items || order.items.length === 0) {
       detail = await fetchOrderDetail(order.id)
    }
    
    if (detail) {
      await nextTick()

      const currentTabRef = getCurrentTabRef()
      if (!currentTabRef) return

      if (typeof currentTabRef.setSelectedOrder === 'function') {
        currentTabRef.setSelectedOrder(detail)
      }
    }
  } catch (e) {
    console.error('Error selecting order:', e)
    // Không alert lỗi vặt để tránh spam user
  }
}

//  Duyệt đơn - nhận đúng orderId và note
const handleApprove = async (orderId: string, note: string) => {
  const confirmed = confirm('Xác nhận duyệt đơn hàng này?')
  if (!confirmed) return

  const success = await processOrder(orderId, 'approve', note)

  if (success) {
    alert(' Đã duyệt đơn hàng thành công!')
    approveTabRef.value?.clearSelectedOrder()
    await loadOrders()
  } else {
    alert(` Duyệt đơn thất bại: ${error.value}`)
  }
}

// Từ chối đơn - nhận đúng orderId
const handleReject = async (orderId: string, reason: string, note: string) => {
  const confirmed = confirm('Xác nhận từ chối đơn hàng này?')
  if (!confirmed) return

  const success = await processOrder(orderId, 'reject', note, reason)

  if (success) {
    alert(' Đã từ chối đơn hàng!')
    rejectTabRef.value?.clearSelectedOrder()
    await loadOrders()
  } else {
    alert(` Từ chối đơn thất bại: ${error.value}`)
  }
}

// ✅ FIXED: Lưu chỉnh sửa - nhận đúng orderId
const handleSave = async (orderId: string, data: any) => {
  const confirmed = confirm('Xác nhận lưu thay đổi?')
  if (!confirmed) return

  const success = await editOrderInfo(orderId, data)

  if (success) {
    alert(' Đã lưu thay đổi thành công!')
    editTabRef.value?.clearSelectedOrder()
    await loadOrders()
  } else {
    alert(`❌ Lưu thay đổi thất bại: ${error.value}`)
  }
}

const getCurrentTabRef = () => {
  switch (activeTab.value) {
    case 'duyet': return approveTabRef.value
    case 'tuchoi': return rejectTabRef.value
    case 'chinhsua': return editTabRef.value
    default: return null
  }
}

const showTab = (tab: string) => {
  activeTab.value = tab
  getCurrentTabRef()?.clearSelectedOrder()
}


watch(() => postOfficeId.value, (newVal) => {
    if (newVal) {
        loadOrders()
    }
}, { immediate: true })
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-glow-primary-50/30">  
    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <!-- ERROR MESSAGE -->
      <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
        <button @click="error = null" class="text-red-400 hover:text-red-600">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div class="flex overflow-x-auto border-b border-gray-200">
          <button
            @click="showTab('duyet')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'duyet'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Duyệt đơn hàng
          </button>
          <button
            @click="showTab('tuchoi')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'tuchoi'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Từ chối đơn hàng
          </button>
          <button
            @click="showTab('chinhsua')"
            :class="[
              'px-6 py-3 font-medium text-sm whitespace-nowrap transition-all',
              activeTab === 'chinhsua'
                ? 'bg-glow-primary-500 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            ]"
          >
            Chỉnh sửa đơn hàng
          </button>
        </div>

        <div class="p-6">
          <ApproveTab
            v-if="activeTab === 'duyet'"
            ref="approveTabRef"
            :orders="pendingOrders"
            :is-loading="isLoading"
            @select-order="handleSelectOrder"
            @approve="handleApprove"
            @refresh="loadOrders"
          />

          <RejectTab
            v-if="activeTab === 'tuchoi'"
            ref="rejectTabRef"
            :orders="pendingOrders"
            :is-loading="isLoading"
            @select-order="handleSelectOrder"
            @reject="handleReject"
            @refresh="loadOrders"
          />

          <EditTab
            v-if="activeTab === 'chinhsua'"
            ref="editTabRef"
            :orders="pendingOrders"
            :is-loading="isLoading"
            @select-order="handleSelectOrder"
            @save="handleSave"
            @refresh="loadOrders"
          />
        </div>
      </div>
    </main>
  </div>
</template>