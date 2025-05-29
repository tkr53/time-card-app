/**
 * 打刻データを管理するサービス（複数エントリ対応）
 */
import type { TimeRecord, TimeCardData, ClockType, WorkStatistics, ClockEntry, TodayWorkStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// LocalStorageのキー
const TIME_CARD_STORAGE_KEY = 'time-card-data';

/**
 * 日付をYYYY-MM-DD形式で取得（ローカルタイムゾーン考慮）
 * @param date 変換する日付（省略時は今日）
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export const getTodayDateString = (): string => {
  return getLocalDateString(new Date());
};

/**
 * 指定した日付の前日をYYYY-MM-DD形式で取得
 */
export const getPreviousDateString = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return getLocalDateString(date);
};

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
 * すべての打刻データを取得
 */
export const getAllTimeRecords = (): TimeRecord[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(TIME_CARD_STORAGE_KEY);
    if (!storedData) return [];
    
    const parsedData: TimeCardData = JSON.parse(storedData);
    return parsedData.records.map(record => ({
      ...record,
      entries: record.entries.map(entry => ({
        ...entry,
        clockIn: new Date(entry.clockIn),
        clockOut: entry.clockOut ? new Date(entry.clockOut) : null,
      })),
      createdAt: record.createdAt ? new Date(record.createdAt) : new Date(),
      updatedAt: record.updatedAt ? new Date(record.updatedAt) : new Date(),
    }));
  } catch (error) {
    console.error('打刻データの取得に失敗しました:', error);
    return [];
  }
};

/**
 * 指定日の打刻レコードを取得
 */
export const getTimeRecordByDate = (date: string): TimeRecord | undefined => {
  const records = getAllTimeRecords();
  return records.find(record => record.date === date);
};

/**
 * 今日の打刻レコードを取得
 */
export const getTodayRecord = (): TimeRecord | undefined => {
  return getTimeRecordByDate(getTodayDateString());
};

/**
 * 今日の勤務状況を取得
 */
export const getTodayStatus = (): TodayWorkStatus => {
  const todayRecord = getTodayRecord();
  const today = getTodayDateString();
  
  if (!todayRecord || todayRecord.entries.length === 0) {
    return {
      status: 'not-clocked-in',
      entries: [],
      totalWorkDuration: 0,
      currentEntry: undefined,
      date: today,
    };
  }

  // 現在アクティブなエントリ（clock-outがnull）を探す
  const currentEntry = todayRecord.entries.find(entry => entry.clockOut === null || entry.clockOut === undefined);

  if (currentEntry) {
    return {
      status: 'clocked-in',
      entries: todayRecord.entries,
      totalWorkDuration: todayRecord.totalWorkDuration,
      currentEntry,
      date: today,
    };
  } else {
    return {
      status: 'clocked-out',
      entries: todayRecord.entries,
      totalWorkDuration: todayRecord.totalWorkDuration,
      currentEntry: undefined,
      date: today,
    };
  }
};

/**
 * 打刻データを保存
 */
export const saveTimeRecords = (records: TimeRecord[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const timeCardData: TimeCardData = {
      records,
      lastUpdated: new Date(),
    };
    localStorage.setItem(TIME_CARD_STORAGE_KEY, JSON.stringify(timeCardData));
  } catch (error) {
    console.error('打刻データの保存に失敗しました:', error);
    throw new Error('データの保存に失敗しました');
  }
};

/**
 * 打刻処理
 */
export const clockInOut = (type: ClockType): TimeRecord => {
  const now = new Date();
  const today = getTodayDateString();
  const records = getAllTimeRecords();
  
  let todayRecord = records.find(record => record.date === today);

  if (type === 'clock-in') {
    // 新しいエントリを作成
    const newEntry: ClockEntry = {
      id: uuidv4(),
      clockIn: now,
      clockOut: undefined,
      duration: undefined,
    };

    if (!todayRecord) {
      // 今日のレコードが存在しない場合、新規作成
      todayRecord = {
        id: uuidv4(),
        date: today,
        entries: [newEntry],
        totalWorkDuration: 0,
        createdAt: now,
        updatedAt: now,
      };
      records.push(todayRecord);
    } else {
      // 既存のアクティブエントリがある場合はエラー
      const activeEntry = todayRecord.entries.find(entry => entry.clockOut === null || entry.clockOut === undefined);
      if (activeEntry) {
        throw new Error('既に出勤中です');
      }
      
      // 新しいエントリを追加
      todayRecord.entries.push(newEntry);
      todayRecord.updatedAt = now;
    }
  } else if (type === 'clock-out') {
    if (!todayRecord) {
      throw new Error('出勤記録がありません');
    }

    // アクティブなエントリを見つけて退勤処理
    const activeEntry = todayRecord.entries.find(entry => entry.clockOut === null || entry.clockOut === undefined);
    if (!activeEntry) {
      throw new Error('出勤中ではありません');
    }

    // エントリを完了
    activeEntry.clockOut = now;
    const clockInDate = activeEntry.clockIn instanceof Date ? activeEntry.clockIn : new Date(activeEntry.clockIn);
    activeEntry.duration = calculateDuration(clockInDate, now);
    
    // 総勤務時間を再計算
    todayRecord.totalWorkDuration = calculateTotalDuration(todayRecord.entries);
    todayRecord.updatedAt = now;
  }

  saveTimeRecords(records);
  return todayRecord!;
};

/**
 * 月間の勤務統計を取得
 */
export const getMonthlyStatistics = (year: number, month: number): WorkStatistics => {
  const records = getAllTimeRecords();
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  const monthlyRecords = records.filter(record => 
    record.date.startsWith(monthPrefix) && record.totalWorkDuration > 0
  );

  const workDays = monthlyRecords.length;
  const totalWorkTime = monthlyRecords.reduce((total, record) => 
    total + record.totalWorkDuration, 0
  );

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

  return {
    workDays,
    totalWorkTime,
    averageWorkTime: workDays > 0 ? totalWorkTime / workDays : 0,
    period: {
      start: startDate,
      end: endDate
    }
  };
};

/**
 * 週間の勤務統計を取得
 */
export const getWeeklyStatistics = (startDate: Date): WorkStatistics => {
  const records = getAllTimeRecords();
  const weeklyRecords: TimeRecord[] = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = getLocalDateString(currentDate);
    
    const record = records.find(r => r.date === dateString);
    if (record && record.totalWorkDuration > 0) {
      weeklyRecords.push(record);
    }
  }

  const workDays = weeklyRecords.length;
  const totalWorkTime = weeklyRecords.reduce((total, record) => 
    total + record.totalWorkDuration, 0
  );

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  return {
    workDays,
    totalWorkTime,
    averageWorkTime: workDays > 0 ? totalWorkTime / workDays : 0,
    period: {
      start: getLocalDateString(startDate),
      end: getLocalDateString(endDate)
    }
  };
};

/**
 * 年間の勤務統計を取得
 */
export const getYearlyStatistics = (year: number): WorkStatistics => {
  const records = getAllTimeRecords();
  const yearPrefix = `${year}-`;
  
  const yearlyRecords = records.filter(record => 
    record.date.startsWith(yearPrefix) && record.totalWorkDuration > 0
  );

  const workDays = yearlyRecords.length;
  const totalWorkTime = yearlyRecords.reduce((total, record) => 
    total + record.totalWorkDuration, 0
  );

  return {
    workDays,
    totalWorkTime,
    averageWorkTime: workDays > 0 ? totalWorkTime / workDays : 0,
    period: {
      start: `${year}-01-01`,
      end: `${year}-12-31`
    }
  };
};

/**
 * 指定した期間の勤務記録を取得
 */
export const getRecordsByDateRange = (startDate: string, endDate: string): TimeRecord[] => {
  const records = getAllTimeRecords();
  return records.filter(record => 
    record.date >= startDate && record.date <= endDate
  );
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
 * データのエクスポート
 */
export const exportTimeCardData = (): string => {
  const records = getAllTimeRecords();
  return JSON.stringify({ records }, null, 2);
};

/**
 * データのインポート
 */
export const importTimeCardData = (jsonData: string): void => {
  try {
    const data = JSON.parse(jsonData);
    if (data.records && Array.isArray(data.records)) {
      saveTimeRecords(data.records);
    } else {
      throw new Error('無効なデータ形式です');
    }
  } catch (error) {
    console.error('データのインポートに失敗しました:', error);
    throw new Error('データのインポートに失敗しました');
  }
};

/**
 * 全データの削除
 */
export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TIME_CARD_STORAGE_KEY);
};
