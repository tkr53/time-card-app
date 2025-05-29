'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import type { TimeRecord, ClockEntry } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// 勤務時間を計算するヘルパー関数
function calculateDuration(clockIn: string | Date, clockOut: string | Date): number {
  const inTime = new Date(clockIn)
  const outTime = new Date(clockOut)
  return Math.floor((outTime.getTime() - inTime.getTime()) / (1000 * 60)) // 分単位
}

// 総勤務時間を計算するヘルパー関数
function calculateTotalDuration(entries: ClockEntry[]): number {
  return entries.reduce((total, entry) => {
    if (entry.clockOut && entry.duration) {
      return total + entry.duration
    }
    return total
  }, 0)
}

// 出勤処理
export async function clockInAction() {
  'use server'
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const cookieStore = await cookies()
  
  // 今日の記録を取得または新規作成
  let todayRecord: TimeRecord
  const existingRecord = cookieStore.get(`timecard-${today}`)
  
  if (existingRecord) {
    try {
      todayRecord = JSON.parse(existingRecord.value)
      
      // 既に出勤中（退勤していないエントリがある）の場合はエラー
      const hasActiveEntry = todayRecord.entries.some(entry => !entry.clockOut)
      if (hasActiveEntry) {
        throw new Error('既に出勤中です。先に退勤してください。')
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('既に出勤中です')) {
        throw error
      }
      // パースエラーの場合は新規作成
      todayRecord = {
        id: uuidv4(),
        date: today,
        entries: [],
        totalWorkDuration: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    }
  } else {
    todayRecord = {
      id: uuidv4(),
      date: today,
      entries: [],
      totalWorkDuration: 0,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  }
  
  // 新しい出勤エントリを追加
  const newEntry: ClockEntry = {
    id: uuidv4(),
    clockIn: now.toISOString(),
    clockOut: null
  }
  
  todayRecord.entries.push(newEntry)
  todayRecord.updatedAt = now.toISOString()
  
  // Cookieに保存（30日間）
  cookieStore.set(`timecard-${today}`, JSON.stringify(todayRecord), {
    maxAge: 30 * 24 * 60 * 60, // 30日間
    httpOnly: false, // クライアント側からも読み取り可能にする
    secure: process.env.NODE_ENV === 'production'
  })
  
  // ページを再検証
  revalidatePath('/')
  
  return {
    success: true,
    timestamp: now.toISOString(),
    type: 'clock-in' as const,
    entryId: newEntry.id
  }
}

// 退勤処理
export async function clockOutAction() {
  'use server'
  
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const cookieStore = await cookies()
  
  // 今日の記録を取得
  const existingRecord = cookieStore.get(`timecard-${today}`)
  
  if (!existingRecord) {
    throw new Error('出勤記録がありません')
  }
  
  let todayRecord: TimeRecord
  try {
    todayRecord = JSON.parse(existingRecord.value)
  } catch (error) {
    throw new Error('記録データが破損しています')
  }
  
  // 出勤中のエントリを検索
  const activeEntryIndex = todayRecord.entries.findIndex(entry => !entry.clockOut)
  
  if (activeEntryIndex === -1) {
    throw new Error('出勤記録がありません。先に出勤してください。')
  }
  
  // 退勤時刻を設定
  const activeEntry = todayRecord.entries[activeEntryIndex]
  activeEntry.clockOut = now.toISOString()
  activeEntry.duration = calculateDuration(activeEntry.clockIn, activeEntry.clockOut)
  
  // 総勤務時間を再計算
  todayRecord.totalWorkDuration = calculateTotalDuration(todayRecord.entries)
  todayRecord.updatedAt = now.toISOString()
  
  // Cookieに保存
  cookieStore.set(`timecard-${today}`, JSON.stringify(todayRecord), {
    maxAge: 30 * 24 * 60 * 60, // 30日間
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production'
  })
  
  // ページを再検証
  revalidatePath('/')
  
  return {
    success: true,
    timestamp: now.toISOString(),
    type: 'clock-out' as const,
    entryId: activeEntry.id,
    duration: activeEntry.duration
  }
}

export async function navigateToHistory(date?: string) {
  'use server'
  
  if (date) {
    redirect(`/history?date=${date}`)
  } else {
    redirect('/history')
  }
}
