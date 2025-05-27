/**
 * 打刻データを管理するサービス
 */
import type { TimeRecord, TimeCardData, ClockType, WorkStatistics } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// LocalStorageのキー
const TIME_CARD_STORAGE_KEY = 'time-card-data';
// 日をまたいだ打刻の最大許容時間（ミリ秒）
const MAX_OVERNIGHT_WORK_MS = 24 * 60 * 60 * 1000; // 24時間

/**
 * 日付をYYYY-MM-DD形式で取得（ローカルタイムゾーン考慮）
 * @param date 変換する日付（省略時は今日）
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  // getMonthは0-11の値を返すので+1する
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
      clockIn: record.clockIn ? new Date(record.clockIn) : undefined,
      clockOut: record.clockOut ? new Date(record.clockOut) : undefined,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    }));
  } catch (error) {
    console.error('打刻データの取得に失敗しました:', error);
    return [];
  }
};

/**
 * 今日の打刻データを取得
 */
export const getTodayTimeRecord = (): TimeRecord | undefined => {
  const records = getAllTimeRecords();
  const todayDateString = getTodayDateString();
  return records.find(record => record.date === todayDateString);
};

/**
 * 指定した日付の打刻データを取得
 */
export const getTimeRecordByDate = (dateString: string): TimeRecord | undefined => {
  const records = getAllTimeRecords();
  return records.find(record => record.date === dateString);
};

/**
 * 打刻を追加/更新
 */
export const recordClock = (type: ClockType): TimeRecord => {
  const now = new Date();
  const todayDateString = getTodayDateString();
  const existingRecords = getAllTimeRecords();
  const todayRecord = existingRecords.find(record => record.date === todayDateString);

  let updatedRecord: TimeRecord;

  if (todayRecord) {
    // もし既に出勤打刻済みで退勤していない状態で出勤打刻しようとした場合はエラー
    if (type === 'clock-in' && todayRecord.clockIn && !todayRecord.clockOut) {
      console.error('すでに出勤打刻済みです');
      throw new Error('すでに出勤打刻済みです');
    }
    
    // もし退勤済みの日に再度出勤する場合は、新しい記録として追加
    if (type === 'clock-in' && todayRecord.clockOut) {
      // 新しいレコードを作成するため、現在の処理をスキップ
      const newRecord: TimeRecord = {
        id: uuidv4(),
        date: todayDateString,
        clockIn: now,
        createdAt: now,
        updatedAt: now
      };
      
      // 新しい記録を追加して保存
      saveTimeRecords([...existingRecords, newRecord]);
      return newRecord;
    }
    
    // 今日の記録が既に存在する場合は更新
    updatedRecord = {
      ...todayRecord,
      ...(type === 'clock-in' ? { clockIn: now } : { clockOut: now }),
      updatedAt: now
    };

    // 出勤・退勤両方が記録されている場合、勤務時間を計算
    if (updatedRecord.clockIn && updatedRecord.clockOut) {
      updatedRecord.workDuration = calculateWorkDuration(updatedRecord.clockIn, updatedRecord.clockOut);
    }

    // 既存の記録を更新
    const updatedRecords = existingRecords.map(record => 
      record.id === todayRecord.id ? updatedRecord : record
    );
    
    saveTimeRecords(updatedRecords);
  } else if (type === 'clock-out') {
    // 今日の記録がなく、退勤打刻の場合は前日の記録から日をまたいだ勤務として処理
    const yesterdayDateString = getPreviousDateString(todayDateString);
    const yesterdayRecord = existingRecords.find(record => record.date === yesterdayDateString);
    
    if (yesterdayRecord && yesterdayRecord.clockIn && !yesterdayRecord.clockOut) {
      // 前日に出勤記録があり、退勤記録がない場合
      const updatedYesterdayRecord = {
        ...yesterdayRecord,
        clockOut: now,
        updatedAt: now
      };
      
      // 日をまたいだ勤務時間を計算
      updatedYesterdayRecord.workDuration = calculateWorkDuration(
        updatedYesterdayRecord.clockIn, 
        updatedYesterdayRecord.clockOut,
        true // 日をまたいだフラグ
      );

      // 既存の記録を更新
      const updatedRecords = existingRecords.map(record => 
        record.id === yesterdayRecord.id ? updatedYesterdayRecord : record
      );
      
      saveTimeRecords(updatedRecords);
      return updatedYesterdayRecord;
    } else {
      // 前日の出勤記録がない場合は、今日の退勤記録として新規作成
      updatedRecord = {
        id: uuidv4(),
        date: todayDateString,
        clockOut: now,
        createdAt: now,
        updatedAt: now
      };
      
      // 新しい記録を追加して保存
      saveTimeRecords([...existingRecords, updatedRecord]);
      return updatedRecord;
    }
  } else {
    // 今日の記録がまだ無い場合は新規作成
    updatedRecord = {
      id: uuidv4(),
      date: todayDateString,
      ...(type === 'clock-in' ? { clockIn: now } : { clockOut: now }),
      createdAt: now,
      updatedAt: now
    };
    
    // 新しい記録を追加して保存
    saveTimeRecords([...existingRecords, updatedRecord]);
    return updatedRecord;
  }
  return updatedRecord;
};

/**
 * 打刻データをLocalStorageに保存
 */
const saveTimeRecords = (records: TimeRecord[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 重複するIDを持つレコードを削除（最初に見つかったもののみを残す）
    const uniqueRecords: TimeRecord[] = [];
    const seenIds = new Set<string>();
    
    records.forEach(record => {
      if (!seenIds.has(record.id)) {
        seenIds.add(record.id);
        uniqueRecords.push(record);
      } else {
        console.warn('重複するIDを持つレコードを検出:', record.id);
      }
    });
    
    const timeCardData: TimeCardData = {
      records: uniqueRecords,
      lastUpdated: new Date()
    };
    
    localStorage.setItem(TIME_CARD_STORAGE_KEY, JSON.stringify(timeCardData));
  } catch (error) {
    console.error('打刻データの保存に失敗しました:', error);
  }
};

/**
 * 勤務時間を計算（分単位）
 */
export const calculateWorkDuration = (clockIn?: Date, clockOut?: Date, isOvernight: boolean = false): number | undefined => {
  if (!clockIn || !clockOut) return undefined;
  
  // 秒数を切り捨てた時刻を作成（時間と分だけを考慮）
  const clockInWithoutSeconds = new Date(
    clockIn.getFullYear(), 
    clockIn.getMonth(), 
    clockIn.getDate(), 
    clockIn.getHours(), 
    clockIn.getMinutes(), 
    0, 
    0
  );
  
  const clockOutWithoutSeconds = new Date(
    clockOut.getFullYear(), 
    clockOut.getMonth(), 
    clockOut.getDate(), 
    clockOut.getHours(), 
    clockOut.getMinutes(), 
    0, 
    0
  );
  
  let durationMs: number;
  
  if (isOvernight) {
    // 日をまたいだ場合の処理
    // 出勤日の分の勤務時間（出勤時刻から24:00まで）
    const midnightInDate = new Date(
      clockIn.getFullYear(),
      clockIn.getMonth(),
      clockIn.getDate() + 1, // 翌日の0:00
      0, 0, 0, 0
    );
    
    const durationUntilMidnight = midnightInDate.getTime() - clockInWithoutSeconds.getTime();
    
    // 退勤日の分の勤務時間（0:00から退勤時刻まで）
    const midnightOutDate = new Date(
      clockOut.getFullYear(),
      clockOut.getMonth(),
      clockOut.getDate(),
      0, 0, 0, 0
    );
    
    const durationAfterMidnight = clockOutWithoutSeconds.getTime() - midnightOutDate.getTime();
    
    // 合計勤務時間
    durationMs = durationUntilMidnight + durationAfterMidnight;
  } else {
    // 同日内の勤務時間
    durationMs = clockOutWithoutSeconds.getTime() - clockInWithoutSeconds.getTime();
  }
  
  // 日をまたいでいる場合の妥当性チェック
  if (isOvernight && durationMs > MAX_OVERNIGHT_WORK_MS) {
    // 24時間以上の勤務は異常値とみなす（設定で変更可能）
    console.warn('勤務時間が24時間を超えています:', durationMs / (1000 * 60 * 60), '時間');
    return undefined;
  } else if (durationMs < 0) {
    // 出勤時刻が退勤時刻より後の場合（データ不整合）
    console.error('出勤時刻が退勤時刻より後になっています');
    return undefined;
  }
  
  return Math.round(durationMs / (1000 * 60)); // 分単位で計算（四捨五入）
};

/**
 * 勤務時間を時間:分形式にフォーマット
 */
export const formatWorkDuration = (minutes?: number): string => {
  if (minutes === undefined || isNaN(minutes)) return '--:--';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * 週間・月間の勤務時間集計
 */
export const getWorkSummary = (periodType: 'week' | 'month'): { 
  totalDuration: number; 
  records: TimeRecord[];
  startDate: string;
  endDate: string;
  averageDuration: number;
  workDays: number;
} => {
  const allRecords = getAllTimeRecords();
  const today = new Date();
  let startDate: Date;
  let endDate = new Date(today);
  
  // 期間の開始日を設定
  if (periodType === 'week') {
    // 今週の月曜日を取得（0:日曜日, 1:月曜日, ..., 6:土曜日）
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 月曜日を週の始まりとする
    startDate = new Date(today);
    startDate.setDate(today.getDate() - diff);
  } else {
    // 今月の1日を取得
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }
  
  // YYYY-MM-DD形式の日付文字列（ローカルタイムゾーン考慮）
  const startDateStr = getLocalDateString(startDate);
  const endDateStr = getLocalDateString(endDate);
  
  // 期間内のレコードをフィルタリング
  const filteredRecords = allRecords.filter(record => {
    const recordDate = record.date;
    return recordDate >= startDateStr && recordDate <= endDateStr;
  });
  
  // 有効な勤務データ（勤務時間がある）のレコード数
  const validRecords = filteredRecords.filter(record => 
    record.workDuration !== undefined && record.workDuration > 0
  );
  
  const workDays = validRecords.length;
  
  // 総勤務時間を計算
  const totalDuration = validRecords.reduce((total, record) => {
    return total + (record.workDuration || 0);
  }, 0);
  
  // 平均勤務時間を計算（分単位、勤務日がない場合は0）
  const averageDuration = workDays > 0 ? Math.round(totalDuration / workDays) : 0;
  
  return {
    totalDuration,
    averageDuration,
    workDays,
    records: filteredRecords,
    startDate: startDateStr,
    endDate: endDateStr
  };
};

/**
 * 統計情報を取得
 * @param days 取得する日数（デフォルト30日間）
 */
export const getWorkStatistics = (days: number = 30): WorkStatistics => {
  const allRecords = getAllTimeRecords();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  const startDateStr = getLocalDateString(startDate);
  const endDateStr = getLocalDateString(endDate);
  
  // 指定期間のレコードをフィルタリング
  const filteredRecords = allRecords.filter(record => {
    const recordDate = record.date;
    return recordDate >= startDateStr && recordDate <= endDateStr;
  });
  
  // 有効な勤務データ（勤務時間がある）のレコード
  const validRecords = filteredRecords.filter(record => 
    record.workDuration !== undefined && record.workDuration > 0
  );
  
  const workDays = validRecords.length;
  
  // 総勤務時間を計算
  const totalWorkTime = validRecords.reduce((total, record) => {
    return total + (record.workDuration || 0);
  }, 0);
  
  // 平均勤務時間を計算（分単位）
  const averageWorkTime = workDays > 0 ? Math.round(totalWorkTime / workDays) : 0;
  
  return {
    totalWorkTime,
    averageWorkTime,
    workDays,
    period: {
      start: startDateStr,
      end: endDateStr
    }
  };
};

/**
 * 日付範囲の勤務統計情報を取得
 */
export const getWorkStatisticsByDateRange = (startDate: string, endDate: string): WorkStatistics => {
  const allRecords = getAllTimeRecords();
  
  // 指定期間のレコードをフィルタリング
  const filteredRecords = allRecords.filter(record => {
    const recordDate = record.date;
    return recordDate >= startDate && recordDate <= endDate;
  });
  
  // 有効な勤務データ（勤務時間がある）のレコード
  const validRecords = filteredRecords.filter(record => 
    record.workDuration !== undefined && record.workDuration > 0
  );
  
  const workDays = validRecords.length;
  
  // 総勤務時間を計算
  const totalWorkTime = validRecords.reduce((total, record) => {
    return total + (record.workDuration || 0);
  }, 0);
  
  // 平均勤務時間を計算（分単位）
  const averageWorkTime = workDays > 0 ? Math.round(totalWorkTime / workDays) : 0;
  
  return {
    totalWorkTime,
    averageWorkTime,
    workDays,
    period: {
      start: startDate,
      end: endDate
    }
  };
};
