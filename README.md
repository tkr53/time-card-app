# 出退勤管理アプリ

シンプルで使いやすい出退勤記録システムです。LocalStorageを利用してブラウザ上でデータを保存し、打刻記録の管理や勤務時間の自動計算、カレンダー表示などの機能を備えています。

このアプリケーションはVibe Codingにより作成されました。

## 🚀 機能一覧

### 基本機能
- ✅ 出勤・退勤の打刻
- ✅ リアルタイムでの勤務状況表示
- ✅ 勤務時間の自動計算
- ✅ LocalStorageを使用したデータ保存

### 履歴機能
- ✅ 日付別打刻履歴の表示
- ✅ 履歴のフィルタリング
- ✅ 勤務時間の集計

### カレンダー機能
- ✅ 月間カレンダーでの出勤状況表示
- ✅ 営業日・出勤日のカウント
- ✅ 祝日・休日の表示

## 📱 スクリーンショット

![出退勤管理アプリのスクリーンショット](./public/screenshot.png)

## 🛠️ 技術スタック

- [Next.js 15](https://nextjs.org/) - Reactフレームワーク
- [React 19](https://react.dev/) - UIライブラリ
- [TypeScript](https://www.typescriptlang.org/) - 型安全な開発
- [Tailwind CSS](https://tailwindcss.com/) - スタイリング
- [LocalStorage API](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage) - データ保存
- [Vibe Coding](https://code.visualstudio.com/blogs/2023/03/30/vscode-copilot) - 開発支援ツール

## 🚀 使い方

1. リポジトリをクローン
```bash
git clone https://github.com/yourusername/time-card-app.git
cd time-card-app
```

2. 依存関係をインストール
```bash
npm install
```

3. 開発サーバーを起動
```bash
npm run dev
```

4. ブラウザで以下のURLにアクセス
```
http://localhost:3000
```

## 📋 ページ構成

- **ホーム (`/`)**: 打刻ボタンと今日の勤務状況
- **履歴 (`/history`)**: 日付別の打刻履歴
- **カレンダー (`/calendar`)**: 月間カレンダーでの勤務状況一覧

## 📊 今後の予定

- [ ] 休憩時間の記録
- [ ] データのエクスポート機能
- [ ] 残業時間の計算
- [ ] 打刻データの修正・削除機能

## 👨‍💻 開発プロセス

このプロジェクトは[Vibe Coding](https://code.visualstudio.com/blogs/2023/03/30/vscode-copilot)を活用して開発されました。AIを活用したコーディング支援ツールによって、以下のような利点を得ることができました：

- 効率的なコード生成
- デザインパターンの一貫性
- バグの早期発見と修正
- 開発時間の短縮

## 📝 ライセンス

MIT
