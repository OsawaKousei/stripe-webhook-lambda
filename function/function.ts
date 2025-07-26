// dotenv を用いて .env を読み込む
import "dotenv/config";
import Stripe from "stripe";
import {
  LambdaEvent,
  LambdaResponse,
  CreditAddRequest,
  CreditAddResponse,
  ErrorResponse,
  SuccessResponse,
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

    const signature = event.headers["stripe-signature"];
    const body = event.body;

    if (!signature) {
      console.error("Stripe signature header missing");
      return createErrorResponse(400, "Missing stripe-signature header");
    }

    if (!body) {
      console.error("Request body is empty");
      return createErrorResponse(400, "Request body is required");
    }

    console.log("Successfully received Stripe signature and body");

    // Stripe Webhook署名検証
    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log(
        `Webhook event received: ${stripeEvent.type}, ID: ${stripeEvent.id}`
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", {
        error: err instanceof Error ? err.message : "Unknown error",
        signature: signature.substring(0, 20) + "...",
      });
      return createErrorResponse(
        400,
        "Invalid signature",
        err instanceof Error ? err.message : "Signature verification failed"
      );
    }

    // クレジット購入完了イベントの処理
    if (stripeEvent.type === "checkout.session.completed") {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;

      // セッションデータの検証
      if (!session.id) {
        console.error("Session ID is missing from Stripe event");
        return createErrorResponse(400, "Invalid session data");
      }

      // セッションから必要な情報を取得
      const customerId = session.customer as string;
      const customerEmail = session.customer_details?.email || null;
      const amountTotal = session.amount_total || 0;

      console.log("Credit purchase completed:", {
        sessionId: session.id,
        customerId,
        customerEmail,
        amountTotal,
      });

      // 必要なデータの検証
      if (!customerId && !customerEmail) {
        console.error("Neither customer ID nor customer email available");
        return createErrorResponse(400, "Customer information is required");
      }

      if (amountTotal <= 0) {
        console.error(`Invalid amount: ${amountTotal}`);
        return createErrorResponse(400, "Invalid payment amount");
      }

      // バックエンドサーバーのクレジット追加エンドポイントにリクエスト送信
      try {
        const requestData: CreditAddRequest = {
          customerId,
          customerEmail,
          amount: amountTotal,
          stripeSessionId: session.id,
        };

        console.log("Sending credit add request to backend:", {
          customerId,
          customerEmail,
          amount: amountTotal,
          sessionId: session.id,
        });

        const response = await fetch(
          `${process.env.BACKEND_BASE_URL}/subscription/credits/add`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          const errorMessage = `Backend API error: ${response.status} ${response.statusText}`;
          console.error(errorMessage, { responseBody: errorText });

          throw new Error(`${errorMessage} - ${errorText}`);
        }

        const result: CreditAddResponse = await response.json();
        console.log("Credit added successfully:", {
          customerId,
          result,
        });

        return createSuccessResponse(
          `Credit added successfully for customer ${customerId}`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        console.error("Failed to add credits:", {
          error: errorMessage,
          customerId,
          sessionId: session.id,
        });

        return createErrorResponse(
          500,
          "Failed to process credit addition",
          errorMessage
        );
      }
    }

    console.log(`Webhook event ${stripeEvent.type} received but not processed`);
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
