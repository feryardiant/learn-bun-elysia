import { Type as t } from '@sinclair/typebox'

export const authConfig = t.Object({
  AUTH_SECRET: t.String({ default: 'secret' }),

  TRUSTED_ORIGINS: t.Transform(t.String({ default: '*' }))
    .Decode((value) => {
      return value.split(',').reduce((acc, origin) => {
        const trimmedOrigin = origin.trim()

        if (trimmedOrigin.length === 0 || acc.includes(trimmedOrigin)) {
          return acc
        }

        if (trimmedOrigin === '*') {
          acc.push(trimmedOrigin)
          return acc
        }

        try {
          new URL(trimmedOrigin)
          acc.push(trimmedOrigin)

          return acc
        } catch {
          return acc
        }
      }, [] as string[])
    })
    .Encode((value) => value.join(','))
})
