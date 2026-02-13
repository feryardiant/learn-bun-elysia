import { afterEach, beforeEach, expect, it, spyOn, type Mock } from 'bun:test'
import Mail from 'nodemailer/lib/mailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'
import { ENV } from '~/config'
import { logger } from '~/plugins/logger.plugin'
import { sendMail } from '~/plugins/mail.plugin'

let logInfo: Mock<typeof logger.info>
let logError: Mock<typeof logger.error>
let mailSender: Mock<Mail['sendMail']>

const MAIL_FROM = 'noreply@example.com'

beforeEach(async () => {
  logInfo = spyOn(logger, 'info').mockImplementation(() => {})
  logError = spyOn(logger, 'error').mockImplementation(() => {})
  mailSender = spyOn(Mail.prototype, 'sendMail')
})

afterEach(() => {
  logInfo.mockRestore()
  logError.mockRestore()
  mailSender.mockRestore()
})

it('should send the email', async () => {
  mailSender.mockImplementation(async (opts) => ({
    // Strip down version of actual `sendMail` returns value, We exclude:
    // `ehlo`, `rejected`, `accepted`, `response`, `messageTime` & `messageSize`
    envelope: { from: MAIL_FROM, to: [opts.to] },
    messageId: '<random-uuid-from-the-smtp-server@example.com>',
  }))

  const mailOpts = { subject: 'test', to: 'test@example.com' }

  await sendMail('<html><body>Hello</body></html>', mailOpts)

  expect(logInfo).toHaveBeenCalled()
  const [info, imsg] = logInfo.mock.calls[0] as [
    Partial<SMTPTransport.SentMessageInfo>,
    string,
  ]

  expect(imsg).toEqual('mail "test" sent')
  expect(info).toEqual({
    envelope: { from: MAIL_FROM, to: [mailOpts.to] },
    messageId: '<random-uuid-from-the-smtp-server@example.com>',
  })
})

it('should log error on malformed email recipient', async () => {
  const mailOpts = { subject: 'test', to: 'test[at]example.com' }

  await sendMail('<html><body>Hello</body></html>', mailOpts)

  expect(logError).toHaveBeenCalled()
  const [_, msg] = logError.mock.calls[0] as [Error & { code: string }, string]

  expect(msg).toBe("[INVALID_PARAM] Expected string to match 'email' format")
})

it('should log error on missing SMTP configs', async () => {
  // Directly overwrite the value instead of using `mock` is
  // the best option so far to avoid impacting other tests
  ENV.SMTP_HOST = undefined
  ENV.SMTP_PORT = undefined

  const mailOpts = { subject: 'test', to: 'test@example.com' }

  await sendMail('<html><body>Hello</body></html>', mailOpts)

  expect(logError).toHaveBeenCalled()
  const [_, msg] = logError.mock.calls[0] as [Error & { code: string }, string]

  expect(msg).toBe(
    '[MISSING_CONFIG] SMTP_HOST, SMTP_PORT or SMTP_EMAIL is not set',
  )
})
