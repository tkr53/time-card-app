# リファクタリングTODOリスト

## 1. 役割に応じたディレクトリ構成への変更

- [ ] `services` ディレクトリを廃止し、以下のディレクトリにファイルを再配置する。
  - `lib/`: Prismaクライアントの初期化 (`prisma.ts`) や、データベースと直接やり取りするコアなロジックを配置する。
  - `app/actions/`: Server Actions を配置する。認証状態のチェックや、データベース操作の呼び出しなど、サーバーサイドで実行されるべき処理をここに集約する。
  - `utils/`: 日付フォーマットや勤務時間の計算など、特定のフレームワークに依存しない汎用的な関数を配置する。

## 2. 処理の責務分離

- [ ] `databaseTimeRecordService.ts` を分割する。
  - [ ] データベースアクセスに特化した関数群を `lib/prisma/timeRecord.ts` のようなファイルに切り出す。
  - [ ] 勤務時間の計算 (`calculateDuration`, `calculateTotalDuration`) や日付文字列の生成 (`getTodayDateString`) といったユーティリティ関数を `utils/date.ts` や `utils/time.ts` に移動する。
- [ ] `serverTimeRecordService.ts` と `timeRecordService.ts` を統合する。
  - [ ] CookieやLocalStorageへのアクセスロジックは、データ移行が完了していれば不要になるため、`migrationService.ts` を除き、関連コードを削除する。
- [ ] `databaseServerService.ts` を廃止する。
  - [ ] 認証状態を確認して `databaseTimeRecordService.ts` の関数を呼び出す処理は Server Actions (`app/actions/timeRecord.ts` など) に移管する。

## 3. 認証処理の集約

- [ ] Server Actions の冒頭で認証状態を確認し、非認証ユーザーの場合はエラーを返すか、リダイレクトするようにする。

## 4. 祝日データの外部ファイル化・API化

- [ ] `holidayService.ts` にハードコードされている祝日データを `json` ファイルとして分離するか、外部の祝日APIを利用する。
