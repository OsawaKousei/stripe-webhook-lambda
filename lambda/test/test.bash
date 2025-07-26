#!/bin/bash

# リクエストを送信する中継サーバーのURL
URL="http://localhost:8010/relay"

# 送信するJSONデータ (Stripeイベントを模したもの)
PAYLOAD='{
  "id": "evt_test_webhook",
  "object": "event",
  "type": "charge.succeeded",
  "data": {
    "object": {
      "id": "ch_test_charge",
      "amount": 2000,
      "currency": "jpy"
    }
  }
}'

# curlコマンドでPOSTリクエストを送信
echo "🚀 Sending test request to Relay Server at $URL..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Stripe-Signature: t=123456789,v1=dummysignaturefromtestscript" \
  -d "$PAYLOAD" \
  -i "$URL"

echo -e "\n\n✅ Request sent."