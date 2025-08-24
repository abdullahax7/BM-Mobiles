import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: any
}

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
  
  // Use Accelerate when DATABASE_URL contains 'accelerate.prisma-data.net'
  if (process.env.DATABASE_URL?.includes('accelerate.prisma-data.net')) {
    return client.$extends(withAccelerate()) as any
  }
  
  return client
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
