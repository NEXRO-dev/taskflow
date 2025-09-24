# FlowCraft Pro

次世代のタスク管理システム。AI搭載のインテリジェントなタスク管理で生産性を革新します。

## 🚀 主要機能

- **AI搭載タスク生成** - 複雑なタスクを自動的にサブタスクに分解
- **音声入力** - 自然な音声でタスクを追加
- **ゲーミフィケーション** - XP獲得と実績システム
- **スマートスケジューリング** - インテリジェントなカレンダー統合
- **チーム連携** - シームレスなチームコラボレーション
- **300+連携** - Slack、Notion、Google Calendarなど

## 🛠️ 技術スタック

- **フロントエンド**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: Turso (SQLite)
- **状態管理**: Zustand
- **UI**: Lucide React Icons
- **デプロイ**: Vercel

## 📦 インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-username/taskflow-pro.git
cd taskflow-pro

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local

# 開発サーバーを起動
npm run dev
```

## 🔧 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```env
# Turso Database Configuration
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

## 📱 プラン構成

- **Free** - 基本機能（ダッシュボード、タスク、カレンダー）
- **Pro** - 個人向け全機能（プロジェクト、分析、目標）
- **Team** - チーム機能
- **Business** - 企業向け機能

## 🚀 デプロイ

### Vercel

1. GitHubリポジトリをVercelに接続
2. 環境変数を設定
3. 自動デプロイが開始されます

### 手動デプロイ

```bash
npm run build
npm start
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

## 📞 サポート

- ドキュメント: [docs.taskflow-pro.com](https://docs.taskflow-pro.com)
- サポート: [support@taskflow-pro.com](mailto:support@taskflow-pro.com)
