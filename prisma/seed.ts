import {
  createUser,
  createPost,
  createComment,
  inputsForUser,
} from '.prisma/factory'
async function main() {
  const user = await createUser()
  console.log(user)

  const postConnectUser = await createPost({
    user: {
      connect: {
        id: user.id,
      },
    },
  })
  console.log(postConnectUser)

  const postCreateUser = await createPost({
    user: {
      create: inputsForUser(),
    },
  })
  console.log(postCreateUser)

  const comment = await createComment({
    user: {
      connect: {
        id: user.id,
      },
    },
    post: {
      connect: {
        id: postConnectUser.id,
      },
    },
  })
  console.log(comment)
}

main().catch((e) => console.error(e.toString()))
