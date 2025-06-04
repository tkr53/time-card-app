import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/client/Navbar";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "出退勤管理アプリ",
  description: "勤務時間の記録と管理を行うアプリケーション",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-50`}
      >
        <Providers>
          <Navbar />
          <div className="min-h-screen">
            {children}
          </div>
          <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            © 2025 出退勤管理アプリ
          </footer>
        </Providers>
      </body>
    </html>
  );
}
