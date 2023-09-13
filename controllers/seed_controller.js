const fs = require('fs')
const path = require('path')
const s3 = require("./s3instance");
const AWS = require("aws-sdk");
const axios = require('axios')
const {faker} = require('@faker-js/faker')
const sharp = require('sharp')



exports.gen_img = async function (req,res,next){

    //can accept 3 types of parameters for the download loaction in s3 
    // bg-photos, post-photos, profile-photos

    let parameter = req.params.parameter
    let size = {}

    if(parameter==='post-photos'||parameter==='profile-photos'){
        size = {width:500,height:500}
    }
    else{
        size = {width:1280}
    }
    

    let randomImgURL = faker.image.urlLoremFlickr(size)
   
    let response = await downloadImageAndUploadToS3(randomImgURL,parameter)


    res.json(response)


}

async function downloadImageAndUploadToS3(url,parameter) {
    const parentDirectory = path.join(__dirname, '..');
    const targetFolder = path.join(parentDirectory, 'temp_img');
  
    try {
      const response = await axios.get(url, {
        responseType: 'stream',
      });
  
      const fileName = path.basename(url);
      const filePath = path.join(targetFolder, fileName + '.jpg');
      const fileStream = fs.createWriteStream(filePath);
  
      response.data.pipe(fileStream);
  
      await new Promise((resolve, reject) => {
        fileStream.on('finish', () => {
          console.log(`File saved to ${filePath}`);
          resolve(filePath);
        });
        fileStream.on('error', (error) => {
          console.error('Error saving file:', error);
          reject(error);
        });
      });
  
      // Resize the image using Sharp
      const resizedImageBuffer = await sharp(filePath)
        .resize({ height: 500 })
        .toBuffer();
  
      // Set the S3 bucket and object key
      const bucketName = process.env.BUCKET_NAME;
      const objectKey = `${parameter}/${Date.now()}-${fileName}`;
  
      // Upload the resized image to S3
      await s3
        .putObject({
          Bucket: bucketName,
          Key: objectKey,
          Body: resizedImageBuffer,
          ContentType: 'image/jpeg', // Set the content type as needed
        })
        .promise();
  
      // Return the S3 object key
      return objectKey;
    } catch (error) {
      console.error('Error downloading image and uploading to S3:', error);
      throw error;
    }
  }
  