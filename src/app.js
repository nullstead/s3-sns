const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

const snsClient = new SNSClient();
const snsTopicArn = process.env.SNS_TOPIC_ARN;
const environment = process.env.ENVIRONMENT;

exports.handler = async (event) => {
  try {
    console.log('Processing S3 event:', JSON.stringify(event, null, 2));
    
    // Extract info from S3 event
    const s3Records = event.Records || [];
    
    for (const record of s3Records) {
      // Get S3 bucket and object details
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      const size = record.s3.object.size;
      const eventTime = record.eventTime;
      
      // Create message for notification
      const message = {
        environment: environment,
        event: 'File Upload',
        details: {
          bucket: bucket,
          objectKey: key,
          objectSize: `${size} bytes`,
          uploadedAt: eventTime
        }
      };
      
      const subject = `[${environment.toUpperCase()}] New File Uploaded: ${key}`;
      
      // Prepare SNS publish parameters
      const params = {
        Message: JSON.stringify(message, null, 2),
        Subject: subject,
        TopicArn: snsTopicArn
      };
      
      // Send SNS notification
      console.log('Sending SNS notification with params:', params);
      const command = new PublishCommand(params);
      const result = await snsClient.send(command);
      console.log('SNS notification sent:', result);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notifications sent successfully',
        eventCount: s3Records.length
      })
    };
  } catch (error) {
    console.error('Error processing S3 event:', error);
    throw error;
  }
};