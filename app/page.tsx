'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import type { ClockStatus, ClockType } from "@/types";
import { CurrentTime } from "@/components/CurrentTime";
import { ClockButton } from "@/components/ClockButton";
import { TodayStatus } from "@/components/TodayStatus";
import { ClockHistory } from "@/components/ClockHistory";
import WorkSummary from "@/components/WorkSummary";
import { recordClock, getTodayTimeRecord } from "@/services/timeRecordService";

export default function Home() {
  const [clockStatus, setClockStatus] = useState<ClockStatus>('not-clocked-in');
  const [isInitialized, setIsInitialized] = useState(false);

  // アプリ起動時に、LocalStorageから状態を復元
  useEffect(() => {
    const initializeStatus = () => {
      const todayRecord = getTodayTimeRecord();
      
      if (todayRecord) {
        if (todayRecord.clockOut) {
          setClockStatus('clocked-out');
        } else if (todayRecord.clockIn) {
          setClockStatus('clocked-in');
        } else {
          setClockStatus('not-clocked-in');
        }
      }
      
      setIsInitialized(true);
    };
    
    initializeStatus();
  }, []);

  const handleClock = (type: ClockType) => {
    try {
      // LocalStorageに打刻データを保存
      const updatedRecord = recordClock(type);
      
      // UI状態を更新
      if (type === 'clock-in') {
        setClockStatus('clocked-in');
      } else if (type === 'clock-out') {
        setClockStatus('clocked-out');
      }

      // LocalStorageの変更イベントを発火（他のコンポーネントに変更を通知）
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('打刻処理中にエラーが発生しました:', error);
      alert(`エラー: ${error instanceof Error ? error.message : '打刻処理中に問題が発生しました。'}`);
    }
  };

  const getStatusMessage = () => {
    switch (clockStatus) {
      case 'not-clocked-in':
        return { text: '出勤前', color: 'text-gray-600' };
      case 'clocked-in':
        return { text: '勤務中', color: 'text-blue-600' };
      case 'clocked-out':
        return { text: '退勤済み', color: 'text-green-600' };
      default:
        return { text: '状態不明', color: 'text-gray-600' };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4">
            出退勤管理
          </h1>
          <div className={`text-xl font-semibold ${statusMessage.color}`}>
            {isInitialized ? statusMessage.text : '読み込み中...'}
          </div>
        </header>

        <main className="space-y-12">
          {/* 現在時刻表示 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <CurrentTime className="mb-4" />
          </section>

          {/* 打刻ボタン */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-8">
              打刻
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <ClockButton
                type="clock-in"
                status={clockStatus}
                onClock={handleClock}
                disabled={!isInitialized}
              />
              <ClockButton
                type="clock-out"
                status={clockStatus}
                onClock={handleClock}
                disabled={!isInitialized}
              />
            </div>
          </section>

          {/* 今日の勤務状況 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              今日の勤務状況
            </h2>
            {isInitialized ? (
              <TodayStatus />
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>データを読み込み中...</p>
              </div>
            )}
          </section>
          
          {/* 勤務時間集計 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
              勤務時間集計
            </h2>
            {isInitialized ? (
              <WorkSummary />
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>集計中...</p>
              </div>
            )}
          </section>

          {/* 打刻履歴 */}
          <section className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                最近の打刻履歴
              </h2>
              <Link href="/history" className="text-blue-500 hover:text-blue-700 flex items-center text-sm">
                すべての履歴を見る
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
            {isInitialized ? (
              <ClockHistory limit={7} />
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400 p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p>履歴を読み込み中...</p>
              </div>
            )}
          </section>
        </main>

        <footer className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p className="text-sm">出退勤管理アプリ v0.3.0</p>
        </footer>
      </div>
    </div>
  );
}
