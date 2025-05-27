'use client';

import { useState } from 'react';
import type { ClockType, ClockStatus } from '@/types';

interface ClockButtonProps {
  type: ClockType;
  status: ClockStatus;
  onClock: (type: ClockType) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * 打刻ボタンコンポーネント
 */
export function ClockButton({ 
  type, 
  status, 
  onClock, 
  disabled = false, 
  className = '' 
}: ClockButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;
    
    // 確認ダイアログを表示
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    
    try {
      onClock(type);
    } finally {
      // UIフィードバックのために少し遅延
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const getButtonConfig = () => {
    switch (type) {
      case 'clock-in':
        return {
          text: '出勤',
          emoji: '🏢',
          bgColor: 'bg-blue-500 hover:bg-blue-600',
          disabledBgColor: 'bg-gray-400',
          isDisabled: status === 'clocked-in' || disabled,
          confirmText: '出勤時刻を記録しますか？',
        };
      case 'clock-out':
        return {
          text: '退勤',
          emoji: '🏠',
          bgColor: 'bg-green-500 hover:bg-green-600',
          disabledBgColor: 'bg-gray-400',
          isDisabled: status !== 'clocked-in' || disabled,
          confirmText: '退勤時刻を記録しますか？',
        };
      default:
        return {
          text: '打刻',
          emoji: '⏰',
          bgColor: 'bg-gray-500 hover:bg-gray-600',
          disabledBgColor: 'bg-gray-400',
          isDisabled: disabled,
          confirmText: '打刻を記録しますか？',
        };
    }
  };

  const config = getButtonConfig();

  return (
    <>
      <button
        onClick={handleClick}
        disabled={config.isDisabled || isLoading}
        className={`
          relative px-8 py-6 rounded-2xl text-white font-bold text-xl
          transition-all duration-200 transform
          ${config.isDisabled ? config.disabledBgColor : config.bgColor}
          ${!config.isDisabled && !isLoading ? 'hover:scale-105 active:scale-95' : ''}
          ${config.isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${isLoading ? 'opacity-70' : ''}
          min-w-[200px] min-h-[100px]
          shadow-lg hover:shadow-xl
          ${className}
        `}
      >
        <div className="flex flex-col items-center justify-center space-y-2">
          <span className="text-3xl">{config.emoji}</span>
          <span className="text-lg">
            {isLoading ? '処理中...' : config.text}
          </span>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </button>

      {/* 確認ダイアログ */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">確認</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{config.confirmText}</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded text-white ${config.bgColor}`}
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
