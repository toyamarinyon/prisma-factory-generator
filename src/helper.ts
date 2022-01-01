import * as faker from 'faker'
import { DMMF } from '@prisma/client/runtime'

export function fakerForStringField(fieldName: string) {
  const nameFieldFakers = Object.keys(faker.name)
  if (nameFieldFakers.includes(fieldName)) {
    return `faker.name.${fieldName}()`
  }
  const internetFakers = Object.keys(faker.internet)
  if (internetFakers.includes(fieldName)) {
    return `faker.internet.${fieldName}()`
  }
  return 'faker.name.title()'
}

export function fakerForField(field: DMMF.Field) {
  const fieldType = field.type
  const fieldKind = field.kind
  if (fieldType === 'String') {
    return fakerForStringField(field.name)
  }
  if (fieldType === 'Int' || fieldType === 'BigInt') {
    return 'faker.datatype.number()'
  }
  if (fieldType === 'Float') {
    return 'faker.datatype.float()'
  }
  if (fieldType === 'Decimal') {
    return 'faker.datatype.hexaDecimal()'
  }
  if (fieldType === 'DateTime') {
    return 'faker.datatype.datetime()'
  }
  if (fieldType === 'Boolean') {
    return (field.default as string) ?? false
  }
  throw new Error(`${fieldType} isn't support now. kind: ${fieldKind}`)
}
