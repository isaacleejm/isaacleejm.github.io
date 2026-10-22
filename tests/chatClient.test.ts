import assert from 'node:assert/strict'
import { afterEach, describe, it, mock } from 'node:test'
import {
  ChatRequestError,
  requestChatReply,
} from '../src/features/chat/chatClient.ts'
import type { ChatMessage, ChatRequest } from '../shared/chat.ts'

const question: ChatMessage = {
  role: 'user',
  content: 'Tell me about PyHelper.',
}
const reply: ChatMessage = {
  role: 'assistant',
  content: 'A backend demo reply.',
}

function request(
  history: readonly ChatMessage[] = [question],
  signal = new AbortController().signal,
) {
  return requestChatReply(history, signal)
}

function mockSuccess() {
  return mock.method(globalThis, 'fetch', async () => Response.json({ reply }))
}

function sentMessages(
  fetchMock: ReturnType<typeof mockSuccess>,
): ChatMessage[] {
  const [, options] = fetchMock.mock.calls[0].arguments
  return (JSON.parse(options?.body as string) as ChatRequest).messages
}

function abortableResponse(
  signal: AbortSignal | null | undefined,
): Promise<Response> {
  return new Promise((_resolve, reject) => {
    signal?.addEventListener(
      'abort',
      () => reject(new DOMException('Cancelled', 'AbortError')),
      { once: true },
    )
  })
}

afterEach(() => mock.restoreAll())

describe('chat API client', () => {
  it('posts role/content history to the same-origin API without UI IDs', async () => {
    const fetchMock = mockSuccess()
    const history = [{ ...question, id: 'local-key' }]
    assert.deepEqual(await request(history), reply)
    const [url, options] = fetchMock.mock.calls[0].arguments
    assert.equal(url, '/api/chat')
    assert.equal(options?.method, 'POST')
    assert.deepEqual(options?.headers, { 'Content-Type': 'application/json' })
    assert.deepEqual(sentMessages(fetchMock), [question])
    assert.equal(history[0].id, 'local-key')
  })

  it('keeps exactly 21 messages and removes only the oldest complete turns beyond that', async () => {
    const history: ChatMessage[] = Array.from({ length: 23 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${index}`,
    }))
    const fetchMock = mockSuccess()
    await request(history)
    assert.deepEqual(sentMessages(fetchMock), history.slice(2))
    assert.equal(history.length, 23)
    fetchMock.mock.resetCalls()
    await request(history.slice(2))
    assert.deepEqual(sentMessages(fetchMock), history.slice(2))
  })

  it('keeps the exact character limit and drops a complete turn when it is exceeded', async () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'u'.repeat(2000) },
      { role: 'assistant', content: 'a'.repeat(16_000) },
      { role: 'user', content: 'n'.repeat(2000) },
    ]
    const fetchMock = mockSuccess()
    await request(history)
    assert.deepEqual(sentMessages(fetchMock), history)
    fetchMock.mock.resetCalls()
    history[1] = { role: 'assistant', content: 'a'.repeat(16_001) }
    await request(history)
    assert.deepEqual(sentMessages(fetchMock), [history[2]])
    assert.equal(history.length, 3)
  })

  it('satisfies both history limits together and preserves the newest user message', async () => {
    const history: ChatMessage[] = Array.from({ length: 31 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: String(index).padEnd(2000, 'x'),
    }))
    const fetchMock = mockSuccess()
    await request(history)
    const sent = sentMessages(fetchMock)
    assert.deepEqual(sent, history.slice(22))
    assert.equal(sent[0].role, 'user')
    assert.deepEqual(sent.at(-1), history.at(-1))
    assert.equal(history.length, 31)
  })

  const invalidReplies: unknown[] = [
    null,
    [],
    {},
    { reply: null },
    { reply: [] },
    { reply: { role: 'user', content: 'Wrong role' } },
    { reply: { role: 'assistant', content: 42 } },
    { reply: { role: 'assistant', content: '' } },
    { reply: { role: 'assistant', content: '   ' } },
  ]
  for (const [index, body] of invalidReplies.entries()) {
    it(`rejects invalid successful response ${index + 1}`, async () => {
      mock.method(globalThis, 'fetch', async () => Response.json(body))
      await assert.rejects(request(), {
        name: 'ChatRequestError',
        message: /invalid reply/,
      })
    })
  }

  it('rejects malformed JSON or HTML instead of rendering it', async () => {
    mock.method(
      globalThis,
      'fetch',
      async () => new Response('<html>Wrong route</html>'),
    )
    await assert.rejects(request(), {
      name: 'ChatRequestError',
      message: /invalid reply/,
    })
  })

  for (const [status, message] of [
    [400, /could not accept/],
    [413, /too large/],
    [500, /could not reply/],
    [404, /could not reply/],
  ] as const) {
    it(`shows a safe message for HTTP ${status} without exposing the response body`, async () => {
      mock.method(globalThis, 'fetch', async () =>
        Response.json(
          { error: { message: 'PRIVATE_SERVER_DETAIL' } },
          { status },
        ),
      )
      await assert.rejects(request(), (error: unknown) => {
        assert(error instanceof ChatRequestError)
        assert.match(error.message, message)
        assert.doesNotMatch(error.message, /PRIVATE_SERVER_DETAIL/)
        return true
      })
    })
  }

  it('explains network failures without exposing internal errors', async () => {
    mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('PRIVATE_NETWORK_DETAIL')
    })
    await assert.rejects(request(), {
      name: 'ChatRequestError',
      message: /Could not reach the chat server/,
    })
  })

  it('does not send a request when already cancelled', async () => {
    const fetchMock = mockSuccess()
    const controller = new AbortController()
    controller.abort()
    await assert.rejects(request([question], controller.signal), {
      name: 'AbortError',
    })
    assert.equal(fetchMock.mock.callCount(), 0)
  })

  it('propagates cancellation to the pending fetch', async () => {
    let requestSignal: AbortSignal | null | undefined
    mock.method(
      globalThis,
      'fetch',
      (_url: string | URL | Request, options?: RequestInit) => {
        requestSignal = options?.signal
        return abortableResponse(requestSignal)
      },
    )
    const controller = new AbortController()
    const pending = request([question], controller.signal)
    const rejected = assert.rejects(pending, { name: 'AbortError' })
    controller.abort()
    await rejected
    assert.equal(requestSignal?.aborted, true)
  })

  it('aborts after 30 seconds and reports a timeout', async (context) => {
    context.mock.timers.enable({ apis: ['setTimeout'] })
    let requestSignal: AbortSignal | null | undefined
    mock.method(
      globalThis,
      'fetch',
      (_url: string | URL | Request, options?: RequestInit) => {
        requestSignal = options?.signal
        return abortableResponse(requestSignal)
      },
    )
    const rejected = assert.rejects(request(), {
      name: 'ChatRequestError',
      message: /took too long/,
    })
    context.mock.timers.tick(30_000)
    await rejected
    assert.equal(requestSignal?.aborted, true)
  })

  it('keeps the deadline active while reading the response body', async (context) => {
    context.mock.timers.enable({ apis: ['setTimeout'] })
    mock.method(
      globalThis,
      'fetch',
      async (_url: string | URL | Request, options?: RequestInit) =>
        ({
          ok: true,
          json: () => abortableResponse(options?.signal),
        }) as unknown as Response,
    )
    const rejected = assert.rejects(request(), {
      name: 'ChatRequestError',
      message: /took too long/,
    })
    await Promise.resolve()
    context.mock.timers.tick(30_000)
    await rejected
  })

  it('removes the deadline and abort listener after a successful reply', async (context) => {
    context.mock.timers.enable({ apis: ['setTimeout'] })
    const fetchMock = mockSuccess()
    const controller = new AbortController()
    await request([question], controller.signal)
    const signal = fetchMock.mock.calls[0].arguments[1]?.signal
    context.mock.timers.tick(30_000)
    controller.abort()
    assert.equal(signal?.aborted, false)
  })
})
