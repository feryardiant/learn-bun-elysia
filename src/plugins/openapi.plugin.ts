import openapi from '@elysiajs/openapi'
import { description, name, version } from 'package.json'
import { ENV } from '~/config'
import { auth } from './auth.plugin'
import type { OpenAPIV3 } from 'openapi-types'

export const SWAGGER_PATH = `${ENV.BASE_PATH || ''}/docs`

const { components, paths } = await auth.api.generateOpenAPISchema()

export const openapiPlugin = openapi({
  path: SWAGGER_PATH,

  documentation: {
    info: { title: name, version, description },
    components: components as OpenAPIV3.ComponentsObject,
    paths: Object.keys(paths).reduce((acc, path) => {
      const ref = paths[path] as OpenAPIV3.PathItemObject

      acc[`${auth.options.basePath}${path}`] = Object.keys(ref).reduce(
        (acc, method) => {
          const mtd = method as OpenAPIV3.HttpMethods
          acc[mtd] = ref[mtd] as OpenAPIV3.OperationObject
          acc[mtd].tags = ['Auth']

          return acc
        },
        {} as OpenAPIV3.PathItemObject,
      )

      return acc
    }, {} as OpenAPIV3.PathsObject),
  },

  scalar: {
    spec: {
      url: `${SWAGGER_PATH}/json`,
    },
  },
})
