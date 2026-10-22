export function getChatConfig(development: boolean, configuredUrl?: string) {
  const value = configuredUrl?.trim()
  if (!value) return { enabled: development, apiUrl: '/api/chat' }

  const invalid = () =>
    new Error(
      'VITE_CHAT_API_URL must be a complete HTTPS endpoint, or HTTP on loopback, without credentials, query parameters, or a fragment.',
    )
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw invalid()
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if (
    !(url.protocol === 'https:' || (url.protocol === 'http:' && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw invalid()
  }
  return { enabled: true, apiUrl: url.href }
}
