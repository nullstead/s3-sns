# S3 Event-Driven Notification System

This project implements a serverless event-driven architecture using AWS services to send email notifications when files are uploaded to an S3 bucket.

## Architecture

The solution uses the following AWS services:

- **Amazon S3**: Storage for file uploads and event source
- **AWS Lambda**: Processes S3 events and forwards notifications
- **Amazon SNS**: Delivers email notifications to subscribers
- **AWS SAM**: Infrastructure as Code for defining and deploying resources

## How It Works

1. User uploads a file to the S3 bucket
2. S3 event trigger invokes the Lambda function
3. Lambda extracts file details and publishes a message to SNS
4. SNS sends email notifications to all subscribers

## Deployment

The project includes a GitHub Actions workflow for CI/CD that automatically builds and deploys the application to either development or production environments.

### Environment Configuration

- **Development**: Triggered by pushes to the `develop` branch
- **Production**: Triggered by pushes to the `main` branch
- **Manual Deployment**: Can be triggered manually via workflow dispatch

### Prerequisites

To deploy this application, you'll need:

1. AWS Account
2. GitHub repository with the following secrets configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`
   - `DEV_EMAIL_SUBSCRIPTION`: Email address for development notifications
   - `PROD_EMAIL_SUBSCRIPTION`: Email address for production notifications

### Local Development

To develop and test locally:

1. Install the AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html
2. Clone the repository
3. Navigate to the project directory
4. Build the application:
   ```
   sam build
   ```
5. Deploy to a specific environment:
   ```
   sam deploy --config-env dev
   ```
   or
   ```
   sam deploy --config-env prod
   ```

### Testing

To test the application after deployment:

1. Go to the S3 console and navigate to the deployed bucket
2. Upload a file to the bucket
3. Check your email for the notification

## Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow for CI/CD
├── src/
│   ├── app.js              # Lambda function code
│   └── package.json        # Node.js dependencies
├── template.yaml           # AWS SAM template
├── samconfig.toml          # SAM configuration for different environments
└── README.md               # Project documentation
```