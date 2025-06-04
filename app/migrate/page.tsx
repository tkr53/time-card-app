'use client'

import { useState, useTransition } from 'react'
import { migrateCookieToDatabase } from '@/app/migrate'

export default function MigrationPage() {
  const [result, setResult] = useState<any>(null)
  const [isPending, startTransition] = useTransition()

  const handleMigration = () => {
    startTransition(async () => {
      try {
        const migrationResult = await migrateCookieToDatabase()
        setResult(migrationResult)
      } catch (error) {
        setResult({
          success: false,
          message: `エラー: ${error instanceof Error ? error.message : 'Unknown error'}`,
          details: null
        })
      }
    })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
          データ移行
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            CookieからデータベースへのDual移行
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            既存のCookieに保存されたデータをPostgreSQLデータベースに移行します。
            この操作は一度だけ実行してください。
          </p>
          
          <button
            onClick={handleMigration}
            disabled={isPending}
            className={`
              w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors
              ${isPending 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
              }
            `}
          >
            {isPending ? '移行中...' : '移行を開始'}
          </button>
        </div>

        {result && (
          <div className={`
            rounded-lg p-6 
            ${result.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }
          `}>
            <h3 className={`
              text-lg font-semibold mb-2
              ${result.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
              }
            `}>
              {result.success ? '✅ 移行成功' : '❌ 移行失敗'}
            </h3>
            
            <p className={`
              mb-4
              ${result.success 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
              }
            `}>
              {result.message}
            </p>

            {result.details && (
              <div className="text-sm">
                <h4 className="font-semibold mb-2">詳細:</h4>
                <ul className="space-y-1">
                  <li>移行されたレコード: {result.details.migratedRecords}件</li>
                  <li>移行されたエントリ: {result.details.migratedEntries}件</li>
                  {result.details.errors.length > 0 && (
                    <li>
                      <details className="mt-2">
                        <summary className="cursor-pointer">エラー詳細 ({result.details.errors.length}件)</summary>
                        <ul className="mt-2 ml-4 space-y-1">
                          {result.details.errors.map((error: string, index: number) => (
                            <li key={index} className="text-xs">{error}</li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {result.success && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  移行が完了しました。トップページに戻ってデータベースでの動作を確認してください。
                </p>
                <a 
                  href="/" 
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  トップページに戻る
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
