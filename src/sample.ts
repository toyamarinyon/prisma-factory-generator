import { PrismaClient } from '@prisma/client'
import { Prisma } from '.prisma/client'
const prisma = new PrismaClient()

prisma.user.create({
  data: {
    uuid: 'helo',
    firebaseUserId: 'fi',
    email: 'test',
    accessToken: 'hello',
  },
})

prisma.accessToken.create({
  data: {
    user: {
      create: {
        firebaseUserId
      }
    }
  }
})