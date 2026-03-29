import type { AppDatabase } from '~/plugins/database.plugin'
import { recordableClass } from '~/utils/otel.util'

@recordableClass()
export class AccountRepository {
  constructor(private readonly db: AppDatabase) {}
}
