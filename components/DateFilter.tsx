'use client';

import { useState } from 'react';
import { TimeRecord } from '@/types';

interface DateFilterProps {
  records: TimeRecord[];
  onFilter: (records: TimeRecord[]) => void;
  className?: string;
}

/**
 * 打刻履歴の日付フィルターコンポーネント
 */
export function DateFilter({ records, onFilter, className = '' }: DateFilterProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  
  // 利用可能な年のリストを取得
  const years = Array.from(new Set(records.map(record => record.date.substring(0, 4))))
    .sort((a, b) => b.localeCompare(a)); // 新しい年順
  
  // 利用可能な月のリストを取得（選択した年に基づく）
  const months = Array.from(
    new Set(
      records
        .filter(record => selectedYear ? record.date.startsWith(selectedYear) : true)
        .map(record => record.date.substring(5, 7))
    )
  ).sort((a, b) => a.localeCompare(b)); // 月順

  // フィルタリング適用
  const applyFilter = (year: string, month: string) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    
    let filtered = [...records];
    
    if (year) {
      filtered = filtered.filter(record => record.date.startsWith(year));
    }
    
    if (month) {
      filtered = filtered.filter(record => record.date.substring(5, 7) === month);
    }
    
    onFilter(filtered);
  };

  // 年選択ハンドラ
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const year = e.target.value;
    applyFilter(year, selectedMonth);
  };

  // 月選択ハンドラ
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value;
    applyFilter(selectedYear, month);
  };

  // フィルターリセットハンドラ
  const handleReset = () => {
    setSelectedYear('');
    setSelectedMonth('');
    onFilter(records);
  };

  return (
    <div className={`flex flex-wrap gap-4 ${className}`}>
      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          年
        </label>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべて</option>
          {years.map(year => (
            <option key={year} value={year}>{year}年</option>
          ))}
        </select>
      </div>
      
      <div className="flex-1 min-w-[120px]">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          月
        </label>
        <select
          value={selectedMonth}
          onChange={handleMonthChange}
          className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm px-3 py-2 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">すべて</option>
          {months.map(month => (
            <option key={month} value={month}>{parseInt(month)}月</option>
          ))}
        </select>
      </div>
      
      <div className="flex items-end">
        <button
          onClick={handleReset}
          className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-md transition-colors"
        >
          リセット
        </button>
      </div>
    </div>
  );
}
