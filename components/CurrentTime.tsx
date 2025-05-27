'use client';

import { useState, useEffect } from 'react';
import type { FormattedTime } from '@/types';

interface CurrentTimeProps {
  className?: string;
}

/**
 * 現在時刻をリアルタイムで表示するコンポーネント
 */
export function CurrentTime({ className = '' }: CurrentTimeProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // 1秒ごとに時刻を更新
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date): FormattedTime => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const display = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    return {
      hours,
      minutes,
      display,
    };
  };

  const formattedTime = formatTime(currentTime);
  const formattedDate = currentTime.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className={`text-center ${className}`}>
      <div className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-2">
        {formattedTime.display}
      </div>
      <div className="text-lg md:text-xl text-gray-600 dark:text-gray-300">
        {formattedDate}
      </div>
    </div>
  );
}
