"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function registerUser(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const password = formData.get("password") as string

    // 入力値の検証
    if (!email || !name || !password) {
      return { success: false, message: "すべてのフィールドを入力してください" }
    }

    if (password.length < 6) {
      return { success: false, message: "パスワードは6文字以上で入力してください" }
    }

    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, message: "このメールアドレスは既に登録されています" }
    }

    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12)

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
    return { success: false, message: "ユーザー登録に失敗しました。しばらく時間をおいて再度お試しください。" }
  }
}
