import { getDMMF } from '@prisma/sdk'
import {
  addModelAttributeForFunction,
  getModelDefaultValueVariableInitializer,
} from '../generator'
import { DMMF } from '@prisma/generator-helper'
import { Project } from 'ts-morph'

const datamodel = /* Prisma */ `
model User {
  id    Int    @id @default(autoincrement())
  email String @unique

  @@map(name: "users")
  AccessToken AccessToken[]
}

model AccessToken {
  id        Int      @id @default(autoincrement())
  user      User     @relation(fields: [userId], references: [id])
  userId    Int      @unique @map(name: "user_id")
  createdAt DateTime @default(now()) @map(name: "created_at")
  isActive  Boolean  @default(false)

  @@map("access_tokens")
}
`

let dmmf: DMMF.Document
let userModel: DMMF.Model
let accessTokenModel: DMMF.Model
let initializer: Record<string, any>

beforeAll(async () => {
  dmmf = await getDMMF({ datamodel })
  userModel = dmmf.datamodel.models[0]
  accessTokenModel = dmmf.datamodel.models[1]
  initializer = getModelDefaultValueVariableInitializer(accessTokenModel)
})

test('@id field is not generate', () => {
  expect(initializer.id).toBeUndefined()
})

test('@relation field is not generate', () => {
  expect(initializer.user).toBeUndefined()
})

test('@relation id field is not generate', () => {
  expect(initializer.userId).toBeUndefined()
})

test('set @default field is not generate', () => {
  expect(initializer.createdAt).toBeUndefined()
  expect(initializer.isActive).toBeUndefined()
})

test('snapshot', () => {
  const project = new Project()
  const sourceFile = project.createSourceFile('tmp')
  addModelAttributeForFunction(sourceFile, userModel)
  expect(sourceFile.getText()).toMatchSnapshot()
})
