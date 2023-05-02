const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const sharp = require('sharp')

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Example: list all objects in a bucket
const params = {
  Bucket: process.env.BUCKET_NAME,
};

// s3.listObjects(params, function(err, data) {
//   if (err) {
//     console.log(err, err.stack);
//   } else {
//     console.log(data);
//   }
// });




exports.create_user = [
    body('fullName').trim().notEmpty(),
    body('username').trim().notEmpty(),
    body('password').trim().isLength({ min: 8 }),
    body('email').trim().isEmail(),
    body('dateOfBirth').trim().isISO8601().toDate(),
    body('aboutMe').trim().isLength({ max: 500 }),
  
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({ errors: errors.array() });
      }
      try {

        //submit into database -- check for errors 
        //hash password
        //check if there's an image -- if there is, submit image and create URL 







    } catch (err) {
        return next(err);
      }
    }
  ];
  

exports.create_user_profile_photo = async function (req,res,next){
            try {
          const file = req.file;
      
          // Use Sharp library to resize the image to 500px width
          const resizedImageBuffer = await sharp(file.buffer)
            .resize(500,500)
            .toBuffer();
      
          // Set the S3 bucket and object key
          const bucketName = process.env.BUCKET_NAME;
          const objectKey = `profile-photos/${Date.now()}-${file.originalname}`;
      
          // Upload the resized image to S3
          await s3.putObject({
            Bucket: bucketName,
            Key: objectKey,
            Body: resizedImageBuffer,
            ContentType: file.mimetype,
          }).promise();
      
          // Generate the public URL for the uploaded image
          const imageUrl = `https://${bucketName}.s3.amazonaws.com/${objectKey}`;
      
          // Return the URL in the response
          console.log(imageUrl)
          res.status(200).json({ imageUrl });
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Error uploading profile photo' });
        }
      }



exports.get_users

exports.get_user

exports.update_user 

