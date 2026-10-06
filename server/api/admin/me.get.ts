export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  return {
    ok: true,
    v: '0.2.3',
    authenticated: isAdminSession(event, config.adminSessionSecret)
  }
})
