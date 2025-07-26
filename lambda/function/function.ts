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

    const body = await event.body;
    const signature = event.headers["stripe-signature"];

    console.log("Stripe signature:", signature);

    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      console.log("Stripe event constructed successfully:", stripeEvent);
    } catch (err) {
      console.error("Error constructing Stripe event:", err);
      return createErrorResponse(400, "Invalid Stripe signature");
    }

    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    if (stripeEvent.type === "checkout.session.completed") {
      console.log("Checkout session completed:", session);
      const customerId = session.customer as string;
      const customerEmail = session.customer_email || null;
      const amount = session.amount_total || 0;
      const stripeSessionId = session.id;
      console.log("Customer ID:", customerId);
      console.log("Customer Email:", customerEmail);
      console.log("Amount:", amount);
      console.log("Stripe Session ID:", stripeSessionId);
      // バックエンドAPIにリクエストを送信
    }

    console.log("Webhook processing completed");
    return createSuccessResponse("Webhook received and processed");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(
      "Webhook processing error:",
      JSON.stringify(
        {
          message: errorMessage,
          stack: errorStack,
          type: error instanceof Error ? error.constructor.name : typeof error,
        },
        null,
        2
      )
    );

    return createErrorResponse(500, "Internal server error", errorMessage);
  }
};
