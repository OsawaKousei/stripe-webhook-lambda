[日本語](./README.md)

# AWS Lambda Template

This repository is a sample project for an AWS Lambda application. It is developed in TypeScript and includes configurations for setting up a local development environment using Docker and deploying to AWS Lambda. The project name in `package.json` and the service/container names in Docker Compose are automatically initialized to the repository name upon creation by a GitHub Action.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Local Development Environment](#local-development-environment)
- [Build](#build)
- [Deployment](#deployment)

## Prerequisites

Ensure you have the following tools installed:

- Docker and Docker Compose
- AWS Account (required for deployment)

## Project Structure

```
aws-lambda-study/
├── function/               # Source code for the Lambda function
│   └── function.ts         # Sample Hello World function
├── build/                  # Output directory for deployment files
├── Dockerfile              # Docker image definition
├── docker-compose.yaml     # Configuration for the local development environment
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
├── .env.template           # Environment variable template
└── .env                    # Environment variables (create this yourself)
```

## Setup Instructions

1. Clone the repository

```bash
git clone <repository-url>
cd aws-lambda-template
```

2. Set up environment variables

Create a `.env` file in the project's root directory and set the necessary environment variables:

## Local Development Environment

Use Docker Compose to start the local development environment:

```bash
docker compose up --build
```

To test the Lambda function locally, run the test script:

```bash
bash ./test/test.bash
```

## Build

### Compiling TypeScript

To compile the TypeScript code:

```bash
npm run build
```

This will compile the TypeScript files in the `functions` directory and generate JavaScript files in the `app` directory.

### Creating a Deployment Package

If you haven't created the `build` directory, please create it: `mkdir build`

```bash
docker compose up -d
docker cp lambda-service:/tmp/lambda.zip ./build/lambda.zip
docker cp lambda-service:/tmp/index.js ./build/index.js
```

This script performs the following actions:

1. Compiles the TypeScript code
2. Copies the ZIP deployment package to the `build/` directory
3. (Optional) Copies the transpiled .js file to the `build/` directory

## Deployment

### Deploying using the AWS Management Console

1. Log in to the [AWS Management Console](https://console.aws.amazon.com/)
2. Navigate to the Lambda service
3. Click "Create function" and fill in the required information
4. Select "Upload a .zip file" and upload `build/lambda.zip`
5. Set environment variables (if necessary)
