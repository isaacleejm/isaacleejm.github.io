import assert from 'node:assert/strict'
import { once } from 'node:events'
import { describe, it } from 'node:test'
import { createApp } from './app.ts'
import { readServerConfig } from './config.ts'
import type { ChatAppOptions } from './traffic.ts'
import type { ChatErrorResponse } from '../shared/chat.ts'

const origin = 'https://isaacleejm.github.io'
const body = JSON.stringify({
  messages: [{ role: 'user', content: 'A synthetic test question.' }],
})

describe('server hosting configuration', () => {
  it('defaults to loopback development with no proxy trust or CORS allowlist', () => {
    assert.deepEqual(readServerConfig({}), {
      production: false,
      host: '127.0.0.1',
      port: 3001,
      allowedOrigins: [],
      trustProxyHops: 0,
    })
  })

  it('uses production defaults and explicitly provided host, port and proxy settings', () => {
    assert.deepEqual(
      readServerConfig({
        NODE_ENV: 'production',
        CHAT_ALLOWED_ORIGINS: origin,
      }),
      {
        production: true,
        host: '0.0.0.0',
        port: 3001,
        allowedOrigins: [origin],
        trustProxyHops: 0,
      },
    )
    assert.deepEqual(
      readServerConfig({
        NODE_ENV: 'production',
        HOST: ' 127.0.0.1 ',
        PORT: ' 8080 ',
        CHAT_ALLOWED_ORIGINS: `${origin}, http://localhost:5176,${origin}`,
        TRUST_PROXY_HOPS: '1',
      }),
      {
        production: true,
        host: '127.0.0.1',
        port: 8080,
        allowedOrigins: [origin, 'http://localhost:5176'],
        trustProxyHops: 1,
      },
    )
  })

  const invalid: [string, string][] = [
    ['NODE_ENV', 'prod'],
    ['HOST', 'https://PRIVATE_TEST_VALUE'],
    ['PORT', '0'],
    ['PORT', '65536'],
    ['PORT', '1.5'],
    ['PORT', '3e3'],
    ['TRUST_PROXY_HOPS', '-1'],
    ['TRUST_PROXY_HOPS', 'true'],
    ['TRUST_PROXY_HOPS', '1.5'],
    ['CHAT_ALLOWED_ORIGINS', '*'],
    ['CHAT_ALLOWED_ORIGINS', 'null'],
    ['CHAT_ALLOWED_ORIGINS', `${origin}/`],
    ['CHAT_ALLOWED_ORIGINS', `${origin}/path`],
    ['CHAT_ALLOWED_ORIGINS', `${origin},`],
    ['CHAT_ALLOWED_ORIGINS', 'https://user:PRIVATE_TEST_VALUE@example.com'],
  ]
  for (const [name, value] of invalid) {
    it(`rejects invalid ${name} without echoing its value`, () => {
      assert.throws(
        () => readServerConfig({ [name]: value }),
        (error) => {
          assert(error instanceof Error)
          assert.match(error.message, new RegExp(name))
          assert(!error.message.includes('PRIVATE_TEST_VALUE'))
          return true
        },
      )
    })
  }

  it('requires an explicit production origin allowlist', () => {
    assert.throws(
      () => readServerConfig({ NODE_ENV: 'production' }),
      /CHAT_ALLOWED_ORIGINS/,
    )
    assert.throws(
      () => createApp(async () => 'Unused', { production: true }),
      /CHAT_ALLOWED_ORIGINS/,
    )
  })
})

async function start(options: ChatAppOptions = {}) {
  let calls = 0
  const server = createApp(async () => {
    calls++
    return 'A fake provider reply.'
  }, options).listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert(address && typeof address !== 'string')
  const url = `http://127.0.0.1:${address.port}`
  return {
    url,
    calls: () => calls,
    post: (headers: Record<string, string> = {}) =>
      fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body,
      }),
    preflight: () =>
      fetch(`${url}/api/chat`, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      }),
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
        server.closeAllConnections()
      }),
  }
}

const production = { production: true, allowedOrigins: [origin] }

describe('chat access and production traffic limits', () => {
  it('preserves development proxy requests without opening cross-origin access', async () => {
    const api = await start()
    try {
      const response = await api.post({ Origin: 'http://192.168.1.2:5173' })
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('access-control-allow-origin'), null)
    } finally {
      await api.close()
    }
  })

  it('allows exact origins and JSON preflight without credentials or provider calls', async () => {
    const api = await start(production)
    try {
      const preflight = await api.preflight()
      assert.equal(preflight.status, 204)
      assert.equal(preflight.headers.get('access-control-allow-origin'), origin)
      assert.equal(
        preflight.headers.get('access-control-allow-methods'),
        'POST',
      )
      assert.match(
        preflight.headers.get('access-control-allow-headers') ?? '',
        /content-type/i,
      )
      assert.equal(
        preflight.headers.get('access-control-allow-credentials'),
        null,
      )
      assert.match(preflight.headers.get('vary') ?? '', /Origin/)
      assert.equal(api.calls(), 0)
      const response = await api.post({ Origin: origin })
      assert.equal(response.status, 200)
      assert.equal(response.headers.get('access-control-allow-origin'), origin)
    } finally {
      await api.close()
    }
  })

  it('rejects disallowed origins before calling the provider', async () => {
    const api = await start(production)
    try {
      for (const badOrigin of [
        'https://isaacleejm.github.io.evil.example',
        'https://unlisted.example',
        'null',
      ]) {
        const response = await api.post({ Origin: badOrigin })
        assert.equal(response.status, 403)
        assert.equal(
          ((await response.json()) as ChatErrorResponse).error.code,
          'ORIGIN_NOT_ALLOWED',
        )
        assert.equal(response.headers.get('access-control-allow-origin'), null)
      }
      assert.equal(api.calls(), 0)
    } finally {
      await api.close()
    }
  })

  it('permits command-line requests without Origin', async () => {
    const api = await start(production)
    try {
      assert.equal((await api.post()).status, 200)
    } finally {
      await api.close()
    }
  })

  it('limits each IP to 10 attempts, with readable retry headers and no health/preflight charges', async () => {
    const api = await start(production)
    try {
      for (let index = 0; index < 3; index++) {
        assert.equal((await api.preflight()).status, 204)
        assert.equal((await fetch(`${api.url}/api/health`)).status, 200)
      }
      for (let index = 0; index < 10; index++)
        assert.equal((await api.post({ Origin: origin })).status, 200)
      const limited = await api.post({ Origin: origin })
      assert.equal(limited.status, 429)
      assert.equal(
        ((await limited.json()) as ChatErrorResponse).error.code,
        'RATE_LIMITED',
      )
      assert(Number(limited.headers.get('retry-after')) > 0)
      assert.match(limited.headers.get('ratelimit') ?? '', /chat-ip/)
      assert.equal(limited.headers.get('access-control-allow-origin'), origin)
      assert.match(
        limited.headers.get('access-control-expose-headers') ?? '',
        /Retry-After/,
      )
      assert.equal(api.calls(), 10)
      assert.equal((await fetch(`${api.url}/api/health`)).status, 200)
      assert.equal((await api.preflight()).status, 204)
    } finally {
      await api.close()
    }
  })

  it('limits the process to 60 admitted attempts across different IPs', async () => {
    const api = await start({ ...production, trustProxyHops: 1 })
    try {
      for (let index = 1; index <= 60; index++)
        assert.equal(
          (await api.post({ 'X-Forwarded-For': `203.0.113.${index}` })).status,
          200,
        )
      const limited = await api.post({ 'X-Forwarded-For': '203.0.113.61' })
      assert.equal(limited.status, 429)
      assert.equal(
        ((await limited.json()) as ChatErrorResponse).error.code,
        'RATE_LIMITED',
      )
      assert.equal(api.calls(), 60)
    } finally {
      await api.close()
    }
  })

  it('resets limits after the window', async (context) => {
    context.mock.timers.enable({ apis: ['Date'], now: Date.now() })
    const api = await start({
      ...production,
      rateLimits: { windowMs: 1000, perIp: 1, global: 1 },
    })
    try {
      assert.equal((await api.post()).status, 200)
      assert.equal((await api.post()).status, 429)
      context.mock.timers.tick(1001)
      assert.equal((await api.post()).status, 200)
      assert.equal(api.calls(), 2)
    } finally {
      await api.close()
    }
  })

  it('ignores spoofed forwarded IPs unless proxy trust is explicitly enabled', async (context) => {
    context.mock.method(console, 'error', () => {}) // Expected library warning for an untrusted forwarding header.
    const api = await start({
      ...production,
      rateLimits: { windowMs: 600_000, perIp: 1, global: 10 },
    })
    try {
      assert.equal(
        (await api.post({ 'X-Forwarded-For': '203.0.113.1' })).status,
        200,
      )
      assert.equal(
        (await api.post({ 'X-Forwarded-For': '203.0.113.2' })).status,
        429,
      )
      assert.equal(api.calls(), 1)
    } finally {
      await api.close()
    }
  })

  it('uses separate client limits behind an explicitly trusted proxy', async () => {
    const api = await start({
      ...production,
      trustProxyHops: 1,
      rateLimits: { windowMs: 600_000, perIp: 1, global: 10 },
    })
    try {
      assert.equal(
        (await api.post({ 'X-Forwarded-For': '203.0.113.1' })).status,
        200,
      )
      assert.equal(
        (await api.post({ 'X-Forwarded-For': '203.0.113.2' })).status,
        200,
      )
      assert.equal(
        (await api.post({ 'X-Forwarded-For': '203.0.113.1' })).status,
        429,
      )
      assert.equal(api.calls(), 2)
    } finally {
      await api.close()
    }
  })
})
