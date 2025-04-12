# S3 Lambda SNS Notification System

This project implements an event-driven architecture using AWS serverless services where uploading a file to an S3 bucket triggers a Lambda function that sends an email notification via SNS.

## Architecture

- **Amazon S3**: Storage bucket that triggers events when files are uploaded
- **AWS Lambda**: Node.js 22 function that processes S3 events
- **Amazon SNS**: Notification service that sends emails to subscribers
- **AWS SAM**: Infrastructure as Code for defining and deploying resources
- **GitHub Actions**: CI/CD pipeline for automated deployment

## Prerequisites

- AWS Account
- AWS CLI configured with IAM credentials
- Node.js 22
- AWS SAM CLI
- GitHub repository with the proper secrets configured

## Setup Instructions

### Local Development

1. Clone this repository
2. Build the application:
   ```
   sam build
   ```
3. Deploy to your AWS account:
   ```
   sam deploy --guided
   ```

### CI/CD Pipeline Setup

1. Add the following secrets to your GitHub repository:
   - `AWS_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
   - `DEV_EMAIL_SUBSCRIPTION`: Email address for dev environment notifications
   - `PROD_EMAIL_SUBSCRIPTION`: Email address for production environment notifications

2. Push your code to the repository:
   - Push to `dev` branch for development environment deployment
   - Push to `main` branch for production environment deployment

## Testing

1. After deployment, check your email to confirm the SNS subscription
2. Upload a file to the S3 bucket (the bucket name is in the CloudFormation outputs)
3. You should receive an email notification with details about the uploaded file

## Structure

```
s3-lambda-sns-notification/
├── .github/workflows/      # GitHub Actions CI/CD pipeline
├── src/handlers/           # Lambda function code
├── template.yaml           # SAM template defining AWS resources
├── samconfig.toml          # SAM configuration for deployments
└── README.md               # Project documentation
```

## Notes

- The S3 bucket name is automatically generated with the pattern `file-upload-notification-{env}-{account-id}`
- The SNS topic name follows the pattern `file-upload-notification-{env}`
- The Lambda function has permissions to publish to SNS, and S3 has permission to invoke the Lambda function