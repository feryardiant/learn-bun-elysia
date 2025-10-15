import type { AppDatabase } from '~/database'
import type { User } from '../types'
import { count, eq } from 'drizzle-orm'
import { users } from '~/database/schemas'

export class UserRepository {
  constructor(private readonly db: AppDatabase) {}

  async exists(id: User['id']): Promise<boolean> {
    const data = await this.db
      .selectDistinct({
        count: count(users.id),
      })
      .from(users)
      .where(eq(users.id, id))

    return data[0]?.count === 1
  }
}
