import type { AppDatabase } from '~/plugins/database.plugin'
import { recordableClass } from '~/plugins/otel.plugin'
import type { Session, User } from '../types'

@recordableClass()
export class SessionRepository {
  constructor(private readonly db: AppDatabase) {}

  async getAllByUserId(userId: User['id']): Promise<Session[]> {
    const data = await this.db.query.sessions.findMany({
      where: { userId },
    })

    return data
  }
}
