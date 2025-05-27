/**
 * 出退勤管理アプリの型定義
 */

// 打刻記録の型
export interface TimeRecord {
  id: string;
  date: string; // YYYY-MM-DD形式
  clockIn?: Date; // 出勤時刻
  clockOut?: Date; // 退勤時刻
  workDuration?: number; // 勤務時間（分）
  createdAt: Date; // 作成日時
  updatedAt: Date; // 更新日時
}

// 打刻状態の型
export type ClockStatus = 'not-clocked-in' | 'clocked-in' | 'clocked-out';

// 今日の勤務状況
export interface TodayWorkStatus {
  status: ClockStatus;
  clockInTime?: Date;
  clockOutTime?: Date;
  workDuration: number; // 分
  date: string; // YYYY-MM-DD形式
}

// 打刻ボタンの種類
export type ClockType = 'clock-in' | 'clock-out';

// LocalStorage用のデータ構造
export interface TimeCardData {
  records: TimeRecord[];
  lastUpdated: Date;
}

// 時間フォーマット用のユーティリティ型
export interface FormattedTime {
  hours: number;
  minutes: number;
  display: string; // "HH:MM"形式
}

// 統計情報の型
export interface WorkStatistics {
  totalWorkTime: number; // 総勤務時間（分）
  averageWorkTime: number; // 平均勤務時間（分）
  workDays: number; // 勤務日数
  period: {
    start: string;
    end: string;
  };
}
