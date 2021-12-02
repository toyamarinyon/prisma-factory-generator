#!/usr/bin/env node

import { generatorHandler } from '@prisma/generator-helper'
import { ModuleKind, Project, ts } from 'ts-morph'
import * as fs from 'fs'
import * as path from 'path'
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
      const project = new Project({
        compilerOptions: { declaration: true, module: ModuleKind.CommonJS },
      })
      const sourceFile = project.createSourceFile(
        `${output}/index.ts`,
        undefined,
        {
          overwrite: true,
        }
      )
      addPrismaImportDeclaration(sourceFile)
      const models = options.dmmf.datamodel.models
      options.dmmf.datamodel.models.forEach((model) => {
        addModelFactoryDeclaration(sourceFile, model, models)
      })
      sourceFile.formatText({
        indentSize: 2,
        semicolons: ts.SemicolonPreference.Remove,
      })

      try {
        await fs.promises.mkdir(output, {
          recursive: true,
        })
        await sourceFile.emit()

        const packageJsonTargetPath = path.join(output, 'package.json')
        const pkgJson = JSON.stringify(
          {
            name: '.prisma/client',
            main: 'index.js',
            types: 'index.d.ts',
          },
          null,
          2
        )
        await fs.promises.writeFile(packageJsonTargetPath, pkgJson)
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
