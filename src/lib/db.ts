import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const client = new PrismaClient()
  
  // Only use Accelerate in production when DATABASE_URL starts with prisma://
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL?.startsWith('prisma')) {
    return client.$extends(withAccelerate())
  }
  
  return client
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
