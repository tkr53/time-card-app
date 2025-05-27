/**
 * 日本の祝日を管理するサービス
 */
import { getLocalDateString } from '@/services/timeRecordService';

// 祝日の型定義
export interface Holiday {
  date: string; // YYYY-MM-DD形式
  name: string; // 祝日名
}

// 2025年の日本の祝日データ
const JAPAN_HOLIDAYS_2025: Holiday[] = [
  { date: '2025-01-01', name: '元日' },
  { date: '2025-01-13', name: '成人の日' },
  { date: '2025-02-11', name: '建国記念の日' },
  { date: '2025-02-23', name: '天皇誕生日' },
  { date: '2025-02-24', name: '天皇誕生日（振替休日）' },
  { date: '2025-03-20', name: '春分の日' },
  { date: '2025-04-29', name: '昭和の日' },
  { date: '2025-05-03', name: '憲法記念日' },
  { date: '2025-05-04', name: 'みどりの日' },
  { date: '2025-05-05', name: 'こどもの日' },
  { date: '2025-05-06', name: 'こどもの日（振替休日）' },
  { date: '2025-07-21', name: '海の日' },
  { date: '2025-08-11', name: '山の日' },
  { date: '2025-09-15', name: '敬老の日' },
  { date: '2025-09-23', name: '秋分の日' },
  { date: '2025-10-13', name: 'スポーツの日' },
  { date: '2025-11-03', name: '文化の日' },
  { date: '2025-11-23', name: '勤労感謝の日' },
  { date: '2025-11-24', name: '勤労感謝の日（振替休日）' }
];

// 2026年の日本の祝日データ（一部）
const JAPAN_HOLIDAYS_2026: Holiday[] = [
  { date: '2026-01-01', name: '元日' },
  { date: '2026-01-12', name: '成人の日' },
  { date: '2026-02-11', name: '建国記念の日' },
  { date: '2026-02-23', name: '天皇誕生日' },
  { date: '2026-03-20', name: '春分の日' }
];

/**
 * 指定した日付が祝日かどうか判定
 * @param dateStr YYYY-MM-DD形式の日付文字列
 * @returns 祝日データ（祝日でない場合はundefined）
 */
export function getHolidayInfo(dateStr: string): Holiday | undefined {
  return [...JAPAN_HOLIDAYS_2025, ...JAPAN_HOLIDAYS_2026].find(
    holiday => holiday.date === dateStr
  );
}

/**
 * 指定した月の祝日情報を取得
 * @param yearMonth YYYY-MM形式の年月文字列
 * @returns 祝日情報の配列
 */
export function getHolidaysInMonth(yearMonth: string): Holiday[] {
  return [...JAPAN_HOLIDAYS_2025, ...JAPAN_HOLIDAYS_2026].filter(
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
