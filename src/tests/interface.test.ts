import { getDMMF } from '@prisma/sdk'
import {
  addModelFactoryParameterInterface,
  getModelFactoryParameterInterfaceProperties,
} from '../generator'
import { DMMF } from '@prisma/generator-helper'
import { Project } from 'ts-morph'

const datamodel = /* Prisma */ `
model User {
  id    Int    @id @default(autoincrement())
  email String @unique
  accessToken AccessToken?
  posts Post[]

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

model Post {
  id        Int       @id @default(autoincrement())
  user      User      @relation(fields: [userId], references: [id])
  userId    Int       @unique @map(name: "user_id")
  body      String

  @@map("posts")
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

test('@id field is not generate', () => {
  expect(accessTokenInterfaceProperties.id).toBeUndefined()
})

test('@relation field is generate', () => {
  console.info(accessTokenInterfaceProperties)
  expect(accessTokenInterfaceProperties.user).toBeDefined()
  expect(accessTokenInterfaceProperties.user).toBe(
    'Prisma.UserCreateNestedOneWithoutAccessTokenInput'
  )
})

test('Scalar field is not generate', () => {
  expect(accessTokenInterfaceProperties.userId).toBeUndefined()
  expect(accessTokenInterfaceProperties.createdAt).toBeUndefined()
  expect(accessTokenInterfaceProperties.isActive).toBeUndefined()
})

test('optional @relation field is generate', () => {
  expect(userInterfaceProperties['accessToken?']).toBe(
    'Prisma.AccessTokenCreateNestedOneWithoutUserInput'
  )
})

test('list field is generate as optional', () => {
  console.info(userInterfaceProperties)
  expect(userInterfaceProperties['posts?']).toBe(
    'Prisma.PostsCreateNestedManyWithoutUserInput'
  )
})

test('snapshot', () => {
  const project = new Project()
  const userInterfaceFile = project.createSourceFile('tmp1')
  addModelFactoryParameterInterface(userInterfaceFile, userModel)
  expect(userInterfaceFile.getText()).toMatchSnapshot()

  const accessToken = project.createSourceFile('tmp2')
  addModelFactoryParameterInterface(accessToken, accessTokenModel)
  expect(accessToken.getText()).toMatchSnapshot()
})

// test('dmmf snapshot', async () => {
//   const dmmf = await getDMMF({ datamodel })
//   expect(dmmf).toMatchSnapshot()
// })
