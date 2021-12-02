import { createUser, createPost, createComment } from '.prisma/factory'
async function main() {
  const user = await createUser()
  const post = await createPost({
    user: {
      connect: {
        id: user.id,
      },
    },
  })
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
}

main()
  .then(() => {
    console.info('factory created!')
  })
  .catch((e) => console.error(e.toString()))
