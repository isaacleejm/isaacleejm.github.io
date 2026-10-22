export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite'

export interface GeminiConfig {
  apiKey: string
  model: string
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
