import { AssertError, Value } from '@sinclair/typebox/value'
import { t } from 'elysia'
import { createTransport } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import { ENV } from '~/config'
import { logger } from './logger.plugin'
import { MissingConfigError } from '~/utils/errors.util'

const transporter = createTransport(
  {
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  },
  {
    from: ENV.SMTP_EMAIL,
  },
)

function validateEmailFormat(path: string, email?: Mail.Options['to']) {
  if (!email) return

  if (!Array.isArray(email)) {
    email = [email]
  }

  try {
    Value.Parse(
      t.Object({
        [path]: t.Array(t.String({ format: 'email' })),
      }),
      { [path]: email },
    )
  } catch (err) {
    const { error } = err as AssertError

    if (error) {
      // Just throw the `ValueError` instead of whole `AssertError`
      // And with slight modification of the `path`
      error.path = path

      throw error
    }
  }
}

export async function sendMail(
  html: Mail.Options['html'],
  opts: Omit<Mail.Options, 'html'>,
) {
  const recipients = ['to', 'cc', 'bcc'] as const

  try {
    // Ensure the configurations are valid
    if (!ENV.SMTP_HOST || !ENV.SMTP_PORT || !ENV.SMTP_EMAIL) {
      throw new MissingConfigError('SMTP_HOST or SMTP_PORT is not set')
    }

    // Ensure the recipients are valid
    for (const recipient of recipients) {
      validateEmailFormat(recipient, opts[recipient])
    }

    const info = await transporter.sendMail({ ...opts, html })

    logger.info(info, `mail "${opts.subject}" sent`)
  } catch (err) {
    // See: https://nodemailer.com/errors
    let error = err as Error & { code: string }

    if ('schema' in error) {
      // `ValueError` doesn't have `code`, so just add it ourselves
      error.code = 'INVALID_PARAM'
    }

    logger.error(error, `[${error.code}] ${error.message}`)
  }
}
