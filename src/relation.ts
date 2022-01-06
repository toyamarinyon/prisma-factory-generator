import { DMMF } from '@prisma/client/runtime'

export function getRelationFields(model: DMMF.Model, models: DMMF.Model[]) {
  return model.fields
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
      return field.name
    })
}

export function hasRequiredRelation(model: DMMF.Model, models: DMMF.Model[]) {
  return model.fields
    .filter((field) => field.kind === 'object')
    .some((field) => {
      return field.isRequired && !field.isList
    })
}
