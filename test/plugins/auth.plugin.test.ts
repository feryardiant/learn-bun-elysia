import { describe, expect, it } from "bun:test";
import Elysia from "elysia";
import { auth, authPlugin } from "~/plugins/auth.plugin";

describe('Auth Plugin', () => {
  const authApp = new Elysia()
    .use(authPlugin)
    .get('', () => 'Auth')

  describe('Middleware', () => {
    it('should returns 404 status when no authorization header', async () => {
      const response = await authApp.handle(
        new Request('http://localhost')
      )

      expect(response.status).toBe(404)
    })

    it('should returns 401 status when credential is invalid', async () => {
      const response = await authApp.handle(
        new Request('http://localhost', {
          headers: { 'authorization': 'Bearer invalid' }
        })
      )

      expect(response.status).toBe(401)
    })
  })
})
