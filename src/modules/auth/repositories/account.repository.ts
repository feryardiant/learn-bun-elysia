import type { AppDatabase } from '~/plugins/database.plugin'

export class AccountRepository {
  constructor(private readonly db: AppDatabase) {}
}
