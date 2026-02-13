import { AssertError, Value, type ValueError } from '@sinclair/typebox/value'
import { t } from 'elysia'
import { createTransport } from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import { ENV } from '~/config'
import { logger } from './logger.plugin'
import {
  InvalidParamError,
  MissingConfigError,
  type AppError,
} from '~/utils/errors.util'

const transporter = createTransport(
  {
    host: ENV.SMTP_HOST,
    port: ENV.SMTP_PORT,
    auth:
      ENV.SMTP_USER && ENV.SMTP_PASS
        ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS }
        : undefined,
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

  // We only need to validate `string` email address here
  email = email.filter((e) => typeof e === 'string')

  try {
    Value.Parse(
      t.Object({
        [path]: t.Array(t.String({ format: 'email' })),
      }),
      { [path]: email },
    )
  } catch (err) {
    // Just throw the `ValueError` instead of whole `AssertError`
    const error = (err as AssertError).error as ValueError

    // And with slight modification of the `path`
    error.path = path

    throw new InvalidParamError(`${error.message}, ${path}: ${error.value}`)
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
      throw new MissingConfigError(
        'SMTP_HOST, SMTP_PORT or SMTP_EMAIL is not set',
      )
    }

    // Ensure the recipients are valid
    for (const recipient of recipients) {
      validateEmailFormat(recipient, opts[recipient])
    }

    const info = await transporter.sendMail({ ...opts, html })

    logger.info(info, `mail "${opts.subject}" sent`)
  } catch (err) {
    let error = err as AppError

    logger.error(error, `[${error.code}] ${error.message}`)
  }
}
