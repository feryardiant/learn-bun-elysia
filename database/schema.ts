import { Glob, type GlobScanOptions } from 'bun'
import { resolve } from 'path'

const glob = new Glob('*/schemas/index.ts')
const opts: GlobScanOptions = {
  cwd: resolve(__dirname, '../src/modules'),
  absolute: true,
}

const schemaFiles: string[] = []

for (const schemaFile of glob.scanSync(opts)) {
  schemaFiles.push(schemaFile)
}

export { schemaFiles }
