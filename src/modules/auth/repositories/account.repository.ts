import type { AppDatabase } from '~/plugins/db.plugin'

export class AccountRepository {
  constructor(private readonly db: AppDatabase) {}
}
