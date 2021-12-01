import { getDMMF } from '@prisma/sdk'
import {
  addModelFactoryParameterInterface,
  addModelFactoryParameterType,
  getModelFactoryParameterInterfaceProperties,
} from '../generator'
import { DMMF } from '@prisma/generator-helper'
import { Project } from 'ts-morph'

const datamodel = /* Prisma */ `
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  accessToken AccessToken?

  @@map(name: "users")
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
let accessTokenInterfaceProperties: Record<string, any>
let userInterfaceProperties: Record<string, any>

beforeAll(async () => {
  dmmf = await getDMMF({ datamodel })
  userModel = dmmf.datamodel.models[0]
  accessTokenModel = dmmf.datamodel.models[1]
  userInterfaceProperties =
    getModelFactoryParameterInterfaceProperties(userModel)
  accessTokenInterfaceProperties =
    getModelFactoryParameterInterfaceProperties(accessTokenModel)
})

test('snapshot', () => {
  const project = new Project()
  const userSourceFile = project.createSourceFile('user')
  addModelFactoryParameterType(userSourceFile, userModel)
  expect(userSourceFile.getText()).toMatchSnapshot()

  const accessTokenSourceFile = project.createSourceFile('accessToken')
  addModelFactoryParameterType(accessTokenSourceFile, accessTokenModel)
  expect(accessTokenSourceFile.getText()).toMatchSnapshot()
})
