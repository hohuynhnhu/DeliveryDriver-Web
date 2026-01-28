<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Mail, Lock, LogIn, ArrowRight, Package, Eye, EyeOff } from 'lucide-vue-next'

definePageMeta({
  layout: false
})

const { login, isLoading, error, clearError, user } = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: ''
})
const showPassword = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  clearError()
  
  const success = await login({
    email: form.email,
    password: form.password
  })
  
  if (success) {
    clearError()
    
    if (user.value?.role === 'admin' || user.value?.role === 'manager') {
      await router.push('/manager/dashboard')
    } else {
      await router.push('/customer')
    }
  } else {
    errorMessage.value = error.value || 'Đăng nhập thất bại. Vui lòng thử lại!'
  }
}

const goToRegister = () => {
  router.push('/customer/register')  // Thay thành đường dẫn thực tế
}

</script>

<template>
  <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đăng nhập - DeliveryDriver</title>
    </head>
    <body class="m-0 p-0">
      <div class="fixed inset-0 z-[9999] isolate
           bg-gradient-to-br from-gray-50 via-white to-purple-50/30
           flex items-start justify-center
           pt-20 pb-4 px-4 overflow-y-auto"
      >

        <!-- Decorative Background -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative w-full max-w-md">
          <!-- Logo & Welcome -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/40 mb-4">
              <Package class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Chào Mừng Trở Lại</h1>
            <p class="text-gray-600">Đăng nhập để tiếp tục sử dụng DeliveryDriver</p>
          </div>

          <!-- Login Form -->
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <!-- Error Message -->
            <div v-if="errorMessage || error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ errorMessage || error }}
              </p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
              <!-- Email Input -->
              <div>
                <label for="email" class="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    placeholder="example@email.com"
                    required
                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <!-- Password Input -->
              <div>
                <label for="password" class="block text-sm font-semibold text-gray-700 mb-2">
                  Mật Khẩu
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    v-model="form.password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye v-if="!showPassword" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                </div>
              </div>

              <!-- Remember & Forgot -->
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" class="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                  <span class="text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" class="text-purple-600 hover:text-purple-700 font-medium">
                  Quên mật khẩu?
                </a>
              </div>

              <!-- Login Button -->
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span v-if="!isLoading">Đăng Nhập</span>
                <span v-else>Đang xử lý...</span>
                <LogIn v-if="!isLoading" class="w-5 h-5" />
                <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </button>
            </form>

          

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-4 bg-white text-gray-500">hoặc</span>
              </div>
            </div>

            <!-- Social Login -->
            <div class="grid grid-cols-2 gap-3">
              <button type="button" class="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">Google</span>
              </button>
              <button type="button" class="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <svg class="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span class="text-sm font-medium text-gray-700">Facebook</span>
              </button>
            </div>
          </div>

          <!-- Register Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Chưa có tài khoản?
              <button
                @click="goToRegister"
                class="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1 group cursor-pointer bg-none border-none"
              >
                Đăng ký ngay
                <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </p>
          </div>

          <!-- Back to Home -->
          <div class="mt-4 text-center">
            <NuxtLink
              to="/"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
        
            </NuxtLink>
          </div>
        </div>
      </div>
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