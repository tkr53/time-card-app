'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

/**
 * グローバルナビゲーションバーコンポーネント
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  
  // スクロール監視
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navLinks = [
    { name: 'ホーム', href: '/' },
    { name: '履歴', href: '/history' },
    { name: 'カレンダー', href: '/calendar' },
  ];
  
  return (
    <header 
      className={`sticky top-0 z-10 w-full transition-all duration-200 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 shadow backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="text-xl font-bold text-gray-800 dark:text-white">
            打刻アプリ
          </Link>
          
          <ul className="flex items-center space-x-2 md:space-x-4">
            {session ? (
              <>
                {navLinks.map(link => (
                  <li key={link.href} className="hidden sm:block">
                    <Link 
                      href={link.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        pathname === link.href 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                {/* モバイル用ドロップダウンメニュー */}
                <li className="block sm:hidden relative">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                  </div>
                </li>
                <li className="flex items-center space-x-2 md:space-x-3">
                  {/* ユーザー情報表示 */}
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl px-3 py-2 shadow-sm border border-gray-200 dark:border-gray-600">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {session.user?.name?.charAt(0)?.toUpperCase() || session.user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate max-w-24 md:max-w-32">
                        {session.user?.name || session.user?.email?.split('@')[0] || 'ユーザー'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ログイン中
                      </div>
                    </div>
                  </div>
                  
                  {/* ログアウトボタン */}
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 transition-all duration-200 group border border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                    title="ログアウト"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                      />
                    </svg>
                    <span className="hidden md:block">ログアウト</span>
                  </button>
                </li>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" 
                    />
                  </svg>
                  <span className="hidden sm:block">ログイン</span>
                </Link>
                
                <Link
                  href="/register"
                  className="flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-4 w-4" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" 
                    />
                  </svg>
                  <span className="hidden sm:block">新規登録</span>
                </Link>
              </div>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
