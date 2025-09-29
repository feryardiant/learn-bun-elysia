import { z } from 'zod'
import { dbConfig } from './db.config'

const envSchema = z
  .object({
    HOST: z.string().default('localhost'),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z
      .enum(['local', 'test', 'development', 'qa', 'production'])
      .default('production'),
  })
  .extend(dbConfig.shape)

export const ENV = envSchema.parse(Bun.env)

export const isLocal = ['local', 'test'].includes(ENV.NODE_ENV)
