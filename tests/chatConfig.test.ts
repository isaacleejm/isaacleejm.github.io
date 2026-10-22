import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { getChatConfig } from '../src/features/chat/config.ts'

describe('public chat configuration', () => {
  it('keeps the development proxy and hides an unconfigured production widget', () => {
    assert.deepEqual(getChatConfig(true), {
      enabled: true,
      apiUrl: '/api/chat',
    })
    assert.deepEqual(getChatConfig(false, '  '), {
      enabled: false,
      apiUrl: '/api/chat',
    })
  })

  it('enables a configured production widget and overrides the development URL', () => {
    const expected = {
      enabled: true,
      apiUrl: 'https://api.example.com/api/chat',
    }
    assert.deepEqual(
      getChatConfig(false, ' https://api.example.com/api/chat '),
      expected,
    )
    assert.deepEqual(getChatConfig(true, expected.apiUrl), expected)
  })

  it('allows HTTP only for loopback verification', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) {
      assert.equal(
        getChatConfig(false, `http://${host}:3001/api/chat`).enabled,
        true,
      )
    }
  })

  for (const url of [
    '/api/chat',
    'not-a-url',
    'http://api.example.com/api/chat',
    'http://192.168.1.2:3001/api/chat',
    'ftp://api.example.com/chat',
    'https://user:password@api.example.com/chat',
    'https://api.example.com/chat?key=PRIVATE_TEST_VALUE',
    'https://api.example.com/chat#fragment',
  ]) {
    it(`rejects invalid endpoint form ${url.split(':')[0]}`, () => {
      assert.throws(
        () => getChatConfig(false, url),
        (error) => {
          assert(error instanceof Error)
          assert.match(error.message, /VITE_CHAT_API_URL/)
          assert(!error.message.includes(url))
          return true
        },
      )
    })
  }
})
