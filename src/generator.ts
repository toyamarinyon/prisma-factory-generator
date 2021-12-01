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

export function getModelFactoryParameterInterfaceProperties(model: DMMF.Model) {
  return Object.fromEntries(
    model.fields
      .filter((field) => field.kind === 'object')
      .map((field) => {
        return [
          field.isRequired ? field.name : `${field.name}?`,
          `Prisma.${camelcase(
            [field.name, 'CreateNestedOneWithout', model.name, 'Input'],
            {
              pascalCase: true,
            }
          )}`,
        ]
      })
  )
}
function getModelFactoryParameterInterfaceName(model: DMMF.Model) {
  return camelcase(['RequiredParametersFor', model.name, 'creation'], { pascalCase: true })
}
export function addModelFactoryParameterInterface(
  sourceFile: SourceFile,
  model: DMMF.Model
) {
  const properties = getModelFactoryParameterInterfaceProperties(model)
  sourceFile.addInterface({
    name: getModelFactoryParameterInterfaceName(model),
    properties: Object.keys(properties).map((key) => ({
      name: key,
      type: properties[key],
    })),
  })
}

export function getModelDefaultValueVariableInitializer(model: DMMF.Model) {
  return Object.fromEntries(
    model.fields
      .filter((field) => !field.isId)
      .filter((field) => field.kind === 'scalar')
      .filter((field) => {
        return !model.fields.find((it) => {
          return it.relationFromFields?.includes(field.name)
        })
      })
      .filter((field) => !field.hasDefaultValue)
      .map((field) => [field.name, fakerForField(field)])
  )
}
export function addModelDefaultValueVariableStatement(
  sourceFile: SourceFile,
  model: DMMF.Model
) {
  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [
      {
        name: getDefaultVariableName(model),
        initializer: Writers.object(
          getModelDefaultValueVariableInitializer(model)
        ),
      },
    ],
    leadingTrivia: '\r\n',
  })
}

function getDefaultVariableName(model: DMMF.Model) {
  return camelcase([model.name, 'DefaultVariables'])
}
export function addModelFactoryDeclaration(
  sourceFile: SourceFile,
  model: DMMF.Model
) {
  const modelName = model.name
  addModelDefaultValueVariableStatement(sourceFile, model)
  addModelFactoryParameterInterface(sourceFile, model)
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
          ...${getDefaultVariableName(model)},
          ...args.data,
        }
      })
    `,
  })
}
