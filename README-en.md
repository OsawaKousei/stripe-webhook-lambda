[日本語](./README.md)

# Stripe Webhook Lambda

This project provides an AWS Lambda function to handle Stripe Webhook events (specifically `checkout.session.completed`). To facilitate local testing, it includes a FastAPI relay server that forwards requests from the Stripe CLI to a Lambda container, mimicking the behavior of API Gateway.

## Architecture

1.  **Stripe CLI**: Uses the `stripe listen` command to forward events occurring on Stripe to the local machine.
2.  **FastAPI Relay Server**: Receives requests at `localhost:8010`. This server is responsible for converting HTTP requests from Stripe into the JSON event format expected by Lambda. This emulates the processing typically done by AWS API Gateway.
3.  **Lambda Function**: The Lambda container running at `localhost:9010` receives the converted event from the relay server. This function verifies the Stripe signature, processes the event, and finally sends a notification to the backend system (this part is not yet implemented).

This setup allows for complete testing of the Lambda function in a local environment without actually deploying an API Gateway.

## Prerequisites

*   Docker
*   Docker Compose
*   Stripe CLI
*   Node.js (for Lambda function development)
*   Python (for relay server development)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:OsawaKousei/stripe-webhook-lambda.git
    cd stripe-webhook-lambda
    ```

2.  **Set up environment variables:**
    Copy `lambda/.env.template` to create `lambda/.env` and set the required values.
    ```bash
    cp lambda/.env.template lambda/.env
    ```
    Edit the `lambda/.env` file.
    ```
    STRIPE_SECRET_KEY=sk_test_...
    STRIPE_WEBHOOK_SECRET=whsec_...
    BACKEND_BASE_URL=http://your-backend-api.com
    BACKEND_API_KEY=your-backend-api-key
    ```
    For `STRIPE_WEBHOOK_SECRET`, use the value displayed when you run the `stripe listen` command described below.

## How to Run

1.  **Start the Docker containers:**
    In the project root directory, run the following command to start the Lambda function and the relay server.
    ```bash
    docker-compose up --build
    ```

2.  **Forward Stripe events:**
    Open another terminal and use the Stripe CLI to forward events to the relay server.
    ```bash
    stripe listen --forward-to http://localhost:8010/relay
    ```
    When you run this command, the Webhook signing key (`whsec_...`) will be displayed. Copy this value and set it as `STRIPE_WEBHOOK_SECRET` in your `lambda/.env` file. After changing the setting, you need to restart the containers by running `docker-compose up --build` again.

3.  **Trigger a test event:**
    Use the Stripe CLI to trigger a test checkout session completed event.
    ```bash
    stripe trigger checkout.session.completed
    ```

Now, the request will flow from Stripe → Stripe CLI → FastAPI Relay Server → Lambda Function, and the processing status will be output in the container logs.

### Creating a Deployment Package

If you haven't created a `build` directory, please create one.

```bash
mkdir build
```

Next, start the containers and copy the built artifacts.

```bash
docker compose up -d
docker cp stripe-webhook-lambda-lambda-service:/tmp/lambda.zip ./build/lambda.zip
docker cp stripe-webhook-lambda-lambda-service:/tmp/index.js ./build/index.js
```

This script performs the following actions:

1.  Compiles the TypeScript code inside a Docker container.
2.  Copies the deployment ZIP package (`lambda.zip`) from the container to the host's `build/` directory.
3.  (Optional) Copies the transpiled JavaScript file (`index.js`) to the `build/` directory as well. This is useful for inspecting the contents before deployment.
