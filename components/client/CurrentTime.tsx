'use client'

import { useState, useEffect } from 'react'

interface CurrentTimeProps {
  initialTime: string
  initialDate: string
  className?: string
}

/**
 * クライアント側でリアルタイム更新される現在時刻コンポーネント
 */
export function CurrentTime({ initialTime, initialDate, className = '' }: CurrentTimeProps) {
  const [currentTime, setCurrentTime] = useState(initialTime)
  const [currentDate, setCurrentDate] = useState(initialDate)

  // クライアント側での時刻フォーマット関数
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const formattedTime = formatTime(now)
      
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const dayNames = ['日', '月', '火', '水', '木', '金', '土']
      const dayName = dayNames[now.getDay()]
      const formattedDate = `${year}年${month}月${day}日（${dayName}）`
      
      setCurrentTime(formattedTime)
      setCurrentDate(formattedDate)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl md:text-7xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
        {currentTime}
      </div>
      <div className="text-lg text-gray-600 dark:text-gray-300">
        {currentDate}
      </div>
    </div>
  )
}
