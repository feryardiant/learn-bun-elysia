import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  spyOn,
  type Mock,
} from 'bun:test'
import { logger } from '~/plugins/logger.plugin'
import { InvalidParamError } from '~/utils/errors.util'
import {
  decodeToken,
  encodeToken,
  ERRORS,
  paginate,
  type Paginable,
} from '~/utils/pagination.util'

const validTimestamp = 1768232385000
const validId = '2010738478460621263'
const validToken = 'MTc2ODIzMjM4NTAwMHwyMDEwNzM4NDc4NDYwNjIxMjYz'

it('should encode timestamp and id correctly', () => {
  const token = encodeToken(validTimestamp, validId)
  expect(token).toBe(validToken)
})

it('should decode valid token correctly', () => {
  const [timestamp, id] = decodeToken(validToken)

  expect(timestamp).toBe(validTimestamp)
  expect(id).toBe(validId)
})

it('should handle round-trip encoding and decoding', () => {
  const encoded = encodeToken(validTimestamp, validId)
  const [decodedTimestamp, decodedId] = decodeToken(encoded)

  expect(decodedTimestamp).toBe(validTimestamp)
  expect(decodedId).toBe(validId)
})

describe('Validations', () => {
  it('rejects truncated token', () => {
    // Truncate the valid token
    const truncatedToken = validToken.slice(0, validToken.length / 2)

    expect(() => decodeToken(truncatedToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects token with invalid base64 characters', () => {
    const invalidToken = `${validToken}@#$`

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects token without pipe separator', () => {
    // Create a token without pipe separator
    const invalidToken = Buffer.from('1768232385000').toString('base64')

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_FORMAT),
    )
  })

  it('rejects token with whitespace-only token', () => {
    const invalidToken = Buffer.from(' ').toString('base64')

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_FORMAT),
    )
  })

  it('rejects token with multiple pipe separators', () => {
    const invalidToken = Buffer.from('1768232385000|id|extra').toString(
      'base64',
    )

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_FORMAT),
    )
  })

  it('rejects token with invalid timestamp', () => {
    const invalidToken = Buffer.from('notanumber|2010738478460621263').toString(
      'base64',
    )

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects token with empty timestamp', () => {
    const invalidToken = Buffer.from('|2010738478460621263').toString('base64')

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects token with empty id', () => {
    const invalidToken = Buffer.from('1768232385000|').toString('base64')

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects token with whitespace-only id', () => {
    const invalidToken = Buffer.from('1768232385000|   ').toString('base64')

    expect(() => decodeToken(invalidToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  it('rejects modified token that decodes but does not re-encode to same value', () => {
    // Create a valid token then manually modify it
    const validToken = encodeToken(validTimestamp, validId)
    const modifiedToken = `${validToken.slice(0, -2)}XX`

    expect(() => decodeToken(modifiedToken)).toThrow(
      new InvalidParamError(ERRORS.INVALID_TOKEN_CONTENT),
    )
  })

  describe('Page Meta', () => {
    let debugLog: Mock<typeof logger.debug>
    let getNextToken: Mock<Paginable['getNextToken']>
    let getPrevToken: Mock<Paginable['getPrevToken']>

    const repo: Paginable = {
      getNextToken: async () => 'next-token',
      getPrevToken: async () => 'prev-token',
    }

    beforeEach(() => {
      debugLog = spyOn(logger, 'debug').mockImplementation(() => {})
      getNextToken = spyOn(repo, 'getNextToken')
      getPrevToken = spyOn(repo, 'getPrevToken')
    })

    afterEach(() => {
      debugLog.mockRestore()
      getNextToken.mockRestore()
      getPrevToken.mockRestore()
    })

    it('returns null when there is no limit specified', async () => {
      const pageMeta = await paginate([], repo, {})

      expect(pageMeta).toEqual({
        next_page_token: null,
        prev_page_token: null,
      })

      expect(getNextToken).not.toHaveBeenCalled()
      expect(getPrevToken).not.toHaveBeenCalled()

      expect(debugLog).not.toHaveBeenCalled()
    })

    it('only calls getPrevToken when limit is not equals to total entries', async () => {
      const limit = 3
      const entries = Array.from({ length: limit })
      const pageMeta = await paginate(entries, repo, { limit })

      expect(pageMeta).toEqual({
        next_page_token: 'next-token',
        prev_page_token: 'prev-token',
      })

      expect(getPrevToken).toHaveBeenCalled()
      expect(getNextToken).toHaveBeenCalled()

      expect(debugLog).not.toHaveBeenCalled()
    })

    it('calls getNextToken when limit is equals to total entries', async () => {
      const pageMeta = await paginate([], repo, { limit: 10 })

      expect(pageMeta).toEqual({
        next_page_token: null,
        prev_page_token: 'prev-token',
      })

      expect(getPrevToken).toHaveBeenCalled()
      expect(getNextToken).not.toHaveBeenCalled()

      expect(debugLog).not.toHaveBeenCalled()
    })

    it('logs as debug when there is an exception thrown', async () => {
      getPrevToken.mockImplementation(() => {
        throw new Error('Mocked error')
      })

      const pageMeta = await paginate([], repo, { limit: 10 })

      expect(pageMeta).toEqual({
        next_page_token: null,
        prev_page_token: null,
      })

      expect(debugLog).toHaveBeenCalled()
    })
  })
})
