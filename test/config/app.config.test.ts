import { Value } from '@sinclair/typebox/value'
import { describe, expect, it } from 'bun:test'
import { name, version } from 'package.json'
import { appConfig } from '~/config/app.config'

describe('App Config', () => {
  it('should have default values', () => {
    const config = Value.Parse(appConfig, {})
    expect(config.APP_NAME).toBe(name)
    expect(config.APP_VERSION).toBe(version)
    expect(config.APP_URL).toBe('http://localhost:3000')
    expect(config.APP_DOMAIN).toBe('localhost')
    expect(config.BASE_PATH).toBe('')
    expect(config.LOG_LEVEL as string).toBe('info')
  })

  it('should allow setting LOG_LEVEL', () => {
    const config = Value.Parse(appConfig, { LOG_LEVEL: 'debug' })
    expect(config.LOG_LEVEL as string).toBe('debug')
  })

  it('should use default LOG_LEVEL for invalid value', () => {
    expect(() => Value.Parse(appConfig, { LOG_LEVEL: 'invalid' })).toThrow()
  })
})
