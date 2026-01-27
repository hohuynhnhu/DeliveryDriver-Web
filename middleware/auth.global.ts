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

  // Public pages - không cần đăng nhập
  const publicPages = ['/login', '/forgot-password', '/customer/register']
  const isPublicPage = publicPages.includes(to.path)

  // Nếu vào root '/' mà chưa login → redirect /login
  if (to.path === '/' && !isAuthenticated) {
    console.log('❌ Not authenticated on root, redirecting to /login')
    return navigateTo('/login')
  }

  // Chưa login mà vào trang protected
  if (!isAuthenticated && !isPublicPage) {
    console.log('❌ Not authenticated, redirecting to /login')
    return navigateTo('/login')
  }

  if (!user.value && isAuthenticated) {
    await fetchCurrentUser()
  }

  // Sau logout, user.value = null → redirect /login (nhưng cho phép /customer/register)
  if (!user.value && !isPublicPage && !to.path.includes('/register')) {
    console.log('❌ User cleared (logout), redirecting to /login')
    return navigateTo('/login')
  }

  // Đã login mà vào login → redirect về dashboard (nhưng cho phép /customer/register)
  if (isAuthenticated && (to.path === '/login' || to.path === '/forgot-password')) {
    const role = user.value?.role
    
    if (role === 'admin' || role === 'manager') {
      console.log('✅ Admin accessing /login, redirecting to /manager/dashboard')
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      console.log('✅ Customer accessing /login, redirecting to /customer')
      return navigateTo('/customer')
    }
    
    return navigateTo('/')
  }

  // Nếu chưa login, không check role
  if (!isAuthenticated) {
    return
  }

  // ======================
  // CHECK ROLE & REDIRECT (chỉ check khi đã login)
  // ======================

  const role = user.value?.role
  if (!role) {
    console.log('⚠️ No role found')
    return
  }

  // Redirect từ homepage về trang của role
  if (to.path === '/' && isAuthenticated) {
    if (role === 'admin' || role === 'manager') {
      console.log('✅ Admin on /, redirecting to /manager/dashboard')
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      console.log('✅ Customer on /, redirecting to /customer')
      return navigateTo('/customer')
    }
  }

  // Map role → allowed routes
  const roleRouteMap: Record<string, string[]> = {
    admin: ['/manager'],
    manager: ['/manager'],
    customer: ['/customer', '/home']
  }

  const allowedPrefixes = roleRouteMap[role]
  if (!allowedPrefixes) {
    console.log('❌ No allowed routes for role:', role)
    return navigateTo('/403')
  }

  const isAllowed = allowedPrefixes.some(prefix =>
    to.path.startsWith(prefix)
  )

  if (!isAllowed) {
    console.log('❌ User role not allowed to access:', to.path)
    if (role === 'admin' || role === 'manager') {
      return navigateTo('/manager/dashboard')
    } else if (role === 'customer') {
      return navigateTo('/customer')
    }
  }
})