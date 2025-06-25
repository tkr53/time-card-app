
/**
 * 日付関連のユーティリティ関数
 */

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
