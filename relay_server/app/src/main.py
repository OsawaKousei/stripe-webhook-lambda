# relay_server_fastapi.py
# 必要なライブラリ: pip install "fastapi[all]" httpx

import httpx
from fastapi import FastAPI, Request, Response

# LambdaコンテナのRIE（実行環境）が待機しているURL
# ポート番号はご自身の環境に合わせて変更してください
LAMBDA_URL = "http://stripe-webhook-lambda-lambda-service:8080/2015-03-31/functions/function/invocations"

# FastAPIアプリケーションを初期化
app = FastAPI()

@app.post("/relay")
async def relay_webhook(request: Request):
    """
    Stripeからのリクエストを受け取り、Lambdaが期待する形式に変換して転送する
    """
    # 1. Stripeからのリクエストヘッダーと生のボディを取得
    # FastAPIではヘッダーキーは自動で小文字になります
    stripe_signature = request.headers.get('stripe-signature')
    raw_body_bytes = await request.body()
    raw_body_str = raw_body_bytes.decode('utf-8')

    print("--- Received by FastAPI Relay Server ---")
    print(f"Stripe-Signature: {stripe_signature}")
    print(f"Body: {raw_body_str[:100]}...") # ボディの先頭を表示
    print("--------------------------------------")

    # 2. Lambdaに渡すためのイベントペイロードを作成
    lambda_event_payload = {
        "body": raw_body_str,
        "headers": {
            "stripe-signature": stripe_signature,
            "content-type": request.headers.get('content-type')
        },
        "httpMethod": "POST",
        "isBase64Encoded": False,
        "path": "/webhook"
    }

    # 3. 整形したペイロードをLambdaコンテナに非同期でPOST
    async with httpx.AsyncClient() as client:
        try:
            print(f"Forwarding transformed event to Lambda at {LAMBDA_URL}...")
            lambda_response = await client.post(
                LAMBDA_URL,
                json=lambda_event_payload,
                timeout=30.0  # タイムアウトを30秒に設定
            )
            print(f"Lambda response status: {lambda_response.status_code}")
            
            # 4. Lambdaからのレスポンスをそのままクライアント(stripe listen)に返す
            return Response(
                content=lambda_response.content,
                status_code=lambda_response.status_code,
                media_type=lambda_response.headers.get('content-type')
            )
        except httpx.RequestError as e:
            error_message = f"Error forwarding to Lambda: {e}"
            print(error_message)
            return Response(content=error_message, status_code=502)