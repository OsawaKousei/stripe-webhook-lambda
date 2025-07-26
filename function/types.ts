// AWS Lambda Event型定義
export interface LambdaEvent {
  headers: {
    [key: string]: string | undefined;
    "stripe-signature"?: string;
  };
  body: string;
}

// Stripe Webhook Event型定義
export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: {
      id: string;
      customer?: string;
      customer_email?: string | null;
      [key: string]: any;
    };
  };
}

// AWS Lambda Response型定義
export interface LambdaResponse {
  statusCode: number;
  body: string;
  headers?: {
    [key: string]: string;
  };
}

// バックエンドAPIリクエスト型定義
export interface CreditAddRequest {
  customerId: string;
  customerEmail: string | null;
  amount: number;
  stripeSessionId: string;
}

// バックエンドAPIレスポンス型定義
export interface CreditAddResponse {
  success: boolean;
  message: string;
  creditBalance?: number;
  transactionId?: string;
}

// エラーレスポンス型定義
export interface ErrorResponse {
  error: string;
  details?: string;
}

// 成功レスポンス型定義
export interface SuccessResponse {
  received: boolean;
  message?: string;
}
