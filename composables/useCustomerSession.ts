export const useCustomerSession = () => {
  const user = useState<any>('customer_user', () => null)

  const login = (userData: any) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
    navigateTo('/login')
  }

  return {
    user,
    login,
    logout
  }
}
