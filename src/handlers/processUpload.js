// src/handlers/processUpload.js
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Initialize SNS client
    const snsClient = new SNSClient({ region: process.env.AWS_REGION });
    
    // Extract information about the uploaded file
    const s3Event = event.Records[0];
    const bucket = s3Event.s3.bucket.name;
    const key = decodeURIComponent(s3Event.s3.object.key.replace(/\+/g, ' '));
    const size = s3Event.s3.object.size;
    
    // Create message for notification
    const message = `
      New file uploaded to S3:
      
      Bucket: ${bucket}
      File: ${key}
      Size: ${size} bytes
      
      Timestamp: ${new Date().toISOString()}
    `;
    
    const subject = `S3 Upload Notification: ${key}`;
    
    // Prepare to publish to SNS
    const publishParams = {
      TopicArn: process.env.SNS_TOPIC_ARN,
      Subject: subject,
      Message: message
    };
    
    // Send notification
    const command = new PublishCommand(publishParams);
    const response = await snsClient.send(command);
    
    console.log('SNS notification sent successfully:', response.MessageId);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notification sent successfully',
        messageId: response.MessageId
      })
    };
  } catch (error) {
    console.error('Error processing S3 event:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing S3 event',
        error: error.message
      })
    };
  }
};