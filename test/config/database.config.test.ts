import { Value } from '@sinclair/typebox/value'
import { expect, it } from 'bun:test'
import { dbConfig } from '~/config/database.config'

it('should have default values', () => {
  const config = Value.Parse(dbConfig, { DB_NAME: 'test' })

  expect(config.DB_USER).toBe('postgres')
  expect(config.DB_PASS).toBe('secret')
  expect(config.DB_HOST).toBe('127.0.0.1')
  expect(config.DB_PORT).toBe(5432)
  expect(config.DB_NAME).toBe('test')
})

it('should coerce DB_PORT numeric string to number', () => {
  const config = Value.Parse(dbConfig, {
    DB_NAME: 'test',
    DB_PORT: '5432',
  })

  expect(config.DB_PORT).toBe(5432)
})

it('should require DB_NAME', () => {
  expect(() => Value.Parse(dbConfig, {})).toThrow()
})

it('should allow setting DB_SSL_CA_CERT', () => {
  const config = Value.Parse(dbConfig, {
    DB_NAME: 'test',
    DB_SSL_CA_CERT: 'ca.crt',
  })

  expect(config.DB_SSL_CA_CERT).toBe('ca.crt')
})
