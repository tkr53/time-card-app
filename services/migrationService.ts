/**
 * データ移行ユーティリティ
 * Cookieからデータベースへのデータ移行
 */
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import type { TimeRecord as TypeTimeRecord, ClockEntry as TypeClockEntry } from '@/types'

/**
 * Cookieからすべてのデータを取得
 */
async function getAllCookieRecords(): Promise<TypeTimeRecord[]> {
  const cookieStore = await cookies()
  const records: TypeTimeRecord[] = []
  
  // cookieから全ての打刻記録を取得
  const allCookies = cookieStore.getAll()
  
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('timecard-')) {
      try {
        const record = JSON.parse(cookie.value) as TypeTimeRecord
        records.push(record)
      } catch (error) {
        console.error('Error parsing time record:', error)
      }
    }
  }
  
  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

/**
 * CookieデータをデータベースにマイグレーションRaw SQLを使って時刻指定
 */
export async function migrateCookieDataToDatabase(userId: string = 'default'): Promise<{
  success: boolean
  migratedRecords: number
  migratedEntries: number
  errors: string[]
}> {
  const errors: string[] = []
  let migratedRecords = 0
  let migratedEntries = 0

  try {
    const cookieRecords = await getAllCookieRecords()
    
    if (cookieRecords.length === 0) {
      return {
        success: true,
        migratedRecords: 0,
        migratedEntries: 0,
        errors: ['移行するCookieデータが見つかりませんでした']
      }
    }

    // 既存のデータベースデータを確認
    const existingRecords = await prisma.timeRecord.findMany({
      where: { userId },
      select: { date: true }
    })
    const existingDates = new Set(existingRecords.map(r => r.date))

    for (const cookieRecord of cookieRecords) {
      try {
        // 既に存在する日付はスキップ
        if (existingDates.has(cookieRecord.date)) {
          console.log(`Skipping ${cookieRecord.date} - already exists in database`)
          continue
        }

        // TimeRecordを作成
        const timeRecord = await prisma.timeRecord.create({
          data: {
            date: cookieRecord.date,
            userId: userId,
            totalWorkDuration: cookieRecord.totalWorkDuration || 0,
            createdAt: cookieRecord.createdAt ? new Date(cookieRecord.createdAt) : new Date(),
            updatedAt: cookieRecord.updatedAt ? new Date(cookieRecord.updatedAt) : new Date()
          }
        })

        migratedRecords++

        // ClockEntryを作成
        for (const entry of cookieRecord.entries) {
          try {
            await prisma.clockEntry.create({
              data: {
                timeRecordId: timeRecord.id,
                clockIn: new Date(entry.clockIn),
                clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
                duration: entry.duration || null,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            })
            migratedEntries++
          } catch (entryError) {
            console.error(`Error migrating entry for ${cookieRecord.date}:`, entryError)
            errors.push(`エントリの移行エラー (${cookieRecord.date}): ${entryError}`)
          }
        }

      } catch (recordError) {
        console.error(`Error migrating record ${cookieRecord.date}:`, recordError)
        errors.push(`レコードの移行エラー (${cookieRecord.date}): ${recordError}`)
      }
    }

    return {
      success: true,
      migratedRecords,
      migratedEntries,
      errors
    }

  } catch (error) {
    console.error('Migration failed:', error)
    return {
      success: false,
      migratedRecords,
      migratedEntries,
      errors: [...errors, `移行失敗: ${error}`]
    }
  }
}

/**
 * 移行後にCookieデータを削除
 */
export async function clearCookieData(): Promise<void> {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  for (const cookie of allCookies) {
    if (cookie.name.startsWith('timecard-')) {
      cookieStore.delete(cookie.name)
    }
  }
}
