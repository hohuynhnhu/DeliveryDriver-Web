<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="px-6">
      <div class="flex justify-between items-center h-16">

        <!-- Logo -->
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-glow-primary-500 to-glow-primary-600
                   rounded-xl flex items-center justify-center shadow-lg shadow-glow-primary-500/30"
          >
            <Package class="w-6 h-6 text-white" />
          </div>
          <h1
            class="text-xl font-bold bg-gradient-to-r from-glow-primary-600
                   to-glow-primary-500 bg-clip-text text-transparent"
          >
            Admin
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:block">
          <ul class="flex items-center gap-1">
            <li v-for="item in menu" :key="item.key">
              <NuxtLink
                :to="item.to"
                :class="navClass(item.key)"
              >
                <component :is="item.icon" class="w-4 h-4 mr-2" />
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <!-- User -->
        <div class="flex items-center gap-4">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-semibold text-gray-900">{{ user?.full_name }}</p>
            <p class="text-xs text-gray-500">{{ user?.email }}</p>
          </div>

          <button
            @click="handleLogout"
            class="px-4 py-2 text-sm font-medium text-white
                   bg-gradient-to-r from-glow-primary-500 to-glow-primary-600
                   rounded-lg hover:shadow-lg hover:shadow-glow-primary-500/30
                   transition-all flex items-center gap-2"
          >
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- Page content -->
  <main class="p-6">
    <slot />
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Package, UserCheck, Activity, Zap, LogOut } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { user, logout } = useAuth()

const handleLogout = async () => {
  await logout()
}

/* Menu config */
const menu = [
  { key: 'trangchu', label: 'Trang Chủ', to: '/manager/dashboard', icon: Home },
  { key: 'xuly', label: 'Xử lý đơn hàng', to: '/manager/orders/1', icon: Package },
  { key: 'phancong', label: 'Phân Công Đơn', to: '/manager/orders/assign', icon: UserCheck },
  { key: 'theodoi', label: 'Theo Dõi Trạng Thái', to: '/manager/orders', icon: Activity },
  { key: 'dotxuat', label: 'Xử Lý Đột Xuất', to: '/manager/orders/emergency', icon: Zap }
]

/* Active section */
const activeSection = computed(() => {
  const path = route.path
  if (path.startsWith('/manager/orders/assign')) return 'phancong'
  if (path.startsWith('/manager/orders/emergency')) return 'dotxuat'
  if (path === '/manager/orders') return 'theodoi'
  if (path.startsWith('/manager/orders/')) return 'xuly'
  return 'trangchu'
})

const navClass = (key) => [
  'px-4 py-2 rounded-lg font-medium text-sm transition-all inline-flex items-center',
  activeSection.value === key
    ? 'bg-glow-primary-500 text-white shadow-lg shadow-glow-primary-500/30'
    : 'text-gray-600 hover:bg-glow-primary-50 hover:text-glow-primary-600'
]
</script>
