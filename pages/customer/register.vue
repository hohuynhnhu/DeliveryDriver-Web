<script setup lang="ts">
import { ref } from 'vue'

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const success = ref(false)

const handleRegister = () => {
  error.value = ''

  if (!name.value || !email.value || !password.value || !confirmPassword.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  //  MOCK đăng ký (chưa có backend)
  success.value = true

  setTimeout(() => {
    navigateTo('/login')
  }, 1500)
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
            v-model="name"
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
            v-model="email"
            type="email"
            class="w-full rounded-lg border-gray-300 focus:ring-glow-primary-500 focus:border-glow-primary-500"
            placeholder="example@email.com"
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu
          </label>
          <input
            v-model="password"
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
            v-model="confirmPassword"
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
        <p v-if="success" class="text-sm text-green-600">
          Đăng ký thành công! Đang chuyển sang trang đăng nhập...
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
