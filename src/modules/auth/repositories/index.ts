import { db } from '~/database'
import { AccountRepository } from './account.repository'
import { SessionRepository } from './session.repository'
import { UserRepository } from './user.repository'

export { AccountRepository, SessionRepository, UserRepository }

export const accountRepository = new AccountRepository(db)
export const sessionRepository = new SessionRepository(db)
export const userRepository = new UserRepository(db)
