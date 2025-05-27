'use client';

import { useState, useEffect } from 'react';
import { getAllTimeRecords, formatWorkDuration } from '@/services/timeRecordService';
import type { TimeRecord } from '@/types';

interface ClockHistoryProps {
  className?: string;
  limit?: number;
}

/**
 * 打刻履歴を表示するコンポーネント
 */
export function ClockHistory({ className = '', limit = 5 }: ClockHistoryProps) {
  const [records, setRecords] = useState<TimeRecord[]>([]);

  useEffect(() => {
    const loadRecords = () => {
      const allRecords = getAllTimeRecords();
      // 降順ソート（新しい順）
      const sortedRecords = [...allRecords].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setRecords(sortedRecords.slice(0, limit));
    };

    loadRecords();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadRecords();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [limit]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short'
    });
  };

  const formatTime = (date?: Date): string => {
    if (!date) return '--:--';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (records.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">
          打刻履歴がありません。
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-gray-800 dark:text-gray-200">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="py-3 px-4 text-left">日付</th>
              <th className="py-3 px-4 text-left">出勤</th>
              <th className="py-3 px-4 text-left">退勤</th>
              <th className="py-3 px-4 text-right">勤務時間</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr 
                key={`${record.id}-${index}`}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4">{formatDate(record.date)}</td>
                <td className="py-3 px-4">{formatTime(record.clockIn)}</td>
                <td className="py-3 px-4">{formatTime(record.clockOut)}</td>
                <td className="py-3 px-4 text-right font-medium">
                  {record.workDuration !== undefined
                    ? formatWorkDuration(record.workDuration)
                    : '--:--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
