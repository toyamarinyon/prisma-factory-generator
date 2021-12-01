#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper'
import { Project, ts } from 'ts-morph'
import * as fs from 'fs'
import {
  addPrismaImportDeclaration,
  addModelFactoryDeclaration,
} from './generator'

generatorHandler({
  onManifest() {
    return {
      defaultOutput: 'node_modules/.prisma/factory',
      prettyName: 'Prisma Factory Generator',
    }
  },
  async onGenerate(options) {
    const output = options.generator.output?.value

    if (output) {
      const project = new Project({})
      const sourceFile = project.createSourceFile(
        `${output}/index.ts`,
        undefined,
        {
          overwrite: true,
        }
      )
      addPrismaImportDeclaration(sourceFile)
      options.dmmf.datamodel.models.forEach((model) => {
        addModelFactoryDeclaration(sourceFile, model)
      })
      sourceFile.formatText({
        indentSize: 2,
        semicolons: ts.SemicolonPreference.Remove,
      })

      try {
        await fs.promises.mkdir(output, {
          recursive: true,
        })

        await sourceFile.save()
        // await sourceFile.save()
        //         await fs.promises.writeFile(
        //           path.join(output, 'output.ts'),
        //           `
        // import { PrismaClient } from '@prisma/client'
        // import { Prisma } from '.prisma/client'
        // const prisma = new PrismaClient()

        // export async function createStudent(args: Prisma.StudentCreateArgs) {
        //   return prisma.student.create({
        //     data: {
        //       ...{
        //         lastName: 'last',
        //         firstName: 'fiist',
        //         email: 'satoshi',
        //       },
        //       ...args.data,
        //     },
        //   })
        // }

        // `
        //         )
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
