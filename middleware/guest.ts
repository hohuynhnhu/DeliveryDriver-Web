export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.server) return

  const { checkAuth } = useAuth()
  const isAuthenticated = checkAuth()

  // Đã login → redirect về home
  if (isAuthenticated) {
    return navigateTo('/')
  }
})