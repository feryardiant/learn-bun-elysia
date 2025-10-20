// import { Glob, type GlobScanOptions } from 'bun'
// import type { PgTable } from 'drizzle-orm/pg-core'
// import { resolve } from 'path'

// const glob = new Glob('*/schemas/index.ts')
// const opts: GlobScanOptions = {
//   cwd: resolve(__dirname, '../modules'),
//   absolute: true,
// }

// const schema: Record<string, PgTable> = {}

// for await (const schemaFile of glob.scan(opts)) {
//   const moduleSchemas = await import(schemaFile)

//   for (const [key, value] of Object.entries(moduleSchemas)) {
//     schema[key] = value as PgTable
//   }
// }

// export { schema }

export * from '~/modules/auth/schemas'
export * from '~/modules/feeds/schemas'
