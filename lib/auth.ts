/**
 * 認証関連のユーティリティ関数
 */
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { User } from '@/types'
import { auth } from "@/auth"

/**
 * パスワードをハッシュ化
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12)
}

/**
 * パスワードを検証
 */
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * NextAuth v5セッションを検証してユーザー情報を取得
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  } catch {
    return null
  }
}

/**
 * 有効期限切れのセッションを削除
 */
export const cleanupExpiredSessions = async (): Promise<void> => {
  await prisma.session.deleteMany({
    where: {
      expires: {
        lt: new Date()
      }
    }
  })
}

/**
 * メールアドレスの形式を検証
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * パスワード強度を検証
 */
export const isValidPassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'パスワードは8文字以上で入力してください' }
  }
  
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    return { valid: false, message: 'パスワードは英数字を含む必要があります' }
  }
  
  return { valid: true }
}

/**
 * NextAuth v5のauth関数を再エクスポート
 */
export { auth }
