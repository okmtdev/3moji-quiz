# ３もじ くいず

子供向けのひらがな3文字クイズゲームです。
10問のクイズに答えて、たくさん正解を目指しましょう！

## 機能

- ひらがな3文字の答えを選択肢から選ぶクイズゲーム
- 30問のストックからランダムに10問出題
- 正解数の記録（localStorage）と過去の結果閲覧
- LINEシェア機能
- PC・タブレット・スマホ対応（レスポンシブ）

## プロジェクト構成

```
3moji-quiz/
├── package.json
├── build.js          # ビルドスクリプト
├── server.js         # 開発用HTTPサーバー
├── src/
│   ├── index.html    # メインHTML
│   ├── style.css     # スタイル
│   ├── app.js        # ゲームロジック
│   └── questions.json # クイズ問題データ（30問）
└── dist/             # ビルド出力（デプロイ対象）
```

## 開発

### 必要なもの

- Node.js 18以上

### セットアップ

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### ビルド

```bash
npm run build
```

`dist/` ディレクトリにビルド結果が出力されます。

## クイズ問題の追加・編集

`src/questions.json` を編集してください。形式:

```json
{ "question": "もんだいぶん", "answer": "こたえ" }
```

- `answer` は必ずひらがな3文字にしてください

## デプロイ（Google Cloud Storage）

### 1. GCS バケットの作成

```bash
# バケットを作成（バケット名は一意である必要があります）
gsutil mb -l asia-northeast1 gs://YOUR_BUCKET_NAME

# 公開設定
gsutil iam ch allUsers:objectViewer gs://YOUR_BUCKET_NAME

# ウェブサイト設定
gsutil web set -m index.html gs://YOUR_BUCKET_NAME
```

### 2. ビルド＆デプロイ

```bash
# ビルド
npm run build

# デプロイ
gsutil -m rsync -r -d dist gs://YOUR_BUCKET_NAME
```

または `package.json` の `deploy` スクリプトを編集してバケット名を設定:

```bash
npm run deploy
```

### 3. アクセス

```
https://storage.googleapis.com/YOUR_BUCKET_NAME/index.html
```

カスタムドメインを使う場合は、Cloud Storage のドキュメントを参照してください。

## ライセンス

ISC
