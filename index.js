const AWS = require("aws-sdk");
const sharp = require("sharp");

const s3 = new AWS.S3();

exports.handler = async (event, context, callback) => {
  const Bucket = event.Records[0].s3.bucket.name;
  const Key = event.Records[0].s3.object.key;
  const filename = Key.split("/")[Key.split("/").length - 1];
  const ext = Key.split(".")[Key.split(".").length - 1];
  const requiredFormat = ext === "jpg" ? "jpeg" : ext;

  try {
    const s3Object = await s3.getObject({ Bucket, Key }).promise();
    const resizedImage = await sharp(s3Object.Body)
      .resize(1024, 1024, { fit: "inside" })
      .toFormat(requiredFormat)
      .toBuffer();
    await s3
      .putObject({
        Bucket,
        Key: `resizing-board/${filename}`,
        Body: resizedImage,
      })
      .promise();
    return callback(null, `resizing-board/${filename}`);
  } catch (error) {
    return callback(error);
  }
};
