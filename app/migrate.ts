'use server'

import { migrateCookieDataToDatabase, clearCookieData } from '@/services/migrationService'
import { revalidatePath } from 'next/cache'

/**
 * Cookieデータをデータベースに移行
 */
export async function migrateCookieToDatabase() {
  try {
    const result = await migrateCookieDataToDatabase()
    
    if (result.success) {
      // 移行が成功した場合、Cookieを削除
      await clearCookieData()
      
      // ページを再検証
      revalidatePath('/')
      revalidatePath('/history')
      revalidatePath('/calendar')
      
      return {
        success: true,
        message: `移行完了: ${result.migratedRecords}件のレコード、${result.migratedEntries}件のエントリを移行しました`,
        details: result
      }
    } else {
      return {
        success: false,
        message: '移行中にエラーが発生しました',
        details: result
      }
    }
  } catch (error) {
    console.error('Migration action failed:', error)
    return {
      success: false,
      message: `移行に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: null
    }
  }
}
