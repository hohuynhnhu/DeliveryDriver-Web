export default defineNuxtRouteMiddleware(async(to, from) => {
  // Chỉ chạy client
  if (import.meta.server) return

  const { checkAuth, user, fetchCurrentUser } = useAuth()
  const isAuthenticated = checkAuth()
  console.log('🔍 Middleware Debug:', {
    to: to.path,
    isAuthenticated,
    user: user.value,
    role: user.value?.role
  })

  // Public pages
  const publicPages = ['/login', '/register', '/forgot-password']
  const isPublicPage = publicPages.includes(to.path)

  // Chưa login mà vào trang protected
  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  if (!user.value) {
    await fetchCurrentUser()
  }

  // Đã login mà vào login/register
  if (isAuthenticated && isPublicPage) {
    const role = user.value?.role
    
    // Redirect về trang tương ứng với role
    if (role === 'admin') {
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      return navigateTo('/customer')
    }
    
    return navigateTo('/')
  }

  // ======================
  // CHECK ROLE & REDIRECT
  // ======================

  const role = user.value?.role
  if (!role) return

  // ✅ THÊM: Redirect từ homepage về trang của role
  if (to.path === '/') {
    if (role === 'admin') {
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      return navigateTo('/customer')
    }
  }

  // Map role → allowed routes
  const roleRouteMap: Record<string, string[]> = {
    admin: ['/manager'],
    customer: ['/customer']  // ❌ Bỏ '/' ra khỏi customer
  }

  const allowedPrefixes = roleRouteMap[role]
  if (!allowedPrefixes) {
    return navigateTo('/403')
  }

  const isAllowed = allowedPrefixes.some(prefix =>
    to.path.startsWith(prefix)
  )

  if (!isAllowed) {
    // Redirect về trang gốc của role
    if (role === 'admin') {
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      return navigateTo('/customer')
    }
  }
})