export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useCustomerSession()

  // Nếu chưa đăng nhập
  if (!user.value) {
    return navigateTo('/login')
  }
})
