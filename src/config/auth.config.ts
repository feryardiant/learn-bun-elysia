import { Type as t } from '@sinclair/typebox'

export const authConfig = t.Object({
  AUTH_SECRET: t.String({ default: 'secret' }),

  TRUSTED_ORIGINS: t.Transform(t.String({ default: '*' }))
    .Decode((value) => {
      let origins: string[] = []

      for (let origin of value.split(',')) {
        origin = origin.trim()

        if (origin.length === 0 || origins.includes(origin)) {
          continue
        }

        if (origin === '*') {
          origins = ['*']
          break
        }

        const verified = verifyOrigin(origin)

        if (verified) {
          origins.push(origin)
        }
      }

      return origins
    })
    .Encode((value) => value.join(','))
})

function verifyOrigin(url: string) {
  try {
    new URL(url)

    return url
  } catch (error) {
    // At this point we cannot use `logger.plugin`
    console.warn(`Invalid origin: ${url}`)

    return
  }
}
