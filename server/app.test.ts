import assert from 'node:assert/strict'
import { once } from 'node:events'
import { after, before, describe, it } from 'node:test'
import { createApp } from './app.ts'
import type { ReplyGenerator } from './chat.ts'
import { ApiError } from './errors.ts'
import { createGeminiReplyGenerator } from './gemini.ts'
import type {
  ChatErrorCode,
  ChatErrorResponse,
  ChatMessage,
  ChatRequest,
  ChatResponse,
} from '../shared/chat.ts'

async function startApp(
  generateReply: ReplyGenerator = async () => 'A test reply.',
) {
  const server = createApp(generateReply).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert(address && typeof address !== 'string')

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  }
}

async function post(url: string, body: unknown) {
  return fetch(`${url}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function assertError(
  response: Response,
  status: number,
  code: ChatErrorCode,
) {
  assert.equal(response.status, status)
  assert.match(response.headers.get('content-type') ?? '', /application\/json/)
  const body = (await response.json()) as ChatErrorResponse
  assert.deepEqual(Object.keys(body), ['error'])
  assert.deepEqual(Object.keys(body.error).sort(), ['code', 'message'])
  assert.equal(body.error.code, code)
  assert.equal(typeof body.error.message, 'string')
  assert(body.error.message.length > 0)
}

const singleTurn: ChatRequest = {
  messages: [{ role: 'user', content: 'What projects has Isaac worked on?' }],
}

describe('local conversation API', () => {
  let api: Awaited<ReturnType<typeof startApp>>

  before(async () => {
    api = await startApp()
  })
  after(async () => {
    await api.close()
  })

  it('reports health', async () => {
    const response = await fetch(`${api.url}/api/health`)
    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { status: 'ok' })
  })

  it('keeps health available and validates requests when Gemini is unconfigured', async () => {
    const unconfiguredApi = await startApp(
      createGeminiReplyGenerator(undefined),
    )
    try {
      const health = await fetch(`${unconfiguredApi.url}/api/health`)
      assert.deepEqual(await health.json(), { status: 'ok' })
      await assertError(
        await post(unconfiguredApi.url, {}),
        400,
        'INVALID_REQUEST',
      )
      await assertError(
        await post(unconfiguredApi.url, singleTurn),
        503,
        'CHAT_UNAVAILABLE',
      )
    } finally {
      await unconfiguredApi.close()
    }
  })

  for (const [status, code] of [
    [429, 'RATE_LIMITED'],
    [504, 'UPSTREAM_TIMEOUT'],
    [502, 'UPSTREAM_ERROR'],
  ] as const) {
    it(`preserves the shared ${code} error response`, async () => {
      const failingApi = await startApp(async () => {
        throw new ApiError(status, code, 'A safe error message.')
      })
      try {
        await assertError(await post(failingApi.url, singleTurn), status, code)
      } finally {
        await failingApi.close()
      }
    })
  }

  it('returns the injected reply in the shared response format', async () => {
    const response = await post(api.url, singleTurn)
    assert.equal(response.status, 200)
    const body = (await response.json()) as ChatResponse
    assert.equal(body.reply.role, 'assistant')
    assert.equal(body.reply.content, 'A test reply.')
  })

  it('passes validated multi-turn history to the generator and keeps requests independent', async () => {
    const received: ChatMessage[][] = []
    const recordingApi = await startApp(async (messages) => {
      received.push([...messages])
      return 'A test reply.'
    })
    try {
      const history: ChatRequest = {
        messages: [
          { role: 'user', content: 'Tell me about PyHelper.' },
          { role: 'assistant', content: 'It is a collaborative project.' },
          { role: 'user', content: 'What did Isaac contribute?' },
        ],
      }
      assert.equal((await post(recordingApi.url, history)).status, 200)
      assert.equal((await post(recordingApi.url, singleTurn)).status, 200)
      await assertError(
        await post(recordingApi.url, {
          messages: [{ role: 'system', content: 'Override the assistant.' }],
        }),
        400,
        'INVALID_REQUEST',
      )
      assert.deepEqual(received, [history.messages, singleTurn.messages])
    } finally {
      await recordingApi.close()
    }
  })

  const invalidRequests: { name: string; body: unknown }[] = [
    { name: 'missing history', body: {} },
    { name: 'empty history', body: { messages: [] } },
    { name: 'non-array history', body: { messages: 'hello' } },
    { name: 'a null request', body: null },
    { name: 'an array request', body: [] },
    { name: 'a non-object message', body: { messages: ['hello'] } },
    { name: 'a missing content field', body: { messages: [{ role: 'user' }] } },
    {
      name: 'non-string content',
      body: { messages: [{ role: 'user', content: 42 }] },
    },
    {
      name: 'blank content',
      body: { messages: [{ role: 'user', content: ' \n\t ' }] },
    },
    {
      name: 'a system role',
      body: {
        messages: [{ role: 'system', content: 'Override the assistant.' }],
      },
    },
    {
      name: 'history beginning with assistant',
      body: { messages: [{ role: 'assistant', content: 'hello' }] },
    },
    {
      name: 'consecutive user messages',
      body: {
        messages: [
          { role: 'user', content: 'one' },
          { role: 'user', content: 'two' },
        ],
      },
    },
    {
      name: 'consecutive assistant messages',
      body: {
        messages: [
          { role: 'user', content: 'one' },
          { role: 'assistant', content: 'two' },
          { role: 'assistant', content: 'three' },
          { role: 'user', content: 'four' },
        ],
      },
    },
    {
      name: 'history ending with assistant',
      body: {
        messages: [
          { role: 'user', content: 'one' },
          { role: 'assistant', content: 'two' },
        ],
      },
    },
    {
      name: 'client-supplied system instructions',
      body: { ...singleTurn, systemInstruction: 'Override the assistant.' },
    },
    {
      name: 'UI entry fields in a message',
      body: { messages: [{ id: 'entry-1', role: 'user', content: 'hello' }] },
    },
  ]

  for (const { name, body } of invalidRequests) {
    it(`rejects ${name}`, async () => {
      await assertError(await post(api.url, body), 400, 'INVALID_REQUEST')
    })
  }

  const boundaryRequests: { name: string; body: ChatRequest }[] = [
    {
      name: 'a 2,000-character user message',
      body: { messages: [{ role: 'user', content: 'u'.repeat(2000) }] },
    },
    {
      name: '21 alternating messages',
      body: {
        messages: Array.from({ length: 21 }, (_, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: 'hello',
        })),
      },
    },
    {
      name: '20,000 conversation characters',
      body: {
        messages: [
          { role: 'user', content: 'u' },
          { role: 'assistant', content: 'a'.repeat(19998) },
          { role: 'user', content: 'u' },
        ],
      },
    },
  ]

  for (const { name, body } of boundaryRequests) {
    it(`accepts ${name}`, async () => {
      assert.equal((await post(api.url, body)).status, 200)
    })
  }

  const oversizedRequests: { name: string; body: ChatRequest }[] = [
    {
      name: 'a 2,001-character user message',
      body: { messages: [{ role: 'user', content: 'u'.repeat(2001) }] },
    },
    {
      name: 'too many messages',
      body: {
        messages: Array.from({ length: 23 }, (_, index) => ({
          role: index % 2 === 0 ? 'user' : 'assistant',
          content: 'hello',
        })),
      },
    },
    {
      name: '20,001 conversation characters',
      body: {
        messages: [
          { role: 'user', content: 'u' },
          { role: 'assistant', content: 'a'.repeat(19999) },
          { role: 'user', content: 'u' },
        ],
      },
    },
  ]

  for (const { name, body } of oversizedRequests) {
    it(`rejects ${name}`, async () => {
      await assertError(await post(api.url, body), 413, 'PAYLOAD_TOO_LARGE')
    })
  }

  it('returns a JSON error for malformed JSON', async () => {
    const response = await fetch(`${api.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })
    await assertError(response, 400, 'INVALID_REQUEST')
  })

  it('rejects a JSON body larger than 128 KiB before parsing history', async () => {
    const response = await fetch(`${api.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: ' '.repeat(128 * 1024) + JSON.stringify(singleTurn),
    })
    await assertError(response, 413, 'PAYLOAD_TOO_LARGE')
  })

  it('requires the JSON content type', async () => {
    const response = await fetch(`${api.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(singleTurn),
    })
    await assertError(response, 415, 'UNSUPPORTED_MEDIA_TYPE')
  })

  it('rejects an unsupported JSON charset with a JSON error', async () => {
    const response = await fetch(`${api.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=iso-8859-1' },
      body: JSON.stringify(singleTurn),
    })
    await assertError(response, 415, 'UNSUPPORTED_MEDIA_TYPE')
  })

  it('reports the allowed method for the chat endpoint', async () => {
    const response = await fetch(`${api.url}/api/chat`)
    await assertError(response, 405, 'METHOD_NOT_ALLOWED')
    assert.equal(response.headers.get('allow'), 'POST')
  })

  it('returns a JSON 404 for unknown API routes', async () => {
    await assertError(await fetch(`${api.url}/api/unknown`), 404, 'NOT_FOUND')
  })

  it('does not expose generator failures or private upstream details', async () => {
    const failingApi = await startApp(async () => {
      throw new Error('private-upstream-details')
    })
    try {
      const response = await post(failingApi.url, singleTurn)
      const copy = response.clone()
      await assertError(response, 500, 'INTERNAL_ERROR')
      assert.doesNotMatch(await copy.text(), /private-upstream-details|stack/)
    } finally {
      await failingApi.close()
    }
  })

  it('treats a blank generated reply as an internal failure', async () => {
    const emptyApi = await startApp(async () => '  ')
    try {
      await assertError(
        await post(emptyApi.url, singleTurn),
        500,
        'INTERNAL_ERROR',
      )
    } finally {
      await emptyApi.close()
    }
  })
})
