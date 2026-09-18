import { count, eq } from 'drizzle-orm'
import type { AppDatabase } from '~/plugins/database.plugin'
import { recordableClass } from '~/utils/otel.util'
import { users } from '../schemas/users.schema'
import type { User } from '../types'

@recordableClass()
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
