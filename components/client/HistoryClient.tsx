'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatWorkDuration } from '@/utils/time';
import { getLocalDateString } from '@/utils/date';
import { DateFilter } from '@/components/client/DateFilter';
import { MonthCalendar } from '@/components/client/MonthCalendar';
import type { TimeRecord } from '@/types';

interface HistoryClientProps {
  initialRecords: TimeRecord[];
  initialSelectedDate?: string;
}

export function HistoryClient({ initialRecords, initialSelectedDate }: HistoryClientProps) {
  const [allRecords, setAllRecords] = useState<TimeRecord[]>(initialRecords);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>(initialRecords);
  const [selectedDate, setSelectedDate] = useState<string>(initialSelectedDate || '');
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  // 初期設定
  useEffect(() => {
    const parsedRecords = initialRecords.map(record => ({
      ...record,
      entries: record.entries.map(entry => ({
        ...entry,
        clockIn: new Date(entry.clockIn),
        clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
      })),
    }));

    // 降順ソート（新しい順）
    const sortedRecords = [...parsedRecords].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setAllRecords(sortedRecords);
    setFilteredRecords(sortedRecords);
    
    // URLパラメータから日付を取得
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    
    if (dateParam) {
      setSelectedDate(dateParam);
      const record = sortedRecords.find(r => r.date === dateParam);
      setSelectedRecord(record);
    } else if (sortedRecords.length > 0 && !selectedDate) {
      setSelectedDate(sortedRecords[0].date);
      setSelectedRecord(sortedRecords[0]);
    }
  }, [initialRecords, selectedDate]);

  // 日付を選択したときのハンドラ
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    const record = allRecords.find(r => r.date === date);
    setSelectedRecord(record);
  };

  // フィルター適用時のハンドラ
  const handleFilter = (records: TimeRecord[]) => {
    setFilteredRecords(records);
    
    // 選択中の日付がフィルター結果に含まれていなければリセット
    if (selectedDate && !records.some(r => r.date === selectedDate)) {
      if (records.length > 0) {
        setSelectedDate(records[0].date);
        setSelectedRecord(records[0]);
      } else {
        setSelectedDate('');
        setSelectedRecord(undefined);
      }
    }
  };

  // 日付を「YYYY年MM月DD日（曜）」形式でフォーマット
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // 時刻を「HH:mm」形式でフォーマット
  const formatTime = (timeValue: string | Date): string => {
    try {
      const date = typeof timeValue === 'string' ? new Date(timeValue) : timeValue;
      return date.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      return typeof timeValue === 'string' ? timeValue : timeValue.toISOString();
    }
  };

  // 勤務時間を計算
  const calculateWorkDuration = (record: TimeRecord): string => {
    if (!record.entries || record.entries.length === 0) {
      return '記録なし';
    }
    
    return formatWorkDuration(record.totalWorkDuration || 0);
  };

  // 合計勤務時間を計算
  const calculateTotalDuration = (records: TimeRecord[]): string => {
    let totalMinutes = 0;
    
    records.forEach(record => {
      if (record.totalWorkDuration) {
        totalMinutes += record.totalWorkDuration;
      }
    });
    
    return formatWorkDuration(totalMinutes);
  };

  // 勤務時間範囲を取得
  const getWorkTimeRange = (record: TimeRecord): { start: string, end: string } => {
    if (!record.entries || record.entries.length === 0) {
      return { start: '未出勤', end: '--' };
    }
    
    const firstEntry = record.entries[0];
    const lastEntry = record.entries[record.entries.length - 1];
    
    const start = formatTime(firstEntry.clockIn);
    const end = lastEntry.clockOut ? formatTime(lastEntry.clockOut) : '勤務中';
    
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
    
    return { status: '完了', color: 'text-green-600' };
  };

  if (isLoading) {
    return (
      <main className="container mx-auto py-8 px-4">
        <div className="text-center text-gray-600 dark:text-gray-300">
          読み込み中...
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          打刻履歴
        </h1>
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ホームに戻る
        </Link>
      </div>

      {allRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-600 dark:text-gray-300 mb-4">
            まだ打刻記録がありません
          </div>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 underline"
          >
            打刻を開始する
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 左側: フィルターとリスト */}
          <div className="space-y-6">
            {/* フィルター */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                期間で絞り込み
              </h2>
              <DateFilter 
                records={allRecords} 
                onFilter={handleFilter}
              />
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                表示中: {filteredRecords.length}件 / 全{allRecords.length}件
                {filteredRecords.length > 0 && (
                  <span className="ml-4">
                    合計勤務時間: {calculateTotalDuration(filteredRecords)}
                  </span>
                )}
              </div>
            </div>

            {/* 履歴リスト */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  履歴一覧
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                {filteredRecords.map((record) => {
                  const timeRange = getWorkTimeRange(record);
                  const workStatus = getWorkStatus(record);
                  
                  return (
                    <button
                      key={record.id}
                      onClick={() => handleDateSelect(record.date)}
                      className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        selectedDate === record.date ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800 dark:text-white">
                            {formatDate(record.date)}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {timeRange.start} - {timeRange.end}
                          </div>
                          {record.entries && record.entries.length > 1 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {record.entries.length}回の打刻
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-800 dark:text-white">
                            {calculateWorkDuration(record)}
                          </div>
                          <div className={`text-xs ${workStatus.color}`}>
                            {workStatus.status}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 右側: 詳細とカレンダー */}
          <div className="space-y-6">
            {/* 詳細 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                詳細情報
              </h2>
              
              {selectedRecord ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">日付</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {formatDate(selectedRecord.date)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">総勤務時間</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {calculateWorkDuration(selectedRecord)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">出勤・退勤回数</div>
                    <div className="font-medium text-gray-800 dark:text-white">
                      {selectedRecord.entries ? selectedRecord.entries.length : 0}回
                    </div>
                  </div>

                  {/* 個別の出勤・退勤エントリ */}
                  {selectedRecord.entries && selectedRecord.entries.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">詳細記録</div>
                      <div className="space-y-2">
                        {selectedRecord.entries.map((entry, index) => (
                          <div key={entry.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-800 dark:text-white">
                                  {index + 1}回目
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  {formatTime(entry.clockIn)} - {entry.clockOut ? formatTime(entry.clockOut) : '勤務中'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-800 dark:text-white">
                                {entry.duration ? formatWorkDuration(entry.duration) : '計算中...'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600 dark:text-gray-300">
                  履歴を選択してください
                </div>
              )}
            </div>

            {/* カレンダー */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                カレンダー
              </h2>
              <MonthCalendar 
                records={allRecords}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                showAttendanceStatus={true}
                showHolidays={true}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
