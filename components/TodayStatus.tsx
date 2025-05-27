'use client';

import { useState, useEffect } from 'react';
import { getTodayTimeRecord, formatWorkDuration } from '@/services/timeRecordService';
import type { TimeRecord } from '@/types';

interface TodayStatusProps {
  className?: string;
}

/**
 * 今日の勤務状況を表示するコンポーネント
 */
export function TodayStatus({ className = '' }: TodayStatusProps) {
  const [todayRecord, setTodayRecord] = useState<TimeRecord | undefined>(undefined);

  useEffect(() => {
    // LocalStorageからデータを取得
    const loadData = () => {
      const record = getTodayTimeRecord();
      setTodayRecord(record);
    };

    loadData();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // コンポーネントがマウントされた直後にも最新データを取得
    const interval = setInterval(loadData, 10000); // 10秒ごとに更新

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const formatTime = (date?: Date): string => {
    if (!date) return '--:--';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-2">出勤時刻</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatTime(todayRecord?.clockIn)}
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">退勤時刻</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {formatTime(todayRecord?.clockOut)}
          </p>
        </div>
        
        <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 mb-2">勤務時間</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {todayRecord?.workDuration !== undefined
              ? formatWorkDuration(todayRecord.workDuration)
              : '--:--'}
          </p>
        </div>
      </div>

      {!todayRecord && (
        <p className="text-center mt-6 text-gray-500 dark:text-gray-400">
          今日の打刻データはまだありません。
        </p>
      )}
    </div>
  );
}
