"use server"

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

const prisma = new PrismaClient()

export async function registerUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string

  if (!email || !name || !password) {
    throw new Error("すべてのフィールドを入力してください")
  }

  if (password.length < 6) {
    throw new Error("パスワードは6文字以上で入力してください")
  }

  // メールアドレスの重複チェック
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error("このメールアドレスは既に登録されています")
  }

  // パスワードをハッシュ化
  const hashedPassword = await bcrypt.hash(password, 12)

  try {
    // ユーザーを作成
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    return { success: true, message: "登録が完了しました。ログインしてください。" }
  } catch (error) {
    console.error("User registration error:", error)
    throw new Error("ユーザー登録に失敗しました")
  }
}
