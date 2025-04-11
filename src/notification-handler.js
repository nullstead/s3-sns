// src/notification-handler.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Extract event details
  const requestType = event.RequestType;
  const resourceProperties = event.ResourceProperties;
  const bucketName = resourceProperties.BucketName;
  
  let responseData = {};
  let responseStatus = 'SUCCESS';
  
  try {
    if (requestType === 'Create' || requestType === 'Update') {
      // Configure S3 bucket notification
      console.log(`Configuring notification for bucket: ${bucketName}`);
      
      // Convert resource properties to proper format
      const notificationConfig = {
        LambdaFunctionConfigurations: resourceProperties.NotificationConfiguration.LambdaFunctionConfigurations.map(config => ({
          Events: [config.Event],
          LambdaFunctionArn: config.Function
        }))
      };
      
      const params = {
        Bucket: bucketName,
        NotificationConfiguration: notificationConfig
      };
      
      console.log('Putting bucket notification configuration:', JSON.stringify(params, null, 2));
      await s3.putBucketNotificationConfiguration(params).promise();
      
      responseData = { Message: 'Bucket notification configuration updated successfully' };
    } else if (requestType === 'Delete') {
      // Clear notification configuration on delete
      console.log(`Clearing notification configuration for bucket: ${bucketName}`);
      
      const params = {
        Bucket: bucketName,
        NotificationConfiguration: {}
      };
      
      await s3.putBucketNotificationConfiguration(params).promise();
      responseData = { Message: 'Bucket notification configuration cleared successfully' };
    }
  } catch (error) {
    console.error('Error:', error);
    responseStatus = 'FAILED';
    responseData = { Error: error.message };
  }
  
  // Send response to CloudFormation
  await sendResponse(event, context, responseStatus, responseData);
};

// Helper function to send response to CloudFormation
async function sendResponse(event, context, responseStatus, responseData) {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: responseData.Error || 'See the details in CloudWatch Log Stream: ' + context.logStreamName,
    PhysicalResourceId: event.LogicalResourceId + '-' + event.RequestId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData,
  });
  
  console.log('Response body:', responseBody);
  
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'PUT',
    headers: {
      'content-type': '',
      'content-length': responseBody.length,
    },
  };
  
  return new Promise((resolve, reject) => {
    const request = https.request(options, (response) => {
      console.log(`Status code: ${response.statusCode}`);
      resolve();
    });
    
    request.on('error', (error) => {
      console.error('Send response error:', error);
      reject(error);
    });
    
    request.write(responseBody);
    request.end();
  });
}