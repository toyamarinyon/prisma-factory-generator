import { generatorHandler } from '@prisma/generator-helper'
import * as fs from 'fs'
import * as path from 'path'

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './factories',
      prettyName: 'Prisma Factory Generator',
    }
  },
  async onGenerate(options) {
    const output = options.generator.output?.value

    if (output) {
      try {
        await fs.promises.mkdir(output, {
          recursive: true,
        })
        await fs.promises.writeFile(
          path.join(output, 'output.ts'),
          `export const hello = 'hello'`
        )
      } catch (e) {
        console.error(
          'Error: unable to write files for Prisma Factory Generator'
        )
        throw e
      }
    } else {
      throw new Error('No output was specified for Prisma Factory Generator')
    }
  },
})
