import { t } from 'elysia'

export const mailConfig = t.Object(
  {
    SMTP_HOST: t.Optional(
      t.String({ default: '127.0.0.1', format: 'hostname' }),
    ),
    SMTP_PORT: t.Optional(t.Number({ default: 1025 })),
    SMTP_USER: t.Optional(t.String()),
    SMTP_PASS: t.Optional(t.String()),
    SMTP_EMAIL: t.Optional(
      t.String({ default: 'noreply@example.com', format: 'email' }),
    ),
  },
  {
    description: 'SMTP mail configuration',
  },
)
