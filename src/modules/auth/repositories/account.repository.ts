import type { AppDatabase } from '~/database'

export class AccountRepository {
  constructor(private readonly db: AppDatabase) {}
}
