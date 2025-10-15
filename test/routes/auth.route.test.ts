import { afterAll, describe, expect, it } from 'bun:test'
import { ENV } from '~/config'
import { db } from '~/database'
import { accounts, sessions, users } from '~/database/schemas'
import { authRoute } from '~/routes/auth.route'

describe('Auth Routes', () => {
  const APP_URL = 'http://localhost/auth'

  afterAll(async () => {
    await db.delete(accounts)
    await db.delete(sessions)
    await db.delete(users)
  })

  it('should able to crate anonymous user', async () => {
    const response = await authRoute.handle(
      new Request(`${APP_URL}/sign-in/anonymous`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')

    expect(await response.json()).toEqual({
      token: expect.any(String),
      user: expect.objectContaining({
        id: expect.any(String),
        email: expect.stringContaining(ENV.APP_DOMAIN),
        emailVerified: expect.any(Boolean),
        name: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      }),
    })
  })
})
