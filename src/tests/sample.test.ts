import { getDMMF } from '@prisma/sdk'
import {
  addModelFactoryDeclaration,
  addPrismaImportDeclaration,
} from '../generator'
import { Project, ts } from 'ts-morph'
const datamodel = /* Prisma */ `
model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  createdAt   DateTime     @default(now()) @map(name: "created_at")
  updatedAt   DateTime     @default(now()) @map(name: "updated_at")
  accessToken AccessToken?
  uuid        String       @unique @default(uuid())

  @@map(name: "users")
}

model AccessToken {
  id         Int      @id @default(autoincrement())
  user       User     @relation(fields: [userId], references: [id])
  userId     Int      @unique @map(name: "user_id")
  createdAt  DateTime @default(now()) @map(name: "created_at")
  paidAmount Int      @map(name: "paid_amount")
  isActive   Boolean  @default(false)

  @@map("access_tokens")
}
`

test('generate model', async () => {
  const project = new Project({})
  const sourceFile = project.createSourceFile('./src/test-src.ts')
  const dmmf = await getDMMF({ datamodel })
  addPrismaImportDeclaration(sourceFile)
  dmmf.datamodel.models.forEach((model) => {
    addModelFactoryDeclaration(sourceFile, model)
  })

  sourceFile.formatText({
    indentSize: 2,
    semicolons: ts.SemicolonPreference.Remove,
  })
  expect(sourceFile.getFullText()).toMatchSnapshot()
})
