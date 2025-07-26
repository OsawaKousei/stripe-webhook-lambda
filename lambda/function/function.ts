// dotenv を用いて .env を読み込む
import "dotenv/config";
import Stripe from "stripe";
import {
  LambdaEvent,
  LambdaResponse,
  ErrorResponse,
  SuccessResponse,
  CreditPurchaseRequest,
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
    console.log("Event received");

    // 環境変数を変数に保持
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const backendBaseUrl = process.env.BACKEND_BASE_URL;
    const backendApiKey = process.env.BACKEND_API_KEY;

    // 環境変数の存在チェック
    const requiredEnvVars = {
      STRIPE_SECRET_KEY: stripeSecretKey,
      STRIPE_WEBHOOK_SECRET: stripeWebhookSecret,
      BACKEND_BASE_URL: backendBaseUrl,
      BACKEND_API_KEY: backendApiKey,
    };

    for (const [key, value] of Object.entries(requiredEnvVars)) {
      if (!value) {
        console.error(`Missing required environment variable: ${key}`);
        return createErrorResponse(500, "Server configuration error");
      }
    }

    console.log("All required environment variables are set");

    // Stripeインスタンスをリクエスト毎に作成
    const stripe = new Stripe(stripeSecretKey!, {
      apiVersion: "2025-06-30.basil",
    });

    console.log("Stripe instance created successfully");

    const body = await event.body;
    const signature = event.headers["stripe-signature"];

    console.log("Successfully retrieved body and signature from event");

    let stripeEvent: Stripe.Event;
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature!,
        stripeWebhookSecret!
      );
    } catch (err) {
      console.error("Error constructing Stripe event:", err);
      return createErrorResponse(400, "Invalid Stripe signature");
    }

    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    if (stripeEvent.type === "checkout.session.completed") {
      console.log("Checkout session completed:", session);
      const customerId = session.customer as string;
      const stripeSessionId = session.id;
      console.log("Customer ID:", customerId);
      console.log("Stripe Session ID:", stripeSessionId);

      // セッション詳細を取得して購入された商品IDを特定
      try {
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
          stripeSessionId,
          {
            expand: ["line_items", "line_items.data.price.product"],
          }
        );

        const purchasedProductIds: string[] = [];

        if (sessionWithLineItems.line_items?.data) {
          for (const lineItem of sessionWithLineItems.line_items.data) {
            if (lineItem.price && typeof lineItem.price.product === "object") {
              const product = lineItem.price.product as Stripe.Product;
              purchasedProductIds.push(product.id);
              console.log(
                `Purchased product ID: ${product.id}, name: ${product.name}`
              );
            }
          }
        }

        console.log("All purchased product IDs:", purchasedProductIds);

        // バックエンドAPIにリクエストを送信（各商品に対して個別にリクエスト）
        try {
          for (const productId of purchasedProductIds) {
            const requestBody: CreditPurchaseRequest = {
              product_id: productId,
              customer_id: customerId,
            };

            const apiResponse = await fetch(`${backendBaseUrl}/subscription/purchase-notification`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Webhook-Secret': backendApiKey!,
              },
              body: JSON.stringify(requestBody),
            });

            if (!apiResponse.ok) {
              const errorText = await apiResponse.text();
              console.error(`Backend API error for product ${productId}: ${apiResponse.status} - ${errorText}`);
              return createErrorResponse(500, `Failed to notify backend of purchase completion for product ${productId}`);
            }

            const responseData = await apiResponse.json();
            console.log(`Successfully notified backend for product ${productId}:`, responseData);
          }
        } catch (backendApiError) {
          console.error("Error calling backend API:", backendApiError);
          return createErrorResponse(500, "Failed to communicate with backend");
        }
      } catch (productRetrievalError) {
        console.error("Error retrieving purchased products:", productRetrievalError);
        return createErrorResponse(500, "Failed to retrieve purchased products");
      }
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
