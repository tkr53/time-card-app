
/**
 * Prismaを使ったTimeRecordテーブルへのアクセスサービス
 */
import { prisma } from '@/lib/prisma'
import type { TimeRecord, ClockEntry, TodayWorkStatus, ClockStatus, WorkStatistics } from '@/types'
import { getTodayDateString } from '@/utils/date';
import { calculateDuration, calculateTotalDuration } from '@/utils/time';

/**
 * 出勤処理
 */
export const clockIn = async (userId: string): Promise<ClockEntry> => {
  const today = getTodayDateString()
  const now = new Date()

  // 今日のTimeRecordを取得または作成
  let timeRecord = await prisma.timeRecord.findUnique({
    where: {
      date_userId: {
        date: today,
        userId: userId
      }
    },
    include: {
      entries: true
    }
  })

  if (!timeRecord) {
    timeRecord = await prisma.timeRecord.create({
      data: {
        date: today,
        userId: userId,
        totalWorkDuration: 0
      },
      include: {
        entries: true
      }
    })
  }

  // 既に出勤中（退勤していないエントリがある）の場合はエラー
  const activeEntry = timeRecord.entries.find(entry => !entry.clockOut)
  if (activeEntry) {
    throw new Error('既に出勤中です。先に退勤してください。')
  }

  // 新しい出勤エントリを作成
  const clockEntry = await prisma.clockEntry.create({
    data: {
      timeRecordId: timeRecord.id,
      clockIn: now
    }
  })

  return {
    id: clockEntry.id,
    clockIn: clockEntry.clockIn,
    clockOut: clockEntry.clockOut,
    duration: clockEntry.duration ?? undefined
  }
}

/**
 * 退勤処理
 */
export const clockOut = async (userId: string): Promise<ClockEntry> => {
  const today = getTodayDateString()
  const now = new Date()

  // 今日のTimeRecordを取得
  const timeRecord = await prisma.timeRecord.findUnique({
    where: {
      date_userId: {
        date: today,
        userId: userId
      }
    },
    include: {
      entries: true
    }
  })

  if (!timeRecord) {
    throw new Error('出勤記録がありません')
  }

  // 出勤中のエントリを検索
  const activeEntry = timeRecord.entries.find(entry => !entry.clockOut)
  if (!activeEntry) {
    throw new Error('出勤記録がありません。先に出勤してください。')
  }

  // 退勤時刻と勤務時間を計算
  const duration = calculateDuration(activeEntry.clockIn, now)

  // エントリを更新
  const updatedEntry = await prisma.clockEntry.update({
    where: { id: activeEntry.id },
    data: {
      clockOut: now,
      duration: duration
    }
  })

  // TimeRecordの総勤務時間を再計算
  const allEntries = await prisma.clockEntry.findMany({
    where: { timeRecordId: timeRecord.id }
  })
  
  const totalDuration = calculateTotalDuration(allEntries.map(e => ({...e, clockIn: e.clockIn, clockOut: e.clockOut, duration: e.duration ?? undefined, id: e.id})))

  await prisma.timeRecord.update({
    where: { id: timeRecord.id },
    data: { totalWorkDuration: totalDuration }
  })

  return {
    id: updatedEntry.id,
    clockIn: updatedEntry.clockIn,
    clockOut: updatedEntry.clockOut,
    duration: updatedEntry.duration ?? undefined
  }
}

/**
 * 今日の勤務状況を取得
 */
export const getTodayWorkStatus = async (userId: string): Promise<TodayWorkStatus> => {
  const today = getTodayDateString()

  const timeRecord = await prisma.timeRecord.findUnique({
    where: {
      date_userId: {
        date: today,
        userId: userId
      }
    },
    include: {
      entries: {
        orderBy: { clockIn: 'asc' }
      }
    }
  })

  const defaultStatus: TodayWorkStatus = {
    status: 'not-clocked-in',
    entries: [],
    totalWorkDuration: 0,
    date: today
  }

  if (!timeRecord || timeRecord.entries.length === 0) {
    return defaultStatus
  }

  // エントリをTimeRecord形式に変換
  const entries: ClockEntry[] = timeRecord.entries.map(entry => ({
    id: entry.id,
    clockIn: entry.clockIn,
    clockOut: entry.clockOut,
    duration: entry.duration ?? undefined
  }))

  // 現在アクティブなエントリを検索
  const activeEntry = entries.find(entry => !entry.clockOut)

  let status: ClockStatus = 'not-clocked-in'
  if (activeEntry) {
    status = 'clocked-in'
  } else if (entries.length > 0) {
    status = 'clocked-out'
  }

  return {
    status,
    currentEntry: activeEntry,
    entries,
    totalWorkDuration: timeRecord.totalWorkDuration,
    date: today
  }
}

/**
 * 指定日の勤務記録を取得
 */
export const getTimeRecordByDate = async (date: string, userId: string): Promise<TimeRecord | null> => {
  const timeRecord = await prisma.timeRecord.findUnique({
    where: {
      date_userId: {
        date: date,
        userId: userId
      }
    },
    include: {
      entries: {
        orderBy: { clockIn: 'asc' }
      }
    }
  })

  if (!timeRecord) {
    return null
  }

  return {
    id: timeRecord.id,
    date: timeRecord.date,
    userId: timeRecord.userId,
    entries: timeRecord.entries.map(entry => ({
      id: entry.id,
      clockIn: entry.clockIn,
      clockOut: entry.clockOut,
      duration: entry.duration ?? undefined
    })),
    totalWorkDuration: timeRecord.totalWorkDuration,
    createdAt: timeRecord.createdAt,
    updatedAt: timeRecord.updatedAt
  }
}

/**
 * 全ての勤務記録を取得
 */
export const getAllTimeRecords = async (userId: string): Promise<TimeRecord[]> => {
  const timeRecords = await prisma.timeRecord.findMany({
    where: { userId },
    include: {
      entries: {
        orderBy: { clockIn: 'asc' }
      }
    },
    orderBy: { date: 'desc' }
  })

  return timeRecords.map(record => ({
    id: record.id,
    date: record.date,
    userId: record.userId,
    entries: record.entries.map(entry => ({
      id: entry.id,
      clockIn: entry.clockIn,
      clockOut: entry.clockOut,
      duration: entry.duration ?? undefined
    })),
    totalWorkDuration: record.totalWorkDuration,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  }))
}

/**
 * 月間統計を取得
 */
export const getMonthlyStatistics = async (year: number, month: number, userId: string): Promise<WorkStatistics> => {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const records = await prisma.timeRecord.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate
      },
      totalWorkDuration: {
        gt: 0
      }
    }
  })

  const workDays = records.length
  const totalWorkTime = records.reduce((total, record) => total + record.totalWorkDuration, 0)

  return {
    workDays,
    totalWorkTime,
    averageWorkTime: workDays > 0 ? totalWorkTime / workDays : 0,
    period: {
      start: startDate,
      end: endDate
    }
  }
}
