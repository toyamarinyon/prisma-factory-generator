import { DMMF } from '@prisma/client/runtime'
import camelcase from 'camelcase'
import { fakerForField } from './helper'
import { SourceFile, VariableDeclarationKind, Writers } from 'ts-morph'
import pluralize from 'pluralize'

function getModelFactoryParameterTypeName(model: DMMF.Model) {
  return camelcase(['create', model.name, 'Args'])
}
export function addModelFactoryParameterType(
  sourceFile: SourceFile,
  model: DMMF.Model
) {
  sourceFile.addStatements(
    `type ${getModelFactoryParameterTypeName(
      model
    )} = ${getModelFactoryParameterInterfaceName(
      model
    )} & Partial<Prisma.${camelcase([model.name, 'CreateArgs'], {
      pascalCase: true,
    })}>`
  )
}

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

export function getModelFactoryParameterInterfaceProperties(
  model: DMMF.Model,
  models: DMMF.Model[]
) {
  return Object.fromEntries(
    model.fields
      .filter((field) => field.kind === 'object')
      .map((field) => {
        const relationKind = field.isList ? 'many' : 'one'
        const isOptional = !field.isRequired || field.isList
        const relationDest = models.find((m) => {
          if (m.name === model.name) {
            return false
          }
          return m.fields.find((f) => f.relationName === field.relationName)
        })
        if (!relationDest) {
          throw new Error(
            `missing relation dest error, model: ${model.name}, field: ${field.name}`
          )
        }

        const relationField = relationDest?.fields.find(
          (f) => f.relationName === field.relationName
        )
        if (!relationField) {
          throw new Error('missing relation field error')
        }

        return [
          isOptional ? `${field.name}?` : field.name,
          `Prisma.${camelcase(
            [
              relationKind === 'one' ? field.name : field.type.toString(),
              'CreateNested',
              relationKind,
              'Without',
              relationField.name,
              'Input',
            ],
            {
              pascalCase: true,
            }
          )}`,
        ]
      })
  )
}
function getModelFactoryParameterInterfaceName(model: DMMF.Model) {
  return camelcase(['RequiredParametersFor', model.name, 'creation'], {
    pascalCase: true,
  })
}
export function addModelFactoryParameterInterface(
  sourceFile: SourceFile,
  model: DMMF.Model,
  models: DMMF.Model[]
) {
  const properties = getModelFactoryParameterInterfaceProperties(model, models)
  sourceFile.addInterface({
    name: getModelFactoryParameterInterfaceName(model),
    properties: Object.keys(properties).map((key) => ({
      name: key,
      type: properties[key],
    })),
  })
  return Object.keys(properties).some((key) => !key.endsWith('?'))
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
  model: DMMF.Model,
  models: DMMF.Model[]
) {
  const modelName = model.name
  addModelDefaultValueVariableStatement(sourceFile, model)
  addModelFactoryParameterType(sourceFile, model)
  const hasRequiredParameters = addModelFactoryParameterInterface(
    sourceFile,
    model,
    models
  )
  sourceFile.addFunction({
    isExported: true,
    isAsync: true,
    name: camelcase(['create', modelName]),
    parameters: [
      {
        name: hasRequiredParameters ? 'args' : 'args?',
        type: `${getModelFactoryParameterTypeName(model)}`,
      },
    ],
    statements: `
      return await prisma.${camelcase(modelName)}.create({
        data: {
          ...${getDefaultVariableName(model)},
          ...args,
        }
      })
    `,
  })
}
