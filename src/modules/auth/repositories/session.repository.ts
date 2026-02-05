import type { AppDatabase } from '~/plugins/db.plugin'
import type { Session, User } from '../types'

export class SessionRepository {
  constructor(private readonly db: AppDatabase) {}

  async getAllByUserId(userId: User['id']): Promise<Session[]> {
    const data = await this.db.query.sessions.findMany({
      where: { userId },
    })

    return data
  }
}
