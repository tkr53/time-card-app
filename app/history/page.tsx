import { getAllTimeRecords } from '@/app/actions/timeRecord';
import { HistoryClient } from '@/components/client/HistoryClient';

// 動的レンダリングを強制（認証のため）
export const dynamic = 'force-dynamic';

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