import { getTodayWorkStatus } from '@/app/actions/timeRecord'

/**
 * 今日の勤務状況を表示するServer Component
 */
export async function TodayStatus() {
  const todayStatus = await getTodayWorkStatus()

  const formatTime = (timeString: string | Date | null | undefined): string => {
    if (!timeString) return '--:--'
    
    const date = typeof timeString === 'string' ? new Date(timeString) : timeString
    if (isNaN(date.getTime())) return '--:--'
    
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}時間${mins}分`
  }

  const getCurrentWorkDuration = (): string => {
    if (!todayStatus.currentEntry) return formatDuration(todayStatus.totalWorkDuration)
    
    const clockInTime = new Date(todayStatus.currentEntry.clockIn)
    const now = new Date()
    const currentSessionMinutes = Math.floor((now.getTime() - clockInTime.getTime()) / (1000 * 60))
    
    return formatDuration(todayStatus.totalWorkDuration + currentSessionMinutes)
  }

  const getLatestClockIn = () => {
    if (todayStatus.currentEntry) {
      return todayStatus.currentEntry.clockIn
    }
    if (todayStatus.entries.length > 0) {
      return todayStatus.entries[todayStatus.entries.length - 1].clockIn
    }
    return null
  }

  const getLatestClockOut = () => {
    if (todayStatus.currentEntry) {
      return null // 現在出勤中
    }
    if (todayStatus.entries.length > 0) {
      const lastEntry = todayStatus.entries[todayStatus.entries.length - 1]
      return lastEntry.clockOut
    }
    return null
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 最新出勤時刻 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
          <div className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-2">
            最新出勤時刻
          </div>
          <div className="text-2xl font-mono font-bold text-gray-800 dark:text-white">
            {formatTime(getLatestClockIn())}
          </div>
        </div>

        {/* 最新退勤時刻 */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center">
          <div className="text-green-600 dark:text-green-400 text-sm font-medium mb-2">
            最新退勤時刻
          </div>
          <div className="text-2xl font-mono font-bold text-gray-800 dark:text-white">
            {formatTime(getLatestClockOut())}
          </div>
        </div>

        {/* 総勤務時間 */}
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 text-center">
          <div className="text-purple-600 dark:text-purple-400 text-sm font-medium mb-2">
            総勤務時間
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-white">
            {getCurrentWorkDuration()}
          </div>
        </div>
      </div>

      {/* 今日の出勤・退勤履歴 */}
      {todayStatus.entries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            今日の勤務記録 ({todayStatus.entries.length}回)
          </h3>
          <div className="space-y-3">
            {todayStatus.entries.map((entry, index) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium px-2 py-1 rounded">
                    {index + 1}回目
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : '勤務中'}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {entry.duration ? formatDuration(entry.duration) : '計算中...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ステータス表示 */}
      <div className="text-center">
        {todayStatus.status === 'not-clocked-in' && (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
            未出勤
          </div>
        )}
        {todayStatus.status === 'clocked-in' && (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            勤務中 ({todayStatus.entries.length}回目)
          </div>
        )}
        {todayStatus.status === 'clocked-out' && (
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            勤務終了 (計{todayStatus.entries.length}回)
          </div>
        )}
      </div>
    </div>
  )
}

