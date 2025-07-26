[English](./README-en.md)

# Stripe Webhook AWS Lambda

このリポジトリは、Stripe Webhookを処理するAWS Lambda関数のプロジェクトです。TypeScript で開発され、Stripe の決済完了イベントを受信してクレジット追加処理を行います。

## 目次

- [前提条件](#前提条件)
- [プロジェクト構成](#プロジェクト構成)
- [セットアップ手順](#セットアップ手順)
- [環境変数](#環境変数)
- [ローカル開発環境](#ローカル開発環境)
- [ビルド](#ビルド)
- [デプロイ](#デプロイ)

## 前提条件

以下のツールがインストールされていることを確認してください：

- Docker と Docker Compose
- AWS アカウント（デプロイ時に必要）
- StripeアカウントとAPIキー

## プロジェクト構成

```
stripe-webhook-lambda/
├── function/               # Lambda 関数のソースコード
│   └── function.ts         # Stripe Webhook処理関数
├── build/                  # デプロイ用ファイル出力ディレクトリ
├── Dockerfile              # Docker イメージ定義
├── docker-compose.yaml     # ローカル開発環境の構成
├── package.json            # プロジェクト依存関係
├── tsconfig.json           # TypeScript 設定
├── .env.template           # 環境変数ひながた
└── .env                    # 環境変数（自身で作成してください）
```

## セットアップ手順

1. リポジトリをクローンします

```bash
git clone <repository-url>
cd stripe-webhook-lambda
```

2. 環境変数を設定します

`.env` ファイルをプロジェクトのルートディレクトリに作成し、必要な環境変数を設定します：

## 環境変数

以下の環境変数を `.env` ファイルに設定してください：

```bash
# Stripe設定
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# バックエンドサーバー設定
BACKEND_BASE_URL=https://your-backend-api.com
BACKEND_API_KEY=your-backend-api-key
```

## 機能

- **Stripe Webhook署名検証**: セキュリティのためのWebhook署名検証
- **決済完了イベント処理**: `checkout.session.completed` イベントの処理
- **クレジット追加**: バックエンドAPIへのクレジット追加リクエスト
- **エラーハンドリング**: 包括的なエラー処理とログ出力
```

これにより、`functions` ディレクトリ内の TypeScript ファイルがコンパイルされ、`app` ディレクトリに JavaScript ファイルが生成されます。

### デプロイパッケージの作成

build ディレクトリを作成していない場合は、作成してください`mkdir build`

```bash
docker compose up -d
docker cp lambda-service:/tmp/lambda.zip ./build/lambda.zip
docker cp lambda-service:/tmp/index.js ./build/index.js
```

このスクリプトは次の処理を行います：

1. TypeScript コードのコンパイル
2. ZIP 形式のデプロイパッケージを `build/` ディレクトリにコピー
3. (このステップは任意です)トランスパイルされた.js ファイルを`build/`ディレクトリにコピー

## デプロイ

### AWS マネジメントコンソールを使用したデプロイ

1. [AWS マネジメントコンソール](https://console.aws.amazon.com/) にログインします
2. Lambda サービスに移動します
3. 「関数の作成」をクリックし、必要な情報を入力します
4. 「.zip ファイルをアップロード」を選択し、`build/lambda.zip` をアップロードします
5. 環境変数を設定します（必要に応じて）
