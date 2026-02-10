import { t } from 'elysia'
import { InvalidParamError } from './errors.util'
import { logger } from '~/plugins/logger.plugin'

/**
 * Interface for objects that support pagination operations.
 */
export interface Paginable {
  /**
   * Retrieve next page token based on current query and last entry.
   *
   * @param query Current query parameters
   * @param entry Instance of last entry
   */
  getNextToken(query: PaginatedQuery, entry?: unknown): Promise<string | null>

  /**
   * Retrieve next page token based on current query and first entry.
   *
   * @param query Current query parameters
   * @param entry Instance of last entry
   */
  getPrevToken(query: PaginatedQuery, entry?: unknown): Promise<string | null>
}

export const ERRORS = {
  INVALID_TOKEN_FORMAT: 'Invalid token format: not a valid base64 token',
  INVALID_TOKEN_CONTENT:
    'Invalid token format: token appears to be truncated or modified',
} as const

const PageTokenSchema = t.String({
  minLength: 1,
  pattern: '^[A-Za-z0-9+/]+=*$',
  error({ errors, property }) {
    const error = errors.find((err) => err.path === property)
    const field = property?.slice(1)

    if (!error || !field) return

    return ERRORS.INVALID_TOKEN_FORMAT
  },
})

export const PaginatedQuerySchema = t.Object({
  next_page_token: t.Optional(PageTokenSchema),
  prev_page_token: t.Optional(PageTokenSchema),
  limit: t.Optional(t.Number({ minimum: 0 })),
})

export const PaginatedMetaSchema = t.Object({
  next_page_token: t.Nullable(t.String()),
  prev_page_token: t.Nullable(t.String()),
})

export type PaginatedQuery = typeof PaginatedQuerySchema.static

export type PaginatedMeta = typeof PaginatedMetaSchema.static

/**
 * Encode page token.
 */
export function encodeToken(timestamp: number, id: string): string {
  return Buffer.from(`${timestamp}|${id}`).toString('base64')
}

/**
 * Decode page token.
 * @throws {InvalidParamError} if token is invalid
 */
export function decodeToken(token: string): [number, string] {
  const decoded = Buffer.from(token, 'base64').toString('utf-8')

  // Validate decoded format: must be "timestamp|id"
  const parts = decoded.split('|')

  if (parts.length !== 2) {
    throw new InvalidParamError(ERRORS.INVALID_TOKEN_FORMAT)
  }

  const timestamp = parts[0]?.trim() || ''
  const identifier = parts[1]?.trim() || ''

  // Validate timestamp is a valid number
  if (timestamp.length === 0 || identifier.length === 0) {
    throw new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT)
  }

  // Validate that re-encoding produces the same token (prevents truncation)
  if (encodeToken(Number(timestamp), identifier) !== token) {
    throw new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT)
  }

  return [Number(timestamp), identifier]
}

export async function paginate(
  entries: unknown[],
  repo: Paginable,
  query: PaginatedQuery & Record<string, unknown>,
): Promise<PaginatedMeta> {
  const result: PaginatedMeta = {
    next_page_token: null,
    prev_page_token: null,
  }

  // No pagination if limit is not specified
  if (!query.limit || query.limit <= 0) {
    return result
  }

  try {
    result.prev_page_token = await repo.getPrevToken(query, entries.at(0))

    // Here we check if we have reached the last page,
    // in which case we don't need to fetch the last entry
    if (entries.length === query.limit) {
      result.next_page_token = await repo.getNextToken(query, entries.at(-1))
    }

    return result
  } catch (error) {
    logger.debug(error, 'Error occurred while paginating')

    return result
  }
}
