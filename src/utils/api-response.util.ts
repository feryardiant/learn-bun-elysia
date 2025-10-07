import type { TNever, TSchema } from '@sinclair/typebox'
import { t } from 'elysia'

export const ApiErrorSchema = t.Object({
  code: t.String(),
  message: t.String(),
})

export const ApiItemsMetaSchema = t.Record(t.String(), t.Any())

export type TApiItemsMeta = typeof ApiItemsMetaSchema
export type ApiItemsMeta = (typeof ApiItemsMetaSchema)['static']

export const asItemResponse = <D extends TSchema>(data: D) => t.Object({ data })

export const asItemsResponse = <D extends TSchema, M extends TApiItemsMeta>(
  data: D,
  meta?: M,
) =>
  t.Object({
    data: t.Array(data),
    meta: meta || ApiItemsMetaSchema,
  })
