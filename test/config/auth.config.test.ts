import { Value } from '@sinclair/typebox/value'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from 'bun:test'
import type { LogFn } from 'pino'
import { authConfig } from '~/config/auth.config'

describe('Auth Config', () => {
  let warnLog: Mock<LogFn>

  beforeEach(() => {
    warnLog = spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnLog.mockRestore()
  })

  it('should have a default AUTH_SECRET', () => {
    const config = Value.Parse(authConfig, {})

    expect(config.AUTH_SECRET).toBe('secret')
    expect(config.TRUSTED_ORIGINS).toEqual(['*'])
  })

  it('should parse TRUSTED_ORIGINS from a comma-separated string', () => {
    const config = Value.Parse(authConfig, {
      TRUSTED_ORIGINS: 'http://localhost:3000,https://example.com',
    })

    expect(config.TRUSTED_ORIGINS).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ])
  })

  it('should ignore empty and invalid origins', () => {
    const config = Value.Parse(authConfig, {
      TRUSTED_ORIGINS:
        'http://localhost:3000, , invalid-url, https://example.com',
    })

    expect(warnLog).toHaveBeenCalledTimes(1)

    expect(config.TRUSTED_ORIGINS).toBeArrayOfSize(2)
    expect(config.TRUSTED_ORIGINS).toEqual([
      'http://localhost:3000',
      'https://example.com',
    ])
  })

  it('should handle a mixed origin', () => {
    const config = Value.Parse(authConfig, {
      TRUSTED_ORIGINS: 'http://localhost,*,http://example.com',
    })

    expect(config.TRUSTED_ORIGINS).toEqual(['*'])
  })

  it('should handle a single origin', () => {
    const config = Value.Parse(authConfig, {
      TRUSTED_ORIGINS: 'http://localhost:3000',
    })

    expect(config.TRUSTED_ORIGINS).toEqual(['http://localhost:3000'])
  })

  it('should handle wildcard origin', () => {
    const config = Value.Parse(authConfig, {
      TRUSTED_ORIGINS: '*',
    })

    expect(config.TRUSTED_ORIGINS).toEqual(['*'])
  })
})
