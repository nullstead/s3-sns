const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const snsClient = new SNSClient();

exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Get environment variables
    const topicArn = process.env.TOPIC_ARN;
    const environment = process.env.ENVIRONMENT;

    // Process each record in the S3 event
    const records = event.Records || [];
    for (const record of records) {
      // Extract S3 information
      const bucket = record.s3.bucket.name;
      const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
      const size = record.s3.object.size;
      const eventTime = record.eventTime;

      // Create the message
      const message = {
        environment,
        eventType: record.eventName,
        bucket,
        objectKey: key,
        objectSize: `${size} bytes`,
        eventTime,
        objectUrl: `https://s3.console.aws.amazon.com/s3/object/${bucket}?prefix=${key}`
      };

      // Create the subject line
      const subject = `[${environment.toUpperCase()}] New file uploaded to ${bucket}`;

      // Publish to SNS
      const params = {
        TopicArn: topicArn,
        Subject: subject,
        Message: JSON.stringify(message, null, 2)
      };

      console.log('Publishing to SNS with params:', JSON.stringify(params, null, 2));
      const publishCommand = new PublishCommand(params);
      await snsClient.send(publishCommand);
      console.log('Successfully published notification to SNS');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Notifications sent successfully',
        recordsProcessed: records.length
      })
    };
  } catch (error) {
    console.error('Error processing event:', error);
    throw error;
  }
};