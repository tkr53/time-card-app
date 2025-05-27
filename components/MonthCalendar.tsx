'use client';

import { useState, useEffect } from 'react';
import type { TimeRecord } from '@/types';
import { getHolidayInfo, isBusinessDay } from '@/services/holidayService';
import { getTodayDateString } from '@/services/timeRecordService';

interface MonthCalendarProps {
  records: TimeRecord[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  monthStr?: string; // YYYY-MM形式
  showAttendanceStatus?: boolean; // 出勤状況を表示するかどうか
  showHolidays?: boolean; // 祝日を表示するかどうか
  className?: string;
}

/**
 * 月間カレンダーコンポーネント
 */
export function MonthCalendar({
  records,
  selectedDate,
  onSelectDate,
  monthStr,
  showAttendanceStatus = true,
  showHolidays = true,
  className = ''
}: MonthCalendarProps) {
  const [calendarDays, setCalendarDays] = useState<Array<{
    date: string; 
    dayOfMonth: number; 
    isCurrentMonth: boolean; 
    hasRecord: boolean;
    isWorkingDay: boolean; // 平日（営業日）かどうか
    isWeekend: boolean;
    holidayName?: string; // 祝日名
    attendanceStatus?: 'present' | 'absent' | 'partial'; // 出勤状況（終日出勤/欠勤/部分出勤）
  }>>([]);
  const [currentMonth, setCurrentMonth] = useState<string>(monthStr || getYearMonthFromDate(new Date()));
  const [workdayCount, setWorkdayCount] = useState<number>(0); // 営業日数
  const [attendanceCount, setAttendanceCount] = useState<number>(0); // 出勤日数
  
  // カレンダーデータ生成
  useEffect(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    generateCalendarDays(year, month - 1); // JavaScriptの月は0-11
  }, [currentMonth, records]);
  
  // YYY-MM形式の日付を取得
  function getYearMonthFromDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  
  // カレンダーのデータを生成
  function generateCalendarDays(year: number, month: number) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // 1日の曜日（0: 日曜日, ..., 6: 土曜日）
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // 前月の残りの日を表示
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    const days = [];
    
    // 前月の日を追加
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      const date = new Date(year, month - 1, day);
      const dateStr = formatDateToString(date);
      const hasRecord = records.some(record => record.date === dateStr);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = showHolidays ? getHolidayInfo(dateStr) : undefined;
      const isWorkingDay = !isWeekend && !holiday;
      
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: false,
        hasRecord,
        isWeekend,
        isWorkingDay,
        holidayName: holiday?.name
      });
    }
    
    // 当月の日を追加
    let workingDaysCount = 0; // 当月の営業日カウント
    let attendanceDaysCount = 0; // 当月の出勤日カウント
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDateToString(date);
      const hasRecord = records.some(record => record.date === dateStr);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = showHolidays ? getHolidayInfo(dateStr) : undefined;
      const isWorkingDay = !isWeekend && !holiday;
      
      // 勤怠状況の判定
      let attendanceStatus: 'present' | 'absent' | 'partial' | undefined;
      
      if (showAttendanceStatus && isWorkingDay) {
        workingDaysCount++; // 営業日カウント増加
        
        const record = records.find(r => r.date === dateStr);
        if (record) {
          if (record.clockIn && record.clockOut) {
            attendanceStatus = 'present'; // 出勤済・退勤済
            attendanceDaysCount++; // 出勤日カウント増加
          } else if (record.clockIn) {
            attendanceStatus = 'partial'; // 出勤済・退勤未
            attendanceDaysCount++; // 出勤日カウント増加
          }
        } else if (new Date(dateStr) < new Date(getTodayDateString())) {
          // 過去の日付で記録がない場合は欠勤
          attendanceStatus = 'absent';
        }
      }
      
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: true,
        hasRecord,
        isWeekend,
        isWorkingDay,
        holidayName: holiday?.name,
        attendanceStatus
      });
    }
    
    // 次月の日を追加（6週間表示するために必要な分）
    const daysNeeded = 42 - days.length; // 6週間 = 42日
    for (let day = 1; day <= daysNeeded; day++) {
      const date = new Date(year, month + 1, day);
      const dateStr = formatDateToString(date);
      const hasRecord = records.some(record => record.date === dateStr);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const holiday = showHolidays ? getHolidayInfo(dateStr) : undefined;
      const isWorkingDay = !isWeekend && !holiday;
      
      days.push({
        date: dateStr,
        dayOfMonth: day,
        isCurrentMonth: false,
        hasRecord,
        isWeekend,
        isWorkingDay,
        holidayName: holiday?.name
      });
    }
    
    setCalendarDays(days);
    setWorkdayCount(workingDaysCount);
    setAttendanceCount(attendanceDaysCount);
  }
  
  // 日付をYYYY-MM-DD形式の文字列に変換
  function formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // 前月に移動
  const goToPrevMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };
  
  // 次月に移動
  const goToNextMonth = () => {
    const [year, month] = currentMonth.split('-').map(Number);
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setCurrentMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };
  
  // 表示する月を「YYYY年MM月」形式でフォーマット
  const formatYearMonth = (yearMonthStr: string): string => {
    const [year, month] = yearMonthStr.split('-');
    return `${year}年${parseInt(month)}月`;
  };
  
  // 日付クリックハンドラ
  const handleDateClick = (dateStr: string) => {
    onSelectDate(dateStr);
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="前月"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          {formatYearMonth(currentMonth)}
        </h3>
        
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="次月"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {showAttendanceStatus && (
        <div className="mb-2 text-sm flex justify-between items-center text-gray-600 dark:text-gray-300">
          <div>
            営業日数: <span className="font-semibold">{workdayCount}日</span>
          </div>
          <div>
            出勤日数: <span className="font-semibold">{attendanceCount}日</span>
            {workdayCount > 0 && (
              <span className="ml-1 text-xs">
                ({Math.round((attendanceCount / workdayCount) * 100)}%)
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-7 text-center">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="py-2 font-medium">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDateClick(day.date)}
            className={`
              p-2 border border-gray-100 dark:border-gray-700 relative cursor-pointer
              ${day.isCurrentMonth ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-500'}
              ${day.isWeekend ? 'text-red-500 dark:text-red-400' : ''}
              ${day.holidayName ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/10' : ''}
              ${selectedDate === day.date ? 'ring-2 ring-blue-500 z-10' : ''}
              hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors
              ${showAttendanceStatus && day.attendanceStatus === 'present' ? 'border-b-4 border-b-green-500' : ''}
              ${showAttendanceStatus && day.attendanceStatus === 'partial' ? 'border-b-4 border-b-yellow-500' : ''}
              ${showAttendanceStatus && day.attendanceStatus === 'absent' ? 'border-b-4 border-b-red-500' : ''}
            `}
          >
            <div className="text-sm">{day.dayOfMonth}</div>
            
            {/* 祝日名表示 */}
            {showHolidays && day.holidayName && (
              <div className="absolute top-1 right-1">
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title={day.holidayName}></span>
              </div>
            )}
            
            {/* 出勤記録マーカー */}
            {day.hasRecord && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
