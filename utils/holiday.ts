
/**
 * 日本の祝日を管理するサービス
 */
import { getLocalDateString } from '@/utils/date';

import holidaysData from '@/holidays.json';

// 祝日の型定義
export interface Holiday {
  date: string; // YYYY-MM-DD形式
  name: string; // 祝日名
}

const allHolidays: Holiday[] = Object.values(holidaysData).flat();

/**
 * 指定した日付が祝日かどうか判定
 * @param dateStr YYYY-MM-DD形式の日付文字列
 * @returns 祝日データ（祝日でない場合はundefined）
 */
export function getHolidayInfo(dateStr: string): Holiday | undefined {
  return allHolidays.find(
    holiday => holiday.date === dateStr
  );
}

/**
 * 指定した月の祝日情報を取得
 * @param yearMonth YYYY-MM形式の年月文字列
 * @returns 祝日情報の配列
 */
export function getHolidaysInMonth(yearMonth: string): Holiday[] {
  return allHolidays.filter(
    holiday => holiday.date.startsWith(yearMonth)
  );
}

/**
 * 指定した日付が営業日（平日かつ祝日でない）かどうかを判定
 * @param dateStr YYYY-MM-DD形式の日付文字列
 * @returns 営業日ならtrue、それ以外はfalse
 */
export function isBusinessDay(dateStr: string): boolean {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  // 土曜日(6)または日曜日(0)なら営業日ではない
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }
  
  // 祝日なら営業日ではない
  const holiday = getHolidayInfo(dateStr);
  return !holiday;
}

/**
 * 指定した期間の営業日数をカウント
 * @param startDate 開始日付（YYYY-MM-DD形式）
 * @param endDate 終了日付（YYYY-MM-DD形式）
 * @returns 営業日数
 */
export function countBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  
  // 1日ずつ数える
  const current = new Date(start);
  while (current <= end) {
    const dateStr = getLocalDateString(current);
    if (isBusinessDay(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}
