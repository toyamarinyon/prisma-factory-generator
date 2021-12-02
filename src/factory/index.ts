import { PrismaClient } from "@prisma/client"
import { Prisma } from ".prisma/client"
import faker from "faker"
const prisma = new PrismaClient()

export const userDefaultVariables = {
  email: faker.name.title(),
  userName: faker.name.title()
}
type createUserArgs = RequiredParametersForUserCreation & Partial<Prisma.UserCreateArgs>

interface RequiredParametersForUserCreation {
  posts?: Prisma.PostCreateNestedManyWithoutUserInput
  comments?: Prisma.CommentCreateNestedManyWithoutUserInput
}

export async function createUser(args?: createUserArgs) {

  return await prisma.user.create({
    data: {
      ...userDefaultVariables,
      ...args,
    }
  })

}


export const postDefaultVariables = {
  title: faker.name.title(),
  body: faker.name.title()
}
type createPostArgs = RequiredParametersForPostCreation & Partial<Prisma.PostCreateArgs>

interface RequiredParametersForPostCreation {
  user: Prisma.UserCreateNestedOneWithoutPostsInput
  comments?: Prisma.CommentCreateNestedManyWithoutPostInput
}

export async function createPost(args: createPostArgs) {

  return await prisma.post.create({
    data: {
      ...postDefaultVariables,
      ...args,
    }
  })

}


export const commentDefaultVariables = {
  body: faker.name.title()
}
type createCommentArgs = RequiredParametersForCommentCreation & Partial<Prisma.CommentCreateArgs>

interface RequiredParametersForCommentCreation {
  post: Prisma.PostCreateNestedOneWithoutCommentsInput
  user: Prisma.UserCreateNestedOneWithoutCommentsInput
}

export async function createComment(args: createCommentArgs) {

  return await prisma.comment.create({
    data: {
      ...commentDefaultVariables,
      ...args,
    }
  })

}
