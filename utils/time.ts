
import type { ClockEntry } from '@/types';

/**
 * 勤務時間を計算（分単位）
 */
export const calculateDuration = (clockIn: Date, clockOut: Date): number => {
  return Math.floor((clockOut.getTime() - clockIn.getTime()) / (1000 * 60));
};

/**
 * すべてのエントリの総勤務時間を計算
 */
export const calculateTotalDuration = (entries: ClockEntry[]): number => {
  return entries.reduce((total, entry) => total + (entry.duration || 0), 0);
};

/**
 * 勤務時間フォーマット（時間:分）
 */
export const formatWorkTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
};

/**
 * 勤務時間フォーマット（X時間Y分）
 */
export const formatWorkDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}時間${mins}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${mins}分`;
  }
};

/**
 * 時刻をフォーマット
 */
export function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}
