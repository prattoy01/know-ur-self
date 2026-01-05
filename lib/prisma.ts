import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import Database from 'better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? (() => {
  const connectionString = process.env.DATABASE_URL ?? "file:./dev.db"
  // Assuming the adapter handles the connection creation if passed specific options?
  // Or maybe I need to import something else?
  // Let's try passing the object linter asked for.
  const adapter = new PrismaBetterSqlite3({ url: connectionString })
  return new PrismaClient({ adapter })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
