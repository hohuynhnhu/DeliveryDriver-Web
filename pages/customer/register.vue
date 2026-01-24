<script setup lang="ts">
import { ref } from 'vue'
//middleware
definePageMeta
({
  middleware: 'customer-auth',
})
//composables
const {register,isLoading,error,clearError}= useAuth()
const router=useRouter()

//state
const form= reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const successMessage = ref('')

//computed
const passwordsMatch = computed(() => form.password === form.confirmPassword)

//methods
const handleRegister = async () => {

  if(form.password !== form.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  const success = await register({
    full_name: form.name,
    email: form.email,
    phone: form.phone,
    password: form.password
  })
  if(success) {
    clearError()
    successMessage.value = 'Đăng ký thành công! Đang chuyển sang trang đăng nhập...'
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  }
  if (!form.name || !form.email || !form.password || !form.confirmPassword) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }
}
</script>

<template>
  <main class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-sm p-8">

      <h1 class="text-2xl font-bold text-gray-900 text-center">
        Đăng ký khách hàng
      </h1>
      <p class="text-sm text-gray-500 text-center mt-2">
        Tạo tài khoản để sử dụng dịch vụ giao hàng
      </p>

      <form class="mt-6 space-y-4" @submit.prevent="handleRegister">

        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Họ và tên
          </label>
          <input
            v-model="form.name"
            type="text"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="example@email.com"
          />
        </div>
        //phone
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Số điện thoại
          </label>
          <input
            v-model="form.phone"
            type="tel"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="0123456789"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            v-model="form.password"
            type="password"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu
          </label>
          <input
            v-model="form.confirmPassword"
            type="password"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="••••••••"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-sm text-red-600">
          {{ error }}
        </p>

        <!-- Success -->
        <p v-if="successMessage" class="text-sm text-green-600">
          {{ successMessage }}
        </p>

        <!-- Submit -->
        <button
          type="submit"
          class="w-full bg-glow-primary-600 hover:bg-glow-primary-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Đăng ký
        </button>
      </form>

      <p class="text-sm text-center text-gray-500 mt-6">
        Đã có tài khoản?
        <NuxtLink to="/login" class="text-glow-primary-600 hover:underline">
          Đăng nhập
        </NuxtLink>
      </p>

    </div>
  </main>
</template>
