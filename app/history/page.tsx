import { getAllTimeRecords } from '@/services/serverTimeRecordService';
import { HistoryClient } from '@/components/client/HistoryClient';

interface HistoryPageProps {
  searchParams: Promise<{
    date?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  // すべての打刻データを取得
  const records = await getAllTimeRecords();
  const { date } = await searchParams;
  
  return (
    <HistoryClient 
      initialRecords={records}
      initialSelectedDate={date}
    />
  );
}