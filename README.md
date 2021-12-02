Automatically generate a factory from your Prisma Schema. This package contains a prisma generator so reference will automatically update everytime you will run `prisma generate`

There is a scheme that looks like this
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

generator factory {
  provider = "prisma-factory-generator"
}

model User {
  id          Int          @id @default(autoincrement())
  email       String       @unique
  createdAt   DateTime     @default(now()) @map(name: "created_at")
  updatedAt   DateTime     @default(now()) @map(name: "updated_at")
  uuid        String       @unique @default(uuid())

  @@map(name: "users")
}
```
After running `npx prisma generate`, the createUser function will be available. The fields in the User model are set to random values by [faker](https://github.com/marak/Faker.js/).
```typescript
import { createUser } from '.prisma/factory'

createUser()
```

## Getting Started

1. Install this package using:

```shell
npm install prisma-factory-generator
```
or
```shell
yarn add prisma-factory-generator
```

2. Add the generator to the schema

```prisma
generator factory {
  provider = "prisma-factory-generator"
}
```

3. Run `npx prisma generate` to trigger the generator. This will create a `factory` folder in `node_modules/.prisma/factory`

## To Do
- [x] relation factory
  - [x] one to one
  - [x] one to many
  - [x] many to many

---

### License

MIT

(This is not an official Prisma project. It is personally maintained by [me](https://github.com/toyamarinyon) )
