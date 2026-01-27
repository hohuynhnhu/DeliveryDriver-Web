<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Mail, Lock, User as UserIcon, Phone, ArrowLeft, Eye, EyeOff, Package } from 'lucide-vue-next'

definePageMeta({
  layout: false,
})

const { register, isLoading, error, clearError } = useAuth()
const router = useRouter()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const successMessage = ref('')

const passwordsMatch = computed(() => form.password === form.confirmPassword)

const handleRegister = async () => {
  clearError()
  successMessage.value = ''

  if (!form.name || !form.email || !form.phone || !form.password || !form.confirmPassword) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (form.password !== form.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  const success = await register({
    full_name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password
  })

  if (success) {
    clearError()
    successMessage.value = 'Đăng ký thành công! Đang chuyển sang trang đăng nhập...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Đăng ký - DeliveryDriver</title>
    </head>
    <body class="m-0 p-0">
      <main class="min-h-screen w-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30 overflow-x-hidden flex items-center justify-center px-4 py-8">
        
        <!-- Decorative Background -->
        <div class="fixed inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -right-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"></div>
        </div>

        <div class="relative w-full max-w-md">
          <!-- Logo & Welcome -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-2xl shadow-purple-500/40 mb-4">
              <Package class="w-8 h-8 text-white" />
            </div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Tạo Tài Khoản Mới</h1>
            <p class="text-gray-600">Đăng ký để sử dụng dịch vụ giao hàng DeliveryDriver</p>
          </div>

          <!-- Register Form -->
          <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <!-- Error Message -->
            <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-sm text-red-600 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                {{ error }}
              </p>
            </div>

            <!-- Success Message -->
            <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-600 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                {{ successMessage }}
              </p>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-4">
              <!-- Name Input -->
              <div>
                <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    required
                    class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

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

              <!-- Phone Input -->
              <div>
                <label for="phone" class="block text-sm font-semibold text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    v-model="form.phone"
                    type="tel"
                    placeholder="0909 xxx xxx"
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

              <!-- Confirm Password Input -->
              <div>
                <label for="confirmPassword" class="block text-sm font-semibold text-gray-700 mb-2">
                  Xác Nhận Mật Khẩu
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock class="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    required
                    class="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                    :class="{ 'border-red-500': form.confirmPassword && !passwordsMatch }"
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
                    <EyeOff v-else class="w-5 h-5" />
                  </button>
                </div>
                <p v-if="form.confirmPassword && !passwordsMatch" class="text-xs text-red-600 mt-1">
                  Mật khẩu không khớp
                </p>
              </div>

              <!-- Register Button -->
              <button
                type="submit"
                :disabled="isLoading || (form.confirmPassword && !passwordsMatch)"
                class="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span v-if="!isLoading">Đăng Ký</span>
                <span v-else>Đang xử lý...</span>
              </button>
            </form>
          </div>

          <!-- Login Link -->
          <div class="mt-6 text-center">
            <p class="text-gray-600">
              Đã có tài khoản?
              <button
                @click="goToLogin"
                class="text-purple-600 hover:text-purple-700 font-semibold inline-flex items-center gap-1 group cursor-pointer bg-none border-none"
              >
                <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Đăng nhập
              </button>
            </p>
          </div>

          <!-- Back to Home -->
          <div class="mt-4 text-center">
            <NuxtLink
              to="/"
              class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Quay về trang chủ
            </NuxtLink>
          </div>
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