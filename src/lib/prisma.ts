import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Lazy initialization - only create when DATABASE_URL is available
function getPrismaClient(): PrismaClient {
  if (global.prisma) {
    return global.prisma
  }

  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please configure your database connection in Vercel environment variables.'
    )
  }

  // Dynamic import to avoid build-time issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Pool } = require('pg')
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaPg } = require('@prisma/adapter-pg')

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  const client = new PrismaClient({ adapter })

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = client
  }

  return client
}

// Export a proxy that lazily initializes the client
const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

export { prisma }
export default prisma
