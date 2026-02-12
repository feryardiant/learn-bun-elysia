import { AssertError, Value } from '@sinclair/typebox/value'
import { expect, it } from 'bun:test'
import { mailConfig } from '~/config/mail.config'

it('should have default values', () => {
  const config = Value.Parse(mailConfig, {})

  expect(config.SMTP_HOST).toEqual('127.0.0.1')
  expect(config.SMTP_PORT).toEqual(1025)
  expect(config.SMTP_USER).toEqual(undefined)
  expect(config.SMTP_PASS).toEqual(undefined)
  expect(config.SMTP_EMAIL).toEqual('noreply@example.com')
})

it('throws an error on invalid host', () => {
  expect(() => {
    const config = Value.Parse(mailConfig, {
      SMTP_HOST: '/invalid-host',
    })
  }).toThrow("Expected string to match 'hostname' format")
})

it('throws an error on invalid email', () => {
  expect(() => {
    const config = Value.Parse(mailConfig, {
      SMTP_EMAIL: 'invalid-email',
    })
  }).toThrow("Expected string to match 'email' format")
})
