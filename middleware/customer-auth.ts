// middleware/customer-auth.ts

export default defineNuxtRouteMiddleware((to, from) => {
  // Chỉ chạy trên client
  if (import.meta.server) return

  const { checkAuth } = useAuth()
  const isAuthenticated = checkAuth()

  // Các trang public (không cần đăng nhập)
  const publicPages = [
    '/login',
    '/register', 
    '/customer/login',
    '/customer/register',
    '/forgot-password',
    '/',  //  THÊM trang chủ vào public
  ]
  
  const isPublicPage = publicPages.includes(to.path)

  // Chưa đăng nhập + vào trang protected → redirect về login
  if (!isAuthenticated && !isPublicPage) {
    return navigateTo('/login')
  }

  // Đã đăng nhập + vào trang login/register → redirect về home
  if (isAuthenticated && isPublicPage && to.path !== '/') {
    return navigateTo('/')
  }
})