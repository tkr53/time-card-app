import { formatTime } from '@/utils/time'

interface CurrentTimeProps {
  className?: string
}

/**
 * Server Componentとして実装された現在時刻表示
 * 初期値はサーバーで生成され、クライアント側でリアルタイム更新される
 */
export function CurrentTime({ className = '' }: CurrentTimeProps) {
  const currentTime = new Date()
  const formattedTime = formatTime(currentTime)
  
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayName = dayNames[date.getDay()]
    
    return `${year}年${month}月${day}日（${dayName}）`
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="text-6xl md:text-7xl font-mono font-bold text-blue-600 dark:text-blue-400 mb-2">
        {formattedTime}
      </div>
      <div className="text-lg text-gray-600 dark:text-gray-300">
        {formatDate(currentTime)}
      </div>
    </div>
  )
}
