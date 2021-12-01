import { DMMF } from '@prisma/client/runtime'
import camelcase from 'camelcase'
import { fakerForField } from './helper'
import { SourceFile, VariableDeclarationKind, Writers } from 'ts-morph'

export function addPrismaImportDeclaration(sourceFile: SourceFile) {
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@prisma/client',
    namedImports: ['PrismaClient'],
  })
  sourceFile.addImportDeclaration({
    moduleSpecifier: '.prisma/client',
    namedImports: ['Prisma'],
  })
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'faker',
    defaultImport: 'faker',
  })
  sourceFile.addStatements(`const prisma = new PrismaClient()`)
}

export function addModelFactoryDeclaration(
  sourceFile: SourceFile,
  model: DMMF.Model
) {
  const modelName = model.name
  const defaultVariableName = `${modelName}DefaultVariables`
  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: defaultVariableName,
        initializer: Writers.object(
          Object.fromEntries(
            model.fields
              .filter((field) => field.kind === 'scalar')
              .map((field) => [field.name, fakerForField(field)])
          )
        ),
      },
    ],
    leadingTrivia: '\r\n',
  })
  sourceFile.addFunction({
    isExported: true,
    isAsync: true,
    name: camelcase(['create', modelName]),
    parameters: [
      {
        name: 'args?',
        type: `Partial<Prisma.${camelcase([modelName, 'CreateArgs'], {
          pascalCase: true,
        })}>`,
      },
    ],
    statements: `
      return await prisma.${camelcase(modelName)}.create({
        data: {
          ...${defaultVariableName},
          ...args.data,
        }
      })
    `,
  })
}
