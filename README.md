[English](./README-en.md)

# AWS Lambda テンプレート

このリポジトリは、AWS Lambda アプリケーションのサンプルプロジェクトです。TypeScript で開発され、Docker を使用してローカル開発環境をセットアップし、AWS Lambda にデプロイするための構成が含まれています。package.json のプロジェクト名、docker compose におけるサービス・コンテナ名は github action により、作成時に自動でレポジトリ名に初期化されます。

## 目次

- [前提条件](#前提条件)
- [プロジェクト構成](#プロジェクト構成)
- [セットアップ手順](#セットアップ手順)
- [ローカル開発環境](#ローカル開発環境)
- [ビルド](#ビルド)
- [デプロイ](#デプロイ)

## 前提条件

以下のツールがインストールされていることを確認してください：

- Docker と Docker Compose
- AWS アカウント（デプロイ時に必要）

## プロジェクト構成

```
aws-lambda-study/
├── function/               # Lambda 関数のソースコード
│   └── function.ts         # サンプル Hello World 関数
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
cd aws-lambda-template
```

2. 環境変数を設定します

`.env` ファイルをプロジェクトのルートディレクトリに作成し、必要な環境変数を設定します：

## ローカル開発環境

Docker Compose を使用してローカル開発環境を起動します：

```bash
docker compose up --build
```

Lambda 関数をローカルでテストするには、テストスクリプトを実行します：

```bash
bash ./test/test.bash
```

## ビルド

### TypeScript のコンパイル

TypeScript のコードをコンパイルするには：

```bash
npm run build
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
