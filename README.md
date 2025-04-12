# S3 Event-Driven Notification Service

This project implements a serverless event-driven architecture using AWS services that automatically sends email notifications when files are uploaded to an S3 bucket.

## Architecture

The solution uses the following AWS services:
- Amazon S3 for file storage
- AWS Lambda for event processing
- Amazon SNS for notifications
- AWS SAM for infrastructure as code
- GitHub Actions for CI/CD

## How It Works

1. A user uploads a file to the designated S3 bucket
2. The S3 bucket triggers a Lambda function
3. The Lambda function processes the event and publishes a message to an SNS topic
4. SNS sends an email notification to subscribed email addresses

## Development Setup

### Prerequisites

- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- [Node.js 22](https://nodejs.org/)
- AWS CLI configured with appropriate credentials
- GitHub account for CI/CD

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   cd src
   npm install
   ```
3. Build the SAM application:
   ```bash
   sam build
   ```
4. Deploy to your development environment:
   ```bash
   sam deploy --config-env dev
   ```

## Deployment

The project uses GitHub Actions for CI/CD:

- Pushing to the `develop` branch deploys to the development environment
- Pushing to the `main` branch deploys to the production environment

### Required GitHub Secrets

- `AWS_ROLE_ARN`: ARN of the IAM role used for deployment
- `AWS_REGION`: AWS region for deployment
- `ADMIN_EMAIL_DEV`: Email address for notifications in development
- `ADMIN_EMAIL_PROD`: Email address for notifications in production

## Testing

To test the solution:
1. Navigate to the S3 console
2. Upload a file to the created S3 bucket
3. Check your email for the notification

## Environment Configuration

The SAM template supports two environments:
- `dev`: Development environment
- `prod`: Production environment

Environment-specific configuration is managed through parameter overrides in the SAM template and GitHub Actions workflow.