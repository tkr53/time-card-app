import { getTodayStatus } from '@/services/serverTimeRecordService'
import { ClockButton as ClientClockButton } from '@/components/client/ClockButton'

/**
 * Server Componentとして実装された打刻ボタンラッパー
 */
export async function ClockButton() {
  const status = await getTodayStatus()

  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
      <ClientClockButton 
        type="clock-in" 
        status={status}
      />
      <ClientClockButton 
        type="clock-out" 
        status={status}
      />
    </div>
  )
}
