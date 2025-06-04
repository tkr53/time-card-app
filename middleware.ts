import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // 認証が必要なページのパス
  const protectedPaths = ["/", "/history", "/calendar"]
  
  // 認証済みユーザーがアクセスできないページ（ログイン・登録ページ）
  const authPages = ["/login", "/register"]

  const isProtectedPath = protectedPaths.some(path => 
    nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
  )
  
  const isAuthPage = authPages.some(path => 
    nextUrl.pathname === path || nextUrl.pathname.startsWith(`${path}/`)
  )

  // 未認証ユーザーが保護されたページにアクセスしようとした場合
  if (!isLoggedIn && isProtectedPath) {
    return Response.redirect(new URL("/login", nextUrl))
  }

  // 認証済みユーザーがログイン・登録ページにアクセスしようとした場合
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", nextUrl))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
