'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * グローバルナビゲーションバーコンポーネント
 */
export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  
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
          
          <ul className="flex space-x-1 md:space-x-4">
            {navLinks.map(link => (
              <li key={link.href}>
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
          </ul>
        </nav>
      </div>
    </header>
  );
}
