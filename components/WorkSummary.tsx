'use client';

import { useState, useEffect } from 'react';
import { getWorkSummary, getWorkStatistics, formatWorkDuration } from '@/services/timeRecordService';
import type { WorkStatistics } from '@/types';

interface WorkSummaryProps {
  className?: string;
}

/**
 * 勤務時間サマリーコンポーネント（週間・月間の勤務時間集計と平均勤務時間）
 */
export default function WorkSummary({ className = '' }: WorkSummaryProps) {
  const [weekSummary, setWeekSummary] = useState({ 
    totalDuration: 0, 
    averageDuration: 0,
    workDays: 0,
    startDate: '', 
    endDate: '' 
  });
  const [monthSummary, setMonthSummary] = useState({ 
    totalDuration: 0, 
    averageDuration: 0,
    workDays: 0,
    startDate: '', 
    endDate: '' 
  });
  const [statistics, setStatistics] = useState<WorkStatistics>({
    totalWorkTime: 0,
    averageWorkTime: 0,
    workDays: 0,
    period: { start: '', end: '' }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = () => {
      setIsLoading(true);
      try {
        const weekData = getWorkSummary('week');
        const monthData = getWorkSummary('month');
        const statsData = getWorkStatistics(30); // 直近30日間の統計
        
        setWeekSummary({
          totalDuration: weekData.totalDuration,
          averageDuration: weekData.averageDuration,
          workDays: weekData.workDays,
          startDate: weekData.startDate,
          endDate: weekData.endDate
        });
        
        setMonthSummary({
          totalDuration: monthData.totalDuration,
          averageDuration: monthData.averageDuration,
          workDays: monthData.workDays,
          startDate: monthData.startDate,
          endDate: monthData.endDate
        });

        setStatistics(statsData);
      } catch (error) {
        console.error('勤務時間集計の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();

    // LocalStorageの変更を監視
    const handleStorageChange = () => {
      loadSummary();
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatDateRange = (startDate: string, endDate: string) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric'
      });
    };
    
    return `${formatDate(startDate)} 〜 ${formatDate(endDate)}`;
  };

  if (isLoading) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">データを集計中...</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-indigo-700 dark:text-indigo-300 mb-1">今週の勤務時間</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {formatDateRange(weekSummary.startDate, weekSummary.endDate)}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">合計</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatWorkDuration(weekSummary.totalDuration)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均 ({weekSummary.workDays}日)</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {formatWorkDuration(weekSummary.averageDuration)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/30 p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-teal-700 dark:text-teal-300 mb-1">今月の勤務時間</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {formatDateRange(monthSummary.startDate, monthSummary.endDate)}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">合計</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {formatWorkDuration(monthSummary.totalDuration)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">平均 ({monthSummary.workDays}日)</p>
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                {formatWorkDuration(monthSummary.averageDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/30 p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-medium text-amber-700 dark:text-amber-300 mb-1">直近30日間の平均</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          {formatDateRange(statistics.period.start, statistics.period.end)}
        </p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">総勤務日数</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white">
              {statistics.workDays}日
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">平均勤務時間</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
              {formatWorkDuration(statistics.averageWorkTime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">総勤務時間</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200">
              {formatWorkDuration(statistics.totalWorkTime)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
