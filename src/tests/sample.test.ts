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
  accessToken AccessToken?

  @@map(name: "users")
}

model AccessToken {
  id          Int       @id @default(autoincrement())
  user        User      @relation(fields: [userId], references: [id])
  userId      Int       @unique @map(name: "user_id")

  @@map("access_tokens")
}
`

// test('dmmf snapshot', async() => {
//   const dmmf = await getDMMF({ datamodel })
//   expect(dmmf).toMatchSnapshot()
// })
test('generate model', async () => {
  const project = new Project({})
  const sourceFile = project.createSourceFile('./src/test-src.ts')
  const dmmf = await getDMMF({ datamodel })
  addPrismaImportDeclaration(sourceFile)
  dmmf.datamodel.models.forEach((model) => {
    addModelFactoryDeclaration(sourceFile, model, dmmf.datamodel.models)
  })

  sourceFile.formatText({
    indentSize: 2,
    semicolons: ts.SemicolonPreference.Remove,
  })
  expect(sourceFile.getFullText()).toMatchSnapshot()
})
