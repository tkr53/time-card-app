import { getAllTimeRecords, formatTime } from '@/services/databaseServerService';
import { formatWorkDuration } from '@/services/timeRecordService';
import type { TimeRecord } from '@/types';

interface ClockHistoryProps {
  className?: string;
  limit?: number;
}

/**
 * 打刻履歴を表示するServer Component
 */
export async function ClockHistory({ className = '', limit = 5 }: ClockHistoryProps) {
  const allRecords = await getAllTimeRecords();
  
  // 降順ソート（新しい順）
  const sortedRecords = [...allRecords].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  const records = sortedRecords.slice(0, limit);

  // 日付を「MM/DD（曜）」形式でフォーマット
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    const dayName = dayNames[date.getDay()];
    
    return `${month}/${day}（${dayName}）`;
  };

  // 時刻を「HH:mm」形式でフォーマット
  const formatTimeValue = (timeValue: string | Date | null | undefined): string => {
    if (!timeValue) return '--:--';
    
    try {
      const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return '--:--';
    }
  };

  // 勤務時間を計算
  const calculateWorkDuration = (record: TimeRecord): string => {
    if (!record.entries || record.entries.length === 0) {
      return '記録なし';
    }
    
    // 完了したエントリがない場合
    const completedEntries = record.entries.filter(entry => entry.clockOut);
    if (completedEntries.length === 0) {
      return '勤務中';
    }
    
    return formatWorkDuration(record.totalWorkDuration || 0);
  };

  // 最初の出勤時刻と最後の退勤時刻を取得
  const getWorkTimeRange = (record: TimeRecord): { start: string, end: string } => {
    if (!record.entries || record.entries.length === 0) {
      return { start: '--:--', end: '--:--' };
    }
    
    const firstEntry = record.entries[0];
    const lastEntry = record.entries[record.entries.length - 1];
    
    const start = formatTimeValue(firstEntry.clockIn);
    const end = lastEntry.clockOut ? formatTimeValue(lastEntry.clockOut) : '勤務中';
    
    return { start, end };
  };

  // 勤務状態を判定
  const getWorkStatus = (record: TimeRecord): { status: string, color: string } => {
    if (!record.entries || record.entries.length === 0) {
      return { status: '記録なし', color: 'text-gray-600' };
    }
    
    const hasActiveEntry = record.entries.some(entry => !entry.clockOut);
    if (hasActiveEntry) {
      return { status: '勤務中', color: 'text-blue-600' };
    }
    
    return { status: `完了 (${record.entries.length}回)`, color: 'text-green-600' };
  };

  if (records.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          打刻記録がありません
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="space-y-4">
        {records.map((record) => {
          const timeRange = getWorkTimeRange(record);
          const workStatus = getWorkStatus(record);
          
          return (
            <div
              key={record.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-800 dark:text-white">
                  {formatDate(record.date)}
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-800 dark:text-white">
                    {calculateWorkDuration(record)}
                  </div>
                  <div className={`text-xs ${workStatus.color}`}>
                    {workStatus.status}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                {timeRange.start} - {timeRange.end}
              </div>
              
              {record.entries && record.entries.length > 1 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {record.entries.length}回の出勤・退勤記録
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
