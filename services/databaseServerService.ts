/**
 * データベースを使用するServer Component用のサービス
 */
import type { TimeRecord, ClockStatus, TodayWorkStatus } from '@/types'
import { getTodayWorkStatus as dbGetTodayWorkStatus, getAllTimeRecords as dbGetAllTimeRecords } from '@/services/databaseTimeRecordService'
import { auth } from '@/auth'

/**
 * 今日の打刻状況を取得
 */
export async function getTodayStatus(): Promise<ClockStatus> {
  try {
    const session = await auth()
    console.log('getTodayStatus - session:', session?.user?.id)
    if (!session?.user?.id) {
      console.log('getTodayStatus - No authenticated user, returning not-clocked-in')
      return 'not-clocked-in'
    }
    const workStatus = await dbGetTodayWorkStatus(session.user.id)
    console.log('getTodayStatus - workStatus:', workStatus)
    return workStatus.status
  } catch (error) {
    console.error('Error getting today status:', error)
    return 'not-clocked-in'
  }
}

/**
 * 今日の詳細な勤務状況を取得
 */
export async function getTodayWorkStatus(): Promise<TodayWorkStatus> {
  try {
    const session = await auth()
    console.log('getTodayWorkStatus - session:', session?.user?.id)
    if (!session?.user?.id) {
      const today = new Date().toISOString().split('T')[0]
      return {
        status: 'not-clocked-in',
        entries: [],
        totalWorkDuration: 0,
        date: today
      }
    }
    const result = await dbGetTodayWorkStatus(session.user.id)
    console.log('getTodayWorkStatus - result:', result)
    return result
  } catch (error) {
    console.error('Error getting today work status:', error)
    const today = new Date().toISOString().split('T')[0]
    return {
      status: 'not-clocked-in',
      entries: [],
      totalWorkDuration: 0,
      date: today
    }
  }
}

/**
 * 全ての勤務記録を取得
 */
export async function getAllTimeRecords(): Promise<TimeRecord[]> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return []
    }
    return await dbGetAllTimeRecords(session.user.id)
  } catch (error) {
    console.error('Error getting all time records:', error)
    return []
  }
}

/**
 * 現在時刻を取得
 */
export function getCurrentTime(): Date {
  return new Date()
}

/**
 * 時刻をフォーマット
 */
export function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
