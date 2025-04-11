// src/notification-handler.js
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const requestType = event.RequestType;
  const resourceProperties = event.ResourceProperties;
  
  let responseData = {};
  let responseStatus = 'SUCCESS';
  
  try {
    if (requestType === 'Create' || requestType === 'Update') {
      // Configure S3 bucket notification
      const params = {
        Bucket: resourceProperties.BucketName,
        NotificationConfiguration: resourceProperties.NotificationConfiguration
      };
      
      console.log('Putting bucket notification configuration:', JSON.stringify(params, null, 2));
      await s3.putBucketNotificationConfiguration(params).promise();
      
      responseData = { Message: 'Bucket notification configuration updated successfully' };
    } else if (requestType === 'Delete') {
      // Clear notification configuration on delete
      const params = {
        Bucket: resourceProperties.BucketName,
        NotificationConfiguration: {}
      };
      
      console.log('Clearing bucket notification configuration for bucket:', resourceProperties.BucketName);
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
    PhysicalResourceId: context.logStreamName,
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