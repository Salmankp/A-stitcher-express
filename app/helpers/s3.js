const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

module.exports.uploadToS3 = (filePath, fileName) =>
  new Promise((resolve, reject) => {
    try {
      // Read content from the file
      const fileContent = fs.readFileSync(filePath);
      const fileExtension = fileName.split('.').pop().toLowerCase();

      let ct = '';
      switch (fileExtension) {
        case 'pdf':
          ct = 'application/pdf';
          break;
        case 'png':
          ct = 'image/png';
          break;
        case 'jpg':
          ct = 'image/jpeg';
          break;
        case 'jpeg':
          ct = 'image/jpeg';
          break;
        case 'docx':
          ct = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'doc':
          ct = 'application/msword';
          break;
        case 'xlsx':
          ct = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'xls':
          ct = 'application/vnd.ms-excel';
          break;
        case 'pptx':
          ct = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
          break;
        case 'ppt':
          ct = 'application/vnd.ms-powerpoint';
          break;
      }
      // Setting up S3 upload parameters
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: fileName,
        Body: fileContent,
        ACL: 'public-read',
        ContentType: ct,
        // You need to remove check from s3 for Blocking ACLs
      };

      // Uploading files to the bucket
      s3.upload(params, function (err, data) {
        if (err) {
          console.log(`uploadToS3 ${err}`);
          reject(err);
        }
        console.log(`File uploaded successfully. ${data.Location}`);
        return resolve(data.Location);
      });
    } catch (error) {
      console.log(`uploadToS3 Error: ${error}`);
      reject(error);
    }
  });
