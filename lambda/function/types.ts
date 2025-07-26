// AWS Lambda Event型定義
export interface LambdaEvent {
  headers: {
    [key: string]: string | undefined;
    "stripe-signature"?: string;
  };
  body: string;
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
export interface CreditPurchaseRequest {
  product_id: string;
  customer_id: string;
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
