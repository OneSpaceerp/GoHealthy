import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL

  // During build time, DATABASE_URL might not be available
  // Return a dummy client that will be replaced at runtime
  if (!connectionString) {
    console.warn('DATABASE_URL not set, using placeholder Prisma client')
    // Create client without adapter for build-time type checking
    return new PrismaClient()
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

// Lazy initialization - only create when first accessed
let prismaInstance: PrismaClient | undefined

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!prismaInstance) {
      prismaInstance = globalForPrisma.prisma ?? createPrismaClient()
      if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.prisma = prismaInstance
      }
    }
    return (prismaInstance as Record<string | symbol, unknown>)[prop]
  }
})

export default prisma
