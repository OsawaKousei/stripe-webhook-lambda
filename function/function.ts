// dotenv を用いて .env を読み込む
import "dotenv/config";

// export const handler を使用（lambda_handler から変更）
export const handler = async (event: any): Promise<any> => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
};
