import { getDMMF } from '@prisma/sdk'
import { DMMF } from '@prisma/generator-helper'
import { getRelationFields } from '../relation'
import { args } from '../args'
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

model Lecture {
  id        Int       @id @default(autoincrement())
  title     String
}
`

let dmmf: DMMF.Document
let userModel: DMMF.Model
let accessTokenModel: DMMF.Model
let postModel: DMMF.Model
let lectureModel: DMMF.Model

beforeAll(async () => {
  dmmf = await getDMMF({ datamodel })
  const models = dmmf.datamodel.models
  userModel = models[0]
  accessTokenModel = models[1]
  postModel = models[2]
  lectureModel = models[3]
})

test('print type definition', () => {
  const models = dmmf.datamodel.models
  const project = new Project()

  const userSource = project.createSourceFile('tmp1')
  const userFactoryArgs = `
type UserFactoryArgs = Omit<Prisma.UserCreateArgs, 'data'> & {
  data: Pick<Prisma.UserCreateInput, 'accessToken'|'posts'> & Partial<Omit<Prisma.UserCreateInput, 'accessToken'|'posts'>>
}
`
  args(userSource, userModel, models)
  expect(userSource.getFullText()).toEqual(userFactoryArgs)

  const accessTokenSource = project.createSourceFile('tmp2')
  const accessTokenArgs = `
type AccessTokenFactoryArgs = Omit<Prisma.AccessTokenCreateArgs, 'data'> & {
  data: Pick<Prisma.AccessTokenCreateInput, 'user'> & Partial<Omit<Prisma.AccessTokenCreateInput, 'user'>>
}
`
  args(accessTokenSource, accessTokenModel, models)
  expect(accessTokenSource.getFullText()).toEqual(accessTokenArgs)

  const postSource = project.createSourceFile('tmp3')
  const postArgs = `
type PostFactoryArgs = Omit<Prisma.PostCreateArgs, 'data'> & {
  data: Pick<Prisma.PostCreateInput, 'user'> & Partial<Omit<Prisma.PostCreateInput, 'user'>>
}
`
  args(postSource, postModel, models)
  expect(postSource.getFullText()).toEqual(postArgs)

  const lectureSource = project.createSourceFile('tmp4')
  const lectureArgs = `
type LectureFactoryArgs = Omit<Prisma.LectureCreateArgs, 'data'> & {
  data: Partial<Prisma.LectureCreateInput>
}
`
  args(lectureSource, lectureModel, models)
  expect(lectureSource.getFullText()).toEqual(lectureArgs)

})
