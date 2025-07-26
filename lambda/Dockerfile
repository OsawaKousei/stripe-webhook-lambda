# Stage 1: TypeScript のコンパイル
FROM node:22-slim AS build
WORKDIR /app
# package.json, tsconfig.json, functions ディレクトリをコピー
RUN apt-get update && apt-get upgrade -y
COPY package.json .
COPY tsconfig.json .
COPY function/ .
RUN npm install && npx tsc

# Stage 2: AWS Lambda 用ランタイムイメージへコピー
FROM public.ecr.aws/lambda/nodejs:22
WORKDIR ${LAMBDA_TASK_ROOT}
# production依存関係を解決
COPY package.json .
RUN npm install --production
# コンパイル成果物と .env をコピー
# ※ tsconfig.json の outDir が "app" のため、成果物は /app/app/function.js にあります
COPY --from=build /app/app/function.js ${LAMBDA_TASK_ROOT}/index.js
COPY .env ${LAMBDA_TASK_ROOT}/.env

# ローカル参照用にファイルをコピー
RUN cp ${LAMBDA_TASK_ROOT}/index.js /tmp/index.js
# コピーは次のコマンドで行う
# docker cp lambda-service:/tmp/index.js ./build/index.js

# デプロイ用のzipファイルを作成
# AWS Lambda 向けのデプロイ用.zipファイルを node_modules も含めて /tmp に作成
RUN dnf install -y zip
RUN zip -r /tmp/lambda.zip index.js .env node_modules
# コピーは次のコマンドで行う
# docker cp lambda-service:/tmp/lambda.zip ./build/lambda.zip


CMD ["index.handler"]