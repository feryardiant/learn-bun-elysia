import type { AppDatabase } from '~/plugins/database.plugin'
import { recordableClass } from '~/plugins/otel.plugin'

@recordableClass()
export class AccountRepository {
  constructor(private readonly db: AppDatabase) {}
}
