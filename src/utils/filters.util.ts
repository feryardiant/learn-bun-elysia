import { subDays } from 'date-fns'
import { t } from 'elysia'

export const DATE_RANGES = {
  DAY: '24 hours',
  WEEK: '7 days',
  MONTH: '30 days',
} as const

export function getRange(range: DateRange, today: Date = new Date()): Date {
  return {
    [DATE_RANGES.DAY]: subDays(today, 1),
    [DATE_RANGES.WEEK]: subDays(today, 7),
    [DATE_RANGES.MONTH]: subDays(today, 30),
  }[range]
}

export const DateRangeSchema = t.Union(
  [
    t.Literal(DATE_RANGES.DAY, { description: 'Last 24 hours' }),
    t.Literal(DATE_RANGES.WEEK, { description: 'Last 7 days' }),
    t.Literal(DATE_RANGES.MONTH, { description: 'Last 30 days' }),
  ],
  { description: 'Date range filter' },
)

export type DateRange = typeof DateRangeSchema.static
