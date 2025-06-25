'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { clockIn, clockOut } from '@/lib/prisma/timeRecord'

/**
 * データベースを使用した出勤処理
 */
export async function clockInActionDB() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const result = await clockIn(session.user.id)
    
    // ページを再検証
    revalidatePath('/')
    revalidatePath('/history')
    revalidatePath('/calendar')
    
    return {
      success: true,
      timestamp: (result.clockIn as Date).toISOString(),
      type: 'clock-in' as const,
      entryId: result.id
    }
  } catch (error) {
    console.error('Clock in error:', error)
    throw new Error(error instanceof Error ? error.message : '出勤処理中に問題が発生しました。')
  }
}

/**
 * データベースを使用した退勤処理
 */
export async function clockOutActionDB() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }

  try {
    const result = await clockOut(session.user.id)
    
    // ページを再検証
    revalidatePath('/')
    revalidatePath('/history')
    revalidatePath('/calendar')
    
    return {
      success: true,
      timestamp: result.clockOut ? (result.clockOut as Date).toISOString() : new Date().toISOString(),
      type: 'clock-out' as const,
      entryId: result.id,
      duration: result.duration || 0
    }
  } catch (error) {
    console.error('Clock out error:', error)
    throw new Error(error instanceof Error ? error.message : '退勤処理中に問題が発生しました。')
  }
}

export async function navigateToHistory(date?: string) {
  'use server'
  
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('認証が必要です')
  }
  
  const { redirect } = await import('next/navigation')
  
  if (date) {
    redirect(`/history?date=${encodeURIComponent(date)}`)
  } else {
    redirect('/history')
  }
}
