import { DMMF } from '@prisma/client/runtime'
import camelcase from 'camelcase'
import { SourceFile } from 'ts-morph'
import { getRelationFields, hasRequiredRelation } from './relation'

export function factoryArgsTypeName(model: DMMF.Model) {
  return camelcase([model.name, 'factory', 'args'], {
    pascalCase: true,
  })
}
export function args(
  sourceFile: SourceFile,
  model: DMMF.Model,
  models: DMMF.Model[]
) {
  const createArgsTypeName = camelcase([model.name, 'create', 'args'], {
    pascalCase: true,
  })
  const createInputTypeName = camelcase([model.name, 'create', 'input'], {
    pascalCase: true,
  })
  const relationFields = getRelationFields(model, models)
  const isRequire = hasRequiredRelation(model, models)
  sourceFile.addStatements(`
type ${factoryArgsTypeName(
    model
  )} = Omit<Prisma.${createArgsTypeName}, 'data'> & {
  data: Pick<Prisma.${createInputTypeName}, '${relationFields.join(
    "'|'"
  )}'> & Partial<Omit<Prisma.${createInputTypeName}, '${relationFields.join(
    "'|'"
  )}'>>
}${isRequire ? '' : ' | undefined'}`)
}
