
'use server'

/**
 * タイムカードに関連するServer Actions
 */
import type { TimeRecord, ClockStatus, TodayWorkStatus } from '@/types'
import {
  getTodayWorkStatus as dbGetTodayWorkStatus,
  getAllTimeRecords as dbGetAllTimeRecords,
  clockIn as dbClockIn,
  clockOut as dbClockOut
} from '@/lib/prisma/timeRecord';
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache';

/**
 * 今日の打刻状況を取得
 */
export async function getTodayStatus(): Promise<ClockStatus> {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return 'not-clocked-in'
    }
    const workStatus = await dbGetTodayWorkStatus(session.user.id)
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
 * 出勤処理
 */
export async function clockIn() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  await dbClockIn(session.user.id);
  revalidatePath('/');
}

/**
 * 退勤処理
 */
export async function clockOut() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('User not authenticated');
  }
  await dbClockOut(session.user.id);
  revalidatePath('/');
}
