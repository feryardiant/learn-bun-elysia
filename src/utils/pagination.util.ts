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
   * @param query Current query parameters.
   * @param entry Instance of last entry.
   * @returns Array of [timestamp, identifier] or null if no more pages.
   */
  getNextToken(
    query: PaginatedQuery,
    entry?: unknown,
  ): Promise<[number, string] | null>

  /**
   * Retrieve prev page token based on current query and first entry.
   *
   * @param query Current query parameters.
   * @param entry Instance of first entry.
   * @returns Array of [timestamp, identifier] or null if no more pages.
   */
  getPrevToken(
    query: PaginatedQuery,
    entry?: unknown,
  ): Promise<[number, string] | null>
}

export const ERRORS = {
  INVALID_TOKEN_FORMAT: 'Page token is invalid',
  INVALID_TOKEN_CONTENT: 'Page token appears to be truncated or modified',
} as const

const PageTokenSchema = t.String({
  minLength: 1,
  pattern: '^[A-Za-z0-9+/]+=*$',
  description: 'Base64 encoded page token',
  error({ errors, property }) {
    const error = errors.find((err) => err.path === property)
    const field = property?.slice(1)

    if (!error || !field) return

    return ERRORS.INVALID_TOKEN_FORMAT
  },
})

export const PaginatedQuerySchema = t.Object(
  {
    next_page_token: t.Optional(PageTokenSchema),
    prev_page_token: t.Optional(PageTokenSchema),
    limit: t.Optional(
      t.Number({
        description: 'Number of entries to show',
        minimum: 0,
        default: 20,
      }),
    ),
  },
  { description: 'Paginated request query parameter' },
)

export const PaginatedMetaSchema = t.Object(
  {
    next_page_token: t.Nullable(
      t.String({ description: PageTokenSchema.description }),
    ),
    prev_page_token: t.Nullable(
      t.String({ description: PageTokenSchema.description }),
    ),
  },
  { description: 'Paginated response metadata' },
)

/**
 * Paginated request query parameter.
 */
export type PaginatedQuery = typeof PaginatedQuerySchema.static

/**
 * Paginated response metadata.
 */
export type PaginatedMeta = typeof PaginatedMetaSchema.static

/**
 * Encode page token.
 */
export function encodeToken(timestamp: number, id: string): string {
  return Buffer.from(`${timestamp}|${id}`).toString('base64')
}

/**
 * Decode page token.
 *
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

  const time = Number(timestamp)

  // Validate that re-encoding produces the same token (prevents truncation)
  if (Number.isNaN(time) || encodeToken(time, identifier) !== token) {
    throw new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT)
  }

  return [time, identifier]
}

/**
 * Retrieve the next and prev token based on given query.
 *
 * @param entries The data entries.
 * @param repo A repository class that implement Paginable interface.
 * @param query Request query parameters.
 */
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
    const prevToken = await repo.getPrevToken(query, entries.at(0))

    result.prev_page_token = prevToken
      ? encodeToken(prevToken[0], prevToken[1])
      : prevToken

    // Here we check if we have reached the last page,
    // in which case we don't need to fetch the last entry
    if (entries.length === query.limit) {
      const nextToken = await repo.getNextToken(query, entries.at(-1))

      result.next_page_token = nextToken
        ? encodeToken(nextToken[0], nextToken[1])
        : nextToken
    }

    return result
  } catch (error) {
    logger.debug(error, 'Error occurred while paginating')

    return result
  }
}
