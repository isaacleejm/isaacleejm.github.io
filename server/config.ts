export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'

export interface GeminiConfig {
  apiKey: string
  model: string
}

export interface ServerConfig {
  production: boolean
  host: string
  port: number
  allowedOrigins: string[]
  trustProxyHops: number
}

function integerSetting(
  environment: Record<string, string | undefined>,
  name: string,
  fallback: number,
  minimum: number,
  maximum: number,
) {
  const value = environment[name]?.trim()
  if (!value) return fallback
  const number = Number(value)
  if (
    !/^\d+$/.test(value) ||
    !Number.isSafeInteger(number) ||
    number < minimum ||
    number > maximum
  ) {
    throw new Error(`Invalid ${name} configuration.`)
  }
  return number
}

export function readServerConfig(
  environment: Record<string, string | undefined>,
): ServerConfig {
  const mode = environment.NODE_ENV?.trim() || 'development'
  if (!['development', 'test', 'production'].includes(mode))
    throw new Error('Invalid NODE_ENV configuration.')
  const production = mode === 'production'
  const host =
    environment.HOST?.trim() || (production ? '0.0.0.0' : '127.0.0.1')
  if (!/^[a-zA-Z0-9._:-]+$/.test(host))
    throw new Error('Invalid HOST configuration.')

  const origins = environment.CHAT_ALLOWED_ORIGINS?.trim()
  const allowedOrigins = origins
    ? origins.split(',').map((value) => value.trim())
    : []
  for (const origin of allowedOrigins) {
    try {
      const url = new URL(origin)
      if (!['https:', 'http:'].includes(url.protocol) || url.origin !== origin)
        throw new Error()
    } catch {
      throw new Error(
        'Invalid CHAT_ALLOWED_ORIGINS configuration. Use exact HTTP(S) origins without paths or wildcards.',
      )
    }
  }
  if (production && allowedOrigins.length === 0) {
    throw new Error('CHAT_ALLOWED_ORIGINS is required in production.')
  }

  return {
    production,
    host,
    port: integerSetting(environment, 'PORT', 3001, 1, 65535),
    allowedOrigins: [...new Set(allowedOrigins)],
    trustProxyHops: integerSetting(
      environment,
      'TRUST_PROXY_HOPS',
      0,
      0,
      Number.MAX_SAFE_INTEGER,
    ),
  }
}

// Pure parsing: only the startup entrypoint reads the real environment file.
export function readGeminiConfig(
  environment: Record<string, string | undefined>,
): GeminiConfig | undefined {
  const apiKey = environment.GEMINI_API_KEY?.trim()
  if (!apiKey) return undefined

  return {
    apiKey,
    model: environment.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  }
}
