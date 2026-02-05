import { count, eq } from 'drizzle-orm'
import type { AppDatabase } from '~/plugins/database.plugin'
import type { User } from '../types'
import { users } from '../schemas/users.schema'

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
