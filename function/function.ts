// dotenv を用いて .env を読み込む
import "dotenv/config";
import Stripe from "stripe";
import {
  LambdaEvent,
  LambdaResponse,
  ErrorResponse,
  SuccessResponse,
  StripeWebhookEvent,
} from "./types";

// エラーレスポンスを生成するヘルパー関数
const createErrorResponse = (
  statusCode: number,
  error: string,
  details?: string
): LambdaResponse => {
  const errorResponse: ErrorResponse = { error, details };
  return {
    statusCode,
    body: JSON.stringify(errorResponse),
  };
};

// 成功レスポンスを生成するヘルパー関数
const createSuccessResponse = (message?: string): LambdaResponse => {
  const successResponse: SuccessResponse = { received: true, message };
  return {
    statusCode: 200,
    body: JSON.stringify(successResponse),
  };
};

export const handler = async (event: LambdaEvent): Promise<LambdaResponse> => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // 環境変数の存在チェック
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
      BACKEND_API_KEY: process.env.BACKEND_API_KEY,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`Missing required environment variable: ${key}`);
        return createErrorResponse(500, "Server configuration error");
      }
    }

    console.log("All required environment variables are set");

    // Stripeインスタンスをリクエスト毎に作成
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-06-30.basil",
    });

    console.log("Stripe instance created successfully");

    // Stripe署名の取得
    const stripeSignature = event.headers["stripe-signature"];
    if (!stripeSignature) {
      console.error("Missing stripe-signature header");
      return createErrorResponse(400, "Missing stripe-signature header");
    }
    console.log("Stripe signature found");

    // イベントデータのパース
    let webhookEvent: StripeWebhookEvent;
    try {
      webhookEvent = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Failed to parse webhook event body:", parseError);
      return createErrorResponse(400, "Invalid JSON payload");
    }

    // イベントタイプの確認
    console.log("Event type:", webhookEvent.type);

    // チェックアウトセッションIDの抽出
    const checkoutSessionId = webhookEvent.data.object.id;
    if (!checkoutSessionId) {
      console.error("Missing checkout session ID");
      return createErrorResponse(400, "Missing checkout session ID");
    }
    console.log("Checkout session ID:", checkoutSessionId);

    // 顧客IDの抽出
    const customerId = webhookEvent.data.object.customer;
    if (!customerId) {
      console.error("Missing customer ID");
      return createErrorResponse(400, "Missing customer ID");
    }
    console.log("Customer ID:", customerId);

    console.log("Webhook processing completed");
    return createSuccessResponse("Webhook received and processed");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Webhook processing error:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return createErrorResponse(500, "Internal server error", errorMessage);
  }
};
