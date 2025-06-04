/**
 * 出退勤管理アプリの型定義
 */

// 個別の打刻エントリ（出勤・退勤のペア）
export interface ClockEntry {
  id: string;
  clockIn: Date | string; // 出勤時刻
  clockOut?: Date | string | null; // 退勤時刻（null = まだ退勤していない）
  duration?: number; // この期間の勤務時間（分）
}

// 打刻記録の型（1日分）
export interface TimeRecord {
  id: string;
  date: string; // YYYY-MM-DD形式
  userId?: string; // ユーザーID（オプショナル：既存データとの互換性を保つため）
  entries: ClockEntry[]; // 複数の出勤・退勤エントリ
  totalWorkDuration: number; // 1日の総勤務時間（分）
  createdAt?: Date | string; // 作成日時
  updatedAt?: Date | string; // 更新日時
}

// 打刻状態の型
export type ClockStatus = 'not-clocked-in' | 'clocked-in' | 'clocked-out';

// 今日の勤務状況
export interface TodayWorkStatus {
  status: ClockStatus;
  currentEntry?: ClockEntry; // 現在進行中のエントリ（出勤中の場合）
  entries: ClockEntry[]; // 今日の全エントリ
  totalWorkDuration: number; // 総勤務時間（分）
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

// ユーザー認証関連の型
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date | string;
  createdAt: Date | string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}
