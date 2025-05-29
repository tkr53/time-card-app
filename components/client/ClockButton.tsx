'use client'

import { useState, useTransition } from 'react'
import { clockInAction, clockOutAction } from '@/app/actions'
import type { ClockType, ClockStatus } from '@/types'

interface ClockButtonProps {
  type: ClockType
  status: ClockStatus
}

/**
 * Server Actionsを使用するクライアント側打刻ボタン
 */
export function ClockButton({ type, status }: ClockButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isDisabled = () => {
    if (type === 'clock-in') {
      // 出勤中でない場合は出勤可能
      return status === 'clocked-in'
    } else {
      // 出勤中の場合のみ退勤可能
      return status === 'not-clocked-in' || status === 'clocked-out'
    }
  }

  const getButtonConfig = () => {
    if (type === 'clock-in') {
      const isFirstClockIn = status === 'not-clocked-in'
      return {
        text: isFirstClockIn ? '出勤' : '再出勤',
        icon: isFirstClockIn ? '👋' : '🔄',
        bgColor: 'bg-blue-500 hover:bg-blue-600',
        bgColorDisabled: 'bg-gray-300 dark:bg-gray-600',
        confirmMessage: isFirstClockIn ? '出勤打刻を行いますか？' : '再出勤打刻を行いますか？（休憩終了）'
      }
    } else {
      return {
        text: '退勤',
        icon: '🏃‍♂️',
        bgColor: 'bg-green-500 hover:bg-green-600',
        bgColorDisabled: 'bg-gray-300 dark:bg-gray-600',
        confirmMessage: status === 'clocked-in' ? '退勤打刻を行いますか？（休憩開始または勤務終了）' : '退勤打刻を行いますか？'
      }
    }
  }

  const config = getButtonConfig()
  const disabled = isDisabled()

  const handleClick = () => {
    if (disabled || isPending) return
    setShowConfirm(true)
  }

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        if (type === 'clock-in') {
          await clockInAction()
        } else {
          await clockOutAction()
        }
        setShowConfirm(false)
      } catch (error) {
        console.error('打刻処理中にエラーが発生しました:', error)
        alert(`エラー: ${error instanceof Error ? error.message : '打刻処理中に問題が発生しました。'}`)
        setShowConfirm(false)
      }
    })
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={disabled || isPending}
        className={`
          relative w-32 h-32 rounded-full text-white font-bold text-lg shadow-lg
          transition-all duration-200 transform hover:scale-105 active:scale-95
          ${disabled ? config.bgColorDisabled : config.bgColor}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${isPending ? 'animate-pulse' : ''}
        `}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <span className="text-3xl mb-1">{config.icon}</span>
          <span>{isPending ? '処理中...' : config.text}</span>
        </div>
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              確認
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {config.confirmMessage}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                disabled={isPending}
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPending}
                className={`
                  px-4 py-2 text-white rounded-md transition-colors
                  ${config.bgColor}
                  ${isPending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isPending ? '処理中...' : '確認'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
