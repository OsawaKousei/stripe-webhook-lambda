[English](./README-en.md)

# Stripe Webhook Lambda

このプロジェクトは、StripeのWebhookイベント（特に `checkout.session.completed`）を処理するためのAWS Lambda関数を提供します。ローカルでのテストを容易にするため、Stripe CLIからのリクエストをAPI Gatewayの挙動を模倣してLambdaコンテナに中継するFastAPIリレーサーバーを含んでいます。

## アーキテクチャ

1.  **Stripe CLI**: `stripe listen` コマンドを使用して、Stripeで発生したイベントをローカルマシンに転送します。
2.  **FastAPI Relay Server**: `localhost:8010` でリクエストを受け取ります。このサーバーは、StripeからのHTTPリクエストを、Lambdaが期待するJSONイベント形式に変換する役割を担います。これは、AWS API Gatewayが通常行う処理をエミュレートします。
3.  **Lambda Function**: `localhost:9010` で実行されているLambdaコンテナが、リレーサーバーから変換されたイベントを受け取ります。この関数は、Stripeの署名を検証し、イベントを処理して、最終的にバックエンドシステムに通知を送信します（この部分は未実装です）。

この構成により、API Gatewayを実際にデプロイすることなく、ローカル環境でLambda関数の完全なテストが可能になります。

## 必要なもの

*   Docker
*   Docker Compose
*   Stripe CLI
*   Node.js (Lambda関数の開発用)
*   Python (リレーサーバーの開発用)

## セットアップ

1.  **リポジトリをクローン:**
    ```bash
    git clone git@github.com:OsawaKousei/stripe-webhook-lambda.git
    cd stripe-webhook-lambda
    ```

2.  **環境変数の設定:**
    `lambda/.env.template` をコピーして `lambda/.env` を作成し、必要な値を設定します。
    ```bash
    cp lambda/.env.template lambda/.env
    ```
    `lambda/.env` ファイルを編集してください。
    ```
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    BACKEND_BASE_URL=http://your-backend-api.com
    BACKEND_API_KEY=your-backend-api-key
    ```
    `STRIPE_WEBHOOK_SECRET` は、後述の `stripe listen` コマンドを実行した際に表示される値を使用してください。

## 実行方法

1.  **Dockerコンテナの起動:**
    プロジェクトのルートディレクトリで、以下のコマンドを実行してLambda関数とリレーサーバーを起動します。
    ```bash
    docker-compose up --build
    ```

2.  **Stripeイベントの転送:**
    別のターミナルを開き、Stripe CLIを使用してイベントをリレーサーバーに転送します。
    ```bash
    stripe listen --forward-to http://localhost:8010/relay
    ```
    このコマンドを実行すると、Webhook署名キー（`whsec_...`）が表示されます。この値をコピーし、`lambda/.env` ファイルの `STRIPE_WEBHOOK_SECRET` に設定してください。設定を変更した後は、`docker-compose up --build` を再実行してコンテナを再起動する必要があります。

3.  **テストイベントのトリガー:**
    Stripe CLIを使用して、テスト用のチェックアウトセッション完了イベントをトリガーします。
    ```bash
    stripe trigger checkout.session.completed
    ```

これで、Stripe → Stripe CLI → FastAPI Relay Server → Lambda Function の順にリクエストが流れ、コンテナのログに処理の様子が出力されます。

### デプロイパッケージの作成

`build` ディレクトリを作成していない場合は、作成してください。

```bash
mkdir build
```

次に、コンテナを起動し、ビルドされた成果物をコピーします。

```bash
docker compose up -d
docker cp stripe-webhook-lambda-lambda-service:/tmp/lambda.zip ./build/lambda.zip
docker cp stripe-webhook-lambda-lambda-service:/tmp/index.js ./build/index.js
```

このスクリプトは次の処理を行います：

1.  Dockerコンテナ内でTypeScriptコードをコンパイルします。
2.  デプロイ用のZIPパッケージ (`lambda.zip`) をコンテナからホストの `build/` ディレクトリにコピーします。
3.  (任意) トランスパイルされたJavaScriptファイル (`index.js`) も同様に `build/` ディレクトリにコピーします。これは、デプロイ前に中身を確認するのに便利です。
