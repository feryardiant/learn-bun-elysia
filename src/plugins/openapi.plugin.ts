import openapi from '@elysiajs/openapi'
import { description, name, version } from 'package.json'
import { ENV } from '~/config'
import { authDoc } from './auth.plugin'

export const SWAGGER_PATH = `${ENV.BASE_PATH}/docs`

export const openapiPlugin = openapi({
  path: SWAGGER_PATH,

  documentation: {
    info: { title: name, version, description },
    components: authDoc.components,
    paths: authDoc.paths,
  },

  scalar: {
    spec: {
      url: `${SWAGGER_PATH}/json`,
    },
  },

  exclude: {
    staticFile: true,
    paths: ['/*'],
  },
})
