import { Type as t } from '@sinclair/typebox'

export const authConfig = t.Object({
  AUTH_SECRET: t.String({ default: 'secret' }),
})
