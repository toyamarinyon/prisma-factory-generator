import { getDMMF } from "@prisma/sdk";

const datamodel = /* Prisma */ `
  model Post {
    id String @id @default(cuid())
    name String
    @@index([name])
  }

  model User {
    userId String @id @default(cuid())
    something String
  }
`;

test("getDMMF", async () => {
  const dmmf = await getDMMF({ datamodel });
  expect(dmmf).toMatchSnapshot();
});
