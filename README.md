Automatically generate a factory from your Prisma Schema. This package contains a prisma generator so reference will automatically update everytime you will run `prisma generate`

There is a scheme that looks like this
```
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

generator factory {
  provider = "node ./dist/index.js"
}

model User {
  id       Int       @id @default(autoincrement())
  email    String    @unique
  userName String    @unique
  posts    Post[]
  comments Comment[]

  @@map(name: "users")
}

model Post {
  id        Int       @id @default(autoincrement())
  user      User      @relation(fields: [userId], references: [id])
  userId    Int       @unique @map(name: "user_id")
  title     String
  body      String
  createdAt DateTime  @default(now()) @map(name: "created_at")
  updatedAt DateTime  @default(now()) @map(name: "updated_at")
  comments  Comment[]

  @@map("posts")
}

model Comment {
  id        Int      @id @default(autoincrement())
  post      Post     @relation(fields: [postId], references: [id])
  postId    Int      @unique @map(name: "post_id")
  user      User     @relation(fields: [userId], references: [id])
  userId    Int      @unique @map(name: "user_id")
  body      String
  createdAt DateTime @default(now()) @map(name: "created_at")
  approved  Boolean  @default(false)

  @@map("comments")
}
```
After running `npx prisma generate`, the following functions will be available.
- createUser
- createPost
- createComment

The scalar fields are set to random values by [faker](https://github.com/marak/Faker.js/).
Currently, the relation field needs to be set manually (we would like to create an option for it to be created automatically).
```typescript

// Create a user (email and userName are will be created by faker)
const user = await createUser()
console.log(user) 
/**
 * {
 *   id: 1,
 *   email: 'National Directives Orchestrator',
 *   userName: 'Future Accountability Consultant'
 * }
 */

// Create a post (the title and body will be created by faker, and the user will be connected to the one created above).
const post = await createPost({
  user: {
    connect: {
      id: user.id,
    },
  },
})
console.log(post)
/**
 * {
 *  id: 1,
 *  userId: 1,
 *  title: 'Dynamic Research Architect',
 *  body: 'Corporate Tactics Associate',
 *  createdAt: 2021-12-02T09:10:06.640Z,
 *  updatedAt: 2021-12-02T09:10:06.640Z
 *  }
 */


// Create a comment (the body will be created by faker, the approved will be set to the DB default, and the user and post will be connected to the one created above).
const comment = await createComment({
  user: {
    connect: {
      id: user.id,
    },
  },
  post: {
    connect: {
      id: post.id,
    },
  },
})
console.log(comment)
/**
 * {
 *  id: 1,
 *  postId: 1,
 *  userId: 1,
 *  body: 'Human Security Consultant',
 *  createdAt: 2021-12-02T09:10:06.643Z,
 *  approved: false
 *  }
 */
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
- [ ] attributesForUser
- [ ] createUserCollection

---

### License

MIT

(This is not an official Prisma project. It is personally maintained by [me](https://github.com/toyamarinyon) )
