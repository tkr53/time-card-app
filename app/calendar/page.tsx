import { MonthCalendar } from '@/components/client/MonthCalendar';
import { getAllTimeRecords } from '@/services/databaseServerService';

// 動的レンダリングを強制（認証のため）
export const dynamic = 'force-dynamic';

/**
 * カレンダーページ
 * 月間カレンダーで出勤状況を確認できるページ
 */
export default async function CalendarPage() {
  // すべての打刻データを取得
  const records = await getAllTimeRecords();
  
  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        出勤カレンダー
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <MonthCalendar 
          records={records}
          showAttendanceStatus={true}
          showHolidays={true}
          className="mb-8"
        />
        
        <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            カレンダーの見方
          </h2>
          
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-b-4 border-green-500"></div>
              <span className="text-sm">出勤済（終日）</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-b-4 border-yellow-500"></div>
              <span className="text-sm">出勤中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-b-4 border-red-500"></div>
              <span className="text-sm">欠勤</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-block w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-sm">祝日</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span className="text-sm">打刻記録あり</span>
            </div>
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-sm">赤字の日付</span>
              <span className="text-sm">= 休日・祝日</span>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            ※日付をクリックすると、その日の打刻履歴詳細を確認できます
          </div>
        </div>
      </div>
    </main>
  );
}
