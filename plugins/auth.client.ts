export default defineNuxtPlugin(async () => {
  const { checkAuth, fetchCurrentUser } = useAuth()

  if (checkAuth()) {
    await fetchCurrentUser()
  }
})
