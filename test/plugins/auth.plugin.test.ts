import type { UserWithAnonymous, AnonymousSession } from 'better-auth/plugins'
import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'
import { db } from '~/plugins/database.plugin'
import { accounts, sessions, users } from '~/modules/auth'
import { auth, authPlugin } from '~/plugins/auth.plugin'
import { tearDownTables } from 'test/fixtures'

describe('Auth Plugin', () => {
  const APP_URL = 'http://localhost'

  const handler = mock(() => 'Auth')
  const authApp = new Elysia().use(authPlugin).get('', handler)

  afterEach(() => {
    handler.mockRestore()
  })

  afterAll(async () => {
    await tearDownTables(accounts, sessions, users)
  })

  describe('Middleware', () => {
    it('should returns 401 status when no authorization header', async () => {
      const response = await authApp.handle(new Request('http://localhost'))

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should returns 401 status when credential is invalid', async () => {
      const response = await authApp.handle(
        new Request(APP_URL, {
          headers: { authorization: 'Bearer invalid' },
        }),
      )

      expect(response.status).toBe(401)
      expect(handler).not.toHaveBeenCalled()
    })

    it('should receive user object when authenticated', async () => {
      const authenticated = await auth.api.signInAnonymous()
      const response = await authApp.handle(
        new Request(APP_URL, {
          headers: { authorization: `Bearer ${authenticated?.token}` },
        }),
      )

      expect(response.status).toBe(200)
      expect(handler).toHaveBeenCalled()

      // Ensure `user` is get passed to request context
      const ctx =
        handler.mock.lastCall?.at(0) ||
        ({} as {
          user: UserWithAnonymous
          session: AnonymousSession
        })

      expect(ctx).toContainKeys(['user', 'session'])

      // Ensure instance of `user` is expected to be Anonymous
      expect(ctx.user.isAnonymous).toBeTrue()
      expect(ctx.user.emailVerified).toBeFalse()
    })
  })
})
