import {
  ApiError as GeminiApiError,
  BlockedReason,
  FinishReason,
  GoogleGenAI,
  type GenerateContentParameters,
  type GenerateContentResponse,
} from '@google/genai'
import type { ReplyGenerator } from './chat.ts'
import type { GeminiConfig } from './config.ts'
import { buildSystemInstruction } from './context.ts'
import { ApiError } from './errors.ts'

export interface GeminiClient {
  models: {
    generateContent: (
      request: GenerateContentParameters,
    ) => Promise<
      Pick<GenerateContentResponse, 'text' | 'promptFeedback' | 'candidates'>
    >
  }
}

function upstreamError() {
  return new ApiError(
    502,
    'UPSTREAM_ERROR',
    'The assistant could not generate a reply. Try again.',
  )
}

function timeoutError() {
  return new ApiError(
    504,
    'UPSTREAM_TIMEOUT',
    'The assistant took too long to reply. Try again.',
  )
}

export function createGeminiReplyGenerator(
  config: GeminiConfig | undefined,
  client?: GeminiClient,
): ReplyGenerator {
  if (!config) {
    return async () => {
      throw new ApiError(
        503,
        'CHAT_UNAVAILABLE',
        'The assistant is not configured yet.',
      )
    }
  }

  const ai =
    client ?? new GoogleGenAI({ apiKey: config.apiKey, vertexai: false })
  const systemInstruction = buildSystemInstruction()

  return async (messages) => {
    const controller = new AbortController()
    let timedOut = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const deadline = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => {
        timedOut = true
        controller.abort()
        reject(timeoutError())
      }, 20_000)
    })

    try {
      const response = await Promise.race([
        ai.models.generateContent({
          model: config.model,
          contents: messages.map(({ role, content }) => ({
            role: role === 'assistant' ? 'model' : 'user',
            parts: [{ text: content }],
          })),
          config: {
            systemInstruction,
            maxOutputTokens: 1024,
            automaticContinuation: false,
            httpOptions: { timeout: 20_000, retryOptions: { attempts: 1 } },
            abortSignal: controller.signal,
          },
        }),
        deadline,
      ])

      const blockedReason = response.promptFeedback?.blockReason
      const finishReason = response.candidates?.[0]?.finishReason
      if (
        (blockedReason &&
          blockedReason !== BlockedReason.BLOCKED_REASON_UNSPECIFIED) ||
        (finishReason &&
          finishReason !== FinishReason.STOP &&
          finishReason !== FinishReason.MAX_TOKENS)
      ) {
        throw upstreamError()
      }

      const content = response.text?.trim()
      if (!content) throw upstreamError()
      return content
    } catch (error) {
      if (timedOut) throw timeoutError()
      if (error instanceof ApiError) throw error
      if (error instanceof GeminiApiError) {
        if (error.status === 429) {
          throw new ApiError(
            429,
            'RATE_LIMITED',
            'The assistant has reached its request or quota limit. Try again later.',
          )
        }
        if (error.status === 408 || error.status === 504) throw timeoutError()
      }
      throw upstreamError()
    } finally {
      clearTimeout(timer)
    }
  }
}
