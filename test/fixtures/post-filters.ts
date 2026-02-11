import { expect } from 'bun:test'
import { endOfDay } from 'date-fns'
import type { Post } from '~/modules/feeds'
import { getRange, type DateRange } from '~/utils/filters.util'

export const dateRanges: DateRange[] = ['24 hours', '7 days', '30 days']

export const filters = {
  date_range: dateRanges.reduce(
    (out, range) => {
      out[range] = {
        value: range,
        callback: (post: Post) => {
          const today = new Date()
          const createdAt = new Date(post.createdAt)

          expect(createdAt.getTime()).toBeLessThan(endOfDay(today).getTime())
          expect(createdAt.getTime()).toBeGreaterThan(
            getRange(range, today).getTime(),
          )
        },
      }

      return out
    },
    {} as Record<string, { value: DateRange; callback: (post: Post) => void }>,
  ),
}

export type FilterQuery = keyof typeof filters

export interface FilterCriteria extends Record<string, unknown> {
  /**
   * Test scenario label.
   */
  label: string

  /**
   * Filter queries.
   */
  params: FilterQuery[]

  /**
   * Assertion callback.
   * @param post Post instance to test againts
   */
  callback: (post: Post) => void

  /**
   * Query string to be applied.
   */
  apply: (param: URLSearchParams) => void

  /**
   * Reset query string after test.
   */
  reset: (param: URLSearchParams) => void
}

const combinations: string[] = []

export const filtersScenario = Object.entries(filters).reduce(
  (out, [query, filter]) => {
    for (const [scope, assertion] of Object.entries(filter)) {
      out.push({
        params: [query] as FilterQuery[],
        label: `${scope} ${query}`,
        callback: assertion.callback,
        apply: (param) => {
          param.set(query, assertion.value)
        },
        reset: (param) => {
          param.delete(query)
          param.delete('next_page_token')
          param.delete('prev_page_token')
        },
      })

      for (const [otherQuery, otherFilter] of Object.entries(filters)) {
        if (otherQuery === query || combinations.includes(otherQuery)) continue

        combinations.push(query)

        for (const [otherScope, otherAssertion] of Object.entries(
          otherFilter,
        )) {
          out.push({
            params: [query, otherQuery] as FilterQuery[],
            label: `${scope} ${query} and ${otherScope} ${otherQuery}`,
            callback: (post) => {
              assertion.callback(post)
              otherAssertion.callback(post)
            },
            apply: (param) => {
              param.set(query, assertion.value)
              param.set(otherQuery, otherAssertion.value)
            },
            reset: (param) => {
              param.delete(query)
              param.delete(otherQuery)
              param.delete('next_page_token')
              param.delete('prev_page_token')
            },
          })
        }
      }
    }

    return out
  },
  [] as FilterCriteria[],
)
