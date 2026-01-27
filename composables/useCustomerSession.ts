export const useCustomerSession = () => {
  const user = useState<any>('customer_user', () => {
    // Khởi tạo từ localStorage nếu có
    if (process.client) {
      const stored = localStorage.getItem('customer_user')
      return stored ? JSON.parse(stored) : null
    }
    return null
  })

  const router = useRouter()

  const login = (userData: any) => {
    user.value = userData
    
    // Lưu vào localStorage
    if (process.client) {
      localStorage.setItem('customer_user', JSON.stringify(userData))
    }
    
    console.log('✅ Logged in:', user.value)
  }

  const logout = async () => {
    console.log('🔐 Logging out...')
    
    // Step 1: Clear user state
    user.value = null
    console.log('✅ User cleared')
    
    // Step 2: Clear storage
    if (process.client) {
      localStorage.removeItem('customer_user')
      sessionStorage.removeItem('customer_user')
      console.log('✅ Storage cleared')
    }
    
    // Step 3: Navigate to login
    console.log('🔄 Navigating to /login')
    await router.push('/login')
    console.log('✅ Navigation complete')
  }

  return {
    user,
    customer: computed(() => user.value),
    login,
    logout
  }
}