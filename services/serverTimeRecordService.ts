/**
 * Server Component用のデータ取得サービス
 * LocalStorageの代わりにサーバー側でのデータ管理を行います
 */
import type { TimeRecord, ClockStatus, TodayWorkStatus } from '@/types'
import { cookies } from 'next/headers'

// 一時的にcookieを使用してデータを管理
// 実際の本番環境では、データベースやファイルシステムを使用することを推奨

export async function getTodayStatus(): Promise<ClockStatus> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0]
  const todayRecord = cookieStore.get(`timecard-${today}`)
  
  if (!todayRecord) {
    return 'not-clocked-in'
  }
  
  try {
    const record: TimeRecord = JSON.parse(todayRecord.value)
    
    // 出勤中のエントリがあるかチェック
    const hasActiveEntry = record.entries.some(entry => !entry.clockOut)
    
    if (hasActiveEntry) {
      return 'clocked-in'
    } else if (record.entries.length > 0) {
      return 'clocked-out'
    }
  } catch (error) {
    console.error('Error parsing time record:', error)
  }
  
  return 'not-clocked-in'
}

export async function getTodayWorkStatus(): Promise<TodayWorkStatus> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0]
  const todayRecord = cookieStore.get(`timecard-${today}`)
  
  const defaultStatus: TodayWorkStatus = {
    status: 'not-clocked-in',
    entries: [],
    totalWorkDuration: 0,
    date: today
  }
  
  if (!todayRecord) {
    return defaultStatus
  }
  
  try {
    const record: TimeRecord = JSON.parse(todayRecord.value)
    const activeEntry = record.entries.find(entry => !entry.clockOut)
    
    let status: ClockStatus = 'not-clocked-in'
    if (activeEntry) {
      status = 'clocked-in'
    } else if (record.entries.length > 0) {
      status = 'clocked-out'
    }
    
    return {
      status,
      currentEntry: activeEntry,
      entries: record.entries,
      totalWorkDuration: record.totalWorkDuration,
      date: today
    }
  } catch (error) {
    console.error('Error parsing time record:', error)
    return defaultStatus
  }
}

export async function getTodayTimeRecord(): Promise<TimeRecord | null> {
  const cookieStore = await cookies()
  const today = new Date().toISOString().split('T')[0]
  const todayRecord = cookieStore.get(`timecard-${today}`)
  
  if (!todayRecord) {
    return null
  }
  
  try {
    return JSON.parse(todayRecord.value) as TimeRecord
  } catch (error) {
    console.error('Error parsing time record:', error)
    return null
  }
}

export async function getAllTimeRecords(): Promise<TimeRecord[]> {
  const cookieStore = await cookies()
  const records: TimeRecord[] = []
  
  // cookieから全ての打刻記録を取得
  const allCookies = cookieStore.getAll()
  
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('timecard-')) {
      try {
        const record = JSON.parse(cookie.value) as TimeRecord
        records.push(record)
      } catch (error) {
        console.error('Error parsing time record:', error)
      }
    }
  }
  
  // 日付で降順ソート
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getCurrentTime(): Date {
  return new Date()
}

export function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
