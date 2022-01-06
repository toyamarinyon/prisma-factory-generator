import { getDMMF } from '@prisma/sdk'
import { DMMF } from '@prisma/generator-helper'
import { getRelationFields, hasRequiredRelation } from '../relation'

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
let postModel: DMMF.Model

beforeAll(async () => {
  dmmf = await getDMMF({ datamodel })
  const models = dmmf.datamodel.models
  userModel = models[0]
  accessTokenModel = models[1]
  postModel = models[2]
})

test('get relation field', () => {
  const models = dmmf.datamodel.models
  const userRelationFields = getRelationFields(userModel, models)
  expect(userRelationFields.sort()).toEqual(['posts', 'accessToken'].sort())

  const accessTokenRelationFields = getRelationFields(accessTokenModel, models)
  expect(accessTokenRelationFields).toStrictEqual(['user'])

  const postRelationFields = getRelationFields(postModel, models)
  expect(postRelationFields).toStrictEqual(['user'])
})

test('has required relation', () => {
  const models = dmmf.datamodel.models
  const userHasRequiredRelation = hasRequiredRelation(userModel, models)
  expect(userHasRequiredRelation).toBeFalsy()

  const accessTokenHasRequiredRelation = hasRequiredRelation(
    accessTokenModel,
    models
  )
  expect(accessTokenHasRequiredRelation).toBeTruthy()

  const postHasRequiredRelation = hasRequiredRelation(
    postModel,
    models
  )
  expect(postHasRequiredRelation).toBeTruthy()
})
