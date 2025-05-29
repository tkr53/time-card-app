import { getAllTimeRecords } from '@/services/serverTimeRecordService';
import { formatWorkDuration } from '@/services/timeRecordService';
import type { TimeRecord } from '@/types';

interface WorkSummaryProps {
  className?: string;
}

/**
 * 勤務時間サマリーServer Component（週間・月間の勤務時間集計と平均勤務時間）
 */
export async function WorkSummary({ className = '' }: WorkSummaryProps) {
  const allRecords = await getAllTimeRecords();

  // 今週の集計を計算
  const getThisWeekSummary = (records: TimeRecord[]) => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = 日曜日
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - currentDay);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weekRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfWeek && recordDate <= endOfWeek;
    });
    
    return calculateSummary(weekRecords, startOfWeek, endOfWeek);
  };

  // 今月の集計を計算
  const getThisMonthSummary = (records: TimeRecord[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    const monthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startOfMonth && recordDate <= endOfMonth;
    });
    
    return calculateSummary(monthRecords, startOfMonth, endOfMonth);
  };

  // 集計計算
  const calculateSummary = (records: TimeRecord[], startDate: Date, endDate: Date) => {
    let totalMinutes = 0;
    let workDays = 0;
    
    records.forEach(record => {
      if (record.entries && record.entries.length > 0) {
        // 完了したエントリがある場合のみカウント
        const completedEntries = record.entries.filter(entry => entry.clockOut);
        if (completedEntries.length > 0) {
          totalMinutes += record.totalWorkDuration || 0;
          workDays++;
        }
      }
    });
    
    const averageMinutes = workDays > 0 ? Math.floor(totalMinutes / workDays) : 0;
    
    return {
      totalDuration: totalMinutes,
      averageDuration: averageMinutes,
      workDays,
      startDate: startDate.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric'
      }),
      endDate: endDate.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric'
      })
    };
  };

  const weekSummary = getThisWeekSummary(allRecords);
  const monthSummary = getThisMonthSummary(allRecords);

  // 全体統計
  const totalRecordsWithCompletedEntries = allRecords.filter(r => 
    r.entries && r.entries.some(entry => entry.clockOut)
  );
  const totalMinutes = totalRecordsWithCompletedEntries.reduce((total, record) => {
    return total + (record.totalWorkDuration || 0);
  }, 0);
  
  const averageMinutes = totalRecordsWithCompletedEntries.length > 0 
    ? Math.floor(totalMinutes / totalRecordsWithCompletedEntries.length) 
    : 0;

  return (
    <div className={`${className}`}>
      <div className="grid gap-6 md:grid-cols-2">
        {/* 今週の集計 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            今週の勤務時間
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">期間:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {weekSummary.startDate} - {weekSummary.endDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">出勤日数:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {weekSummary.workDays}日
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">合計時間:</span>
              <span className="font-bold text-xl text-blue-800 dark:text-blue-200">
                {formatWorkDuration(weekSummary.totalDuration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600 dark:text-blue-300">平均時間:</span>
              <span className="font-medium text-blue-800 dark:text-blue-200">
                {formatWorkDuration(weekSummary.averageDuration)}
              </span>
            </div>
          </div>
        </div>

        {/* 今月の集計 */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
            今月の勤務時間
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-green-600 dark:text-green-300">期間:</span>
              <span className="font-medium text-green-800 dark:text-green-200">
                {monthSummary.startDate} - {monthSummary.endDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600 dark:text-green-300">出勤日数:</span>
              <span className="font-medium text-green-800 dark:text-green-200">
                {monthSummary.workDays}日
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600 dark:text-green-300">合計時間:</span>
              <span className="font-bold text-xl text-green-800 dark:text-green-200">
                {formatWorkDuration(monthSummary.totalDuration)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-600 dark:text-green-300">平均時間:</span>
              <span className="font-medium text-green-800 dark:text-green-200">
                {formatWorkDuration(monthSummary.averageDuration)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 全体統計 */}
      <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          全体統計
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {totalRecordsWithCompletedEntries.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              総出勤日数
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {formatWorkDuration(totalMinutes)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              累計勤務時間
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              {formatWorkDuration(averageMinutes)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              平均勤務時間
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
