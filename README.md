# 出退勤管理アプリ

シンプルで使いやすい出退勤記録システムです。PostgreSQLデータベースとNextAuth.jsによる認証機能を活用し、安全でスケーラブルな勤怠管理を実現します。打刻記録の管理、勤務時間の自動計算、カレンダー表示、ユーザー認証などの機能を備えています。

## 🚀 機能一覧

### 認証機能
- ✅ ユーザー登録・ログイン
- ✅ セッション管理
- ✅ セキュアな認証システム（NextAuth.js）

### 基本機能
- ✅ 出勤・退勤の打刻
- ✅ リアルタイムでの勤務状況表示
- ✅ 勤務時間の自動計算
- ✅ PostgreSQLデータベースでの永続的データ保存

### 履歴機能
- ✅ 日付別打刻履歴の表示
- ✅ 履歴のフィルタリング
- ✅ 勤務時間の集計
- ✅ ユーザー別データ管理

### カレンダー機能
- ✅ 月間カレンダーでの出勤状況表示
- ✅ 営業日・出勤日のカウント
- ✅ 祝日・休日の表示

## 📱 スクリーンショット

![出退勤管理アプリのスクリーンショット](./public/screenshot.png)

## 🛠️ 技術スタック

### フロントエンド
- [Next.js 15](https://nextjs.org/) - Reactフレームワーク（Turbopack対応）
- [React 19](https://react.dev/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - モダンなCSSフレームワーク

### バックエンド
- [NextAuth.js v5](https://next-auth.js.org/) - 認証システム
- [Prisma](https://www.prisma.io/) - ORMとデータベース管理
- [PostgreSQL](https://www.postgresql.org/) - リレーショナルデータベース
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) - パスワードハッシュ化

### 開発ツール
- [Biome](https://biomejs.dev/) - 高速なリンター・フォーマッター
- [Jest](https://jestjs.io/) - テストフレームワーク
- [Testing Library](https://testing-library.com/) - React テストユーティリティ

## 🚀 セットアップと起動

### 前提条件
- Node.js 18以降
- PostgreSQLデータベース（または Supabase）
- npm または yarn

### インストール手順

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/time-card-app.git
cd time-card-app
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
# .env.localファイルを作成し、以下の変数を設定
DATABASE_URL="postgresql://username:password@localhost:5432/timecard"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. データベースマイグレーションを実行
```bash
npm run db:migrate
```

5. 開発サーバーを起動
```bash
npm run dev
```

6. ブラウザで以下のURLにアクセス
```
http://localhost:3000
```

### データベース管理

- マイグレーション: `npm run db:migrate`
- Prisma Studio: `npm run db:studio`
- スキーマ生成: `npm run db:generate`

## 📋 ページ構成

- **ホーム (`/`)**: 打刻ボタンと今日の勤務状況
- **ログイン (`/login`)**: ユーザーログインページ
- **登録 (`/register`)**: 新規ユーザー登録ページ
- **履歴 (`/history`)**: 日付別の打刻履歴
- **カレンダー (`/calendar`)**: 月間カレンダーでの勤務状況一覧
- **マイグレーション (`/migrate`)**: データベースマイグレーション管理

## 📊 今後の予定

- [ ] 休憩時間の記録
- [ ] データのエクスポート機能（CSV/Excel）
- [ ] 残業時間の計算と管理
- [ ] 打刻データの修正・削除機能
- [ ] 管理者機能（複数ユーザーの管理）
- [ ] ダッシュボード機能（統計・グラフ表示）
- [ ] モバイルアプリ対応（PWA）
- [ ] 通知機能（打刻忘れアラート）

## 🧪 テスト

```bash
# 全テストを実行
npm run test

# リンターチェック
npm run check
```

## 🐳 Docker対応

Docker Composeを使用した開発環境の構築も可能です：

```bash
docker-compose up -d
```

## 📁 プロジェクト構成

```
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── actions/        # Server Actions
│   └── [pages]/        # ページコンポーネント
├── components/         # Reactコンポーネント
│   ├── client/         # クライアントコンポーネント
│   └── server/         # サーバーコンポーネント
├── lib/                # ユーティリティ関数
├── prisma/             # データベーススキーマ・マイグレーション
├── services/           # ビジネスロジック
└── types/              # TypeScript型定義
```

## 📝 ライセンス

MIT License

## 👨‍💻 作者

**tkr53**

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成
