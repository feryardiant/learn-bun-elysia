import type { FeedQuery, Post } from '~/modules/feeds'
import { type DateRange } from '~/utils/filters.util'

export const dateRanges: DateRange[] = ['24 hours', '7 days', '30 days']

export type FilterQuery = keyof FeedQuery

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
   * @param post Post instance to test against
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

interface Assertion {
  value: string
  callback: (post: Post) => void
}

export interface FilterObject {
  [k: string]: Record<string, Assertion>
}

export const createScenario = (filters: FilterObject) => {
  let combinations: string[] = []

  return Object.entries(filters).reduce((out, [query, filter]) => {
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
  }, [] as FilterCriteria[])
}
