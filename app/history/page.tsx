'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllTimeRecords, formatWorkDuration, getLocalDateString } from '@/services/timeRecordService';
import { DateFilter } from '@/components/DateFilter';
import { MonthCalendar } from '@/components/MonthCalendar';
import type { TimeRecord } from '@/types';

export default function HistoryPage() {
  const [allRecords, setAllRecords] = useState<TimeRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<TimeRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<TimeRecord | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // 履歴データの読み込み
  useEffect(() => {
    const loadRecords = () => {
      setIsLoading(true);
      const records = getAllTimeRecords();
      
      // 降順ソート（新しい順）
      const sortedRecords = [...records].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setAllRecords(sortedRecords);
      setFilteredRecords(sortedRecords);
      
      // デフォルトで最新の日付を選択
      if (sortedRecords.length > 0 && !selectedDate) {
        setSelectedDate(sortedRecords[0].date);
        setSelectedRecord(sortedRecords[0]);
      }
      
      setIsLoading(false);
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
  }, [selectedDate]);

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
      weekday: 'long'
    });
  };

  // 時刻を「HH:MM」形式でフォーマット
  const formatTime = (date?: Date): string => {
    if (!date) return '--:--';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  // 現在の月（YYYY-MM形式）を取得
  const getCurrentMonth = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-blue-500 hover:text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              ホームに戻る
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-white mb-2">
            日付別履歴
          </h1>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* サイドバー（カレンダーと検索フィルター） */}
          <div className="space-y-8 lg:col-span-1">
            {/* フィルター */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">絞り込み検索</h2>
              <DateFilter 
                records={allRecords} 
                onFilter={handleFilter}
                className="mb-4"
              />
            </section>

            {/* カレンダー */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">カレンダー</h2>
              <MonthCalendar 
                records={allRecords}
                selectedDate={selectedDate}
                onSelectDate={handleDateSelect}
                monthStr={getCurrentMonth()}
              />
            </section>
          </div>

          {/* メインコンテンツ（日付別履歴） */}
          <div className="lg:col-span-2 space-y-8">
            {/* 選択された日付の詳細 */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                {selectedDate ? formatDate(selectedDate) : '日付を選択してください'}
              </h2>
              
              {isLoading ? (
                <div className="text-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">データを読み込み中...</p>
                </div>
              ) : !selectedRecord ? (
                <div className="text-center p-12">
                  <p className="text-gray-600 dark:text-gray-400">選択された日の打刻記録はありません。</p>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">出勤時刻</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {formatTime(selectedRecord.clockIn)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">退勤時刻</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {formatTime(selectedRecord.clockOut)}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-500 dark:text-gray-400">勤務時間</p>
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        {selectedRecord.workDuration !== undefined
                          ? formatWorkDuration(selectedRecord.workDuration)
                          : '--:--'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">勤務詳細</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">記録ID</p>
                        <p className="text-gray-800 dark:text-gray-200 font-mono text-xs">
                          {selectedRecord.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">記録作成日時</p>
                        <p className="text-gray-800 dark:text-gray-200">
                          {selectedRecord.createdAt.toLocaleString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 履歴一覧 */}
            <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                打刻履歴一覧
              </h2>
              
              {isLoading ? (
                <div className="text-center p-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">データを読み込み中...</p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center p-12">
                  <p className="text-gray-600 dark:text-gray-400">条件に一致する打刻記録はありません。</p>
                </div>
              ) : (
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
                      {filteredRecords.map((record) => (
                        <tr 
                          key={record.id}
                          onClick={() => handleDateSelect(record.date)}
                          className={`
                            border-b border-gray-200 dark:border-gray-700 cursor-pointer
                            ${selectedDate === record.date ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'}
                          `}
                        >
                          <td className="py-3 px-4">
                            {new Date(record.date).toLocaleDateString('ja-JP', {
                              month: 'numeric',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </td>
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
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
