import { Elysia } from 'elysia'
import { auth } from '~/plugins/auth.plugin'
import { updateSpanName } from '~/plugins/otel.plugin'

export const authRoute = new Elysia({ name: 'auth-route' }).mount(
  async (req) => {
    updateSpanName(req)

    return await auth.handler(req)
  },
)
