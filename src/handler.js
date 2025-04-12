import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});

export const main = async (event) => {
  console.log("S3 Event Received:", JSON.stringify(event, null, 2));

  const snsTopicArn = process.env.SNS_TOPIC_ARN;
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  const message = `A new file has been uploaded to bucket: ${bucket}\nFile: ${key}`;

  const command = new PublishCommand({
    TopicArn: snsTopicArn,
    Message: message,
    Subject: "New S3 Upload Notification"
  });

  try {
    await snsClient.send(command);
    console.log("Notification sent.");
  } catch (err) {
    console.error("Failed to send SNS notification", err);
    throw err;
  }
};
