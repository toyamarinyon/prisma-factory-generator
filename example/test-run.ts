import {
  createUser,
  createPost,
  createComment,
  inputsForUser,
} from '.prisma/factory'
async function main() {
  const user = await createUser()
  console.log(user)

  const newUser = await createUser({
    data: { userName: 'hello!' },
  })
  console.log(newUser)

  const postConnectUser = await createPost({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })
  console.log(postConnectUser)

  const postCreateUser = await createPost({
    data: {
      user: {
        create: inputsForUser(),
      },
    },
  })
  console.log(postCreateUser)

  const comment = await createComment({
    data: {
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
    },
  })
  console.log(comment)
}

main()
  .then(() => {
    console.info('factory created!')
  })
  .catch((e) => console.error(e.toString()))
