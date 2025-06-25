import Link from 'next/link'
import { getTodayStatus } from '@/app/actions/timeRecord'
import { formatTime } from '@/utils/time'
import { CurrentTime as ClientCurrentTime } from '@/components/client/CurrentTime'
import { ClockButton } from '@/components/server/ClockButton'
import { TodayStatus } from '@/components/server/TodayStatus'
import { ClockHistory } from '@/components/server/ClockHistory'
import { WorkSummary } from '@/components/server/WorkSummary'

// 動的レンダリングを強制してキャッシュを回避
export const dynamic = 'force-dynamic'

/**
 * メインページ - Server Component
 */
export default async function Home() {
  const status = await getTodayStatus()
  const currentTime = new Date()
  const formattedTime = formatTime(currentTime)
  
  // 日付フォーマット関数
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const dayNames = ['日', '月', '火', '水', '木', '金', '土']
    const dayName = dayNames[date.getDay()]
    
    return `${year}年${month}月${day}日（${dayName}）`
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'not-clocked-in':
        return { text: '出勤前', color: 'text-gray-600' }
      case 'clocked-in':
        return { text: '勤務中', color: 'text-blue-600' }
      case 'clocked-out':
        return { text: '退勤済み', color: 'text-green-600' }
      default:
        return { text: '状態不明', color: 'text-gray-600' }
    }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            出退勤管理
          </h1>
          <div className={`text-xl font-semibold ${statusMessage.color}`}>
            {statusMessage.text}
          </div>
        </header>

        <main className="space-y-12">
          {/* 現在時刻表示 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <ClientCurrentTime 
              initialTime={formattedTime}
              initialDate={formatDate(currentTime)}
              className="mb-4"
            />
          </section>

          {/* 打刻ボタン */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
              打刻
            </h2>
            <ClockButton />
          </section>

          {/* 今日の勤務状況 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              今日の勤務状況
            </h2>
            <TodayStatus />
          </section>
          
          {/* 勤務時間集計 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              勤務時間集計
            </h2>
            <WorkSummary />
          </section>

          {/* 打刻履歴 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                最近の打刻履歴
              </h2>
              <Link href="/history" className="text-blue-500 hover:text-blue-700 flex items-center text-sm">
                すべての履歴を見る
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            <ClockHistory limit={7} />
          </section>
        </main>

        <footer className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">出退勤管理アプリ v0.3.0</p>
        </footer>
      </div>
    </div>
  )
}