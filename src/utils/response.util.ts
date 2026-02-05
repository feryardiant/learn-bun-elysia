import type { ObjectOptions, TSchema } from '@sinclair/typebox'
import { t } from 'elysia'

export const ApiErrorSchema = t.Object({
  code: t.String(),
  message: t.String(),
})

export const ApiItemsMetaSchema = t.Record(t.String(), t.Any())

export type TApiItemsMeta = typeof ApiItemsMetaSchema
export type ApiItemsMeta = TApiItemsMeta['static']

export const ValidationValueErrorSchema = t.Object({
  type: t.Number(),
  path: t.String(),
  value: t.Unknown(),
  summary: t.String(),
})

export type ValidationValueError = (typeof ValidationValueErrorSchema)['static']

export const ValidationErrorSchema = t.Object(
  {
    ...ApiErrorSchema.properties,
    errors: t.Array(ValidationValueErrorSchema),
  },
  {
    description:
      'Bad Request. Usually due to missing parameters, or invalid parameters.',
  },
)

export type ValidationError = (typeof ValidationErrorSchema)['static']

export const asItemResponse = <D extends TSchema>(
  data: D,
  options?: ObjectOptions,
) =>
  t.Object(
    { data },
    {
      description: options?.description || 'Success - Returns the resource',
      ...options,
    },
  )

export const asItemsResponse = <D extends TSchema, M extends TApiItemsMeta>(
  data: D,
  meta?: M,
  options?: ObjectOptions,
) =>
  t.Object(
    {
      data: t.Array(data, { description: 'List of items' }),
      meta: meta || ApiItemsMetaSchema,
    },
    {
      description: options?.description || 'Success - Returns the collection',
      ...options,
    },
  )
