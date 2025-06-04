import { PrismaClient } from '@prisma/client'

// PrismaClientのグローバルインスタンス
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 開発環境では接続を再利用し、本番環境では新しいインスタンスを作成
export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
