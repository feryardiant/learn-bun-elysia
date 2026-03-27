import { Elysia } from 'elysia'
import { auth } from '~/plugins/auth.plugin'

export const authRoute = new Elysia({ name: 'auth-route' }).mount(
  async function HandleAuth(req) {
    return await auth.handler(req)
  },
)
