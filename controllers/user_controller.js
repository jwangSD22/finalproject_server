const User = require('../models/user')
const { body, validationResult } = require('express-validator');
const AWS = require('aws-sdk');
const sharp = require('sharp')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const jwtSecret = process.env.JWT_SECRET





const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


exports.login = async function (req,res,next){

  try{
    const {email,password} = req.body

    const thisUser = await User.findOne({email:email})
    
    bcrypt.compare(password,thisUser.password,(err,result)=>{
      if(err){
          //handle err
          console.log(err)
      }
      else if(result){
        console.log('passwords match')
        const user = {username:thisUser.username, email: thisUser.email, id:thisUser.id}
        const token = jwt.sign(user,jwtSecret,{expiresIn: '3h'})
        return res.status(200).json({ token , success: 'User Logged-in', ...user})
      }
      else{
        console.log('passwords do not match')
        console.log(result)
        return res.status(401).json({error:'failed'})
      }
    })
   
  }

  catch(err){
    console.log(err)
  }

}


exports.create_user = [
    body('fullName').trim().notEmpty(),
    body('username').trim().notEmpty(),
    body('password').trim().isLength({ min: 8 }),
    body('email').trim().isEmail(),
    body('dateOfBirth').trim().isISO8601().toDate(),
    body('aboutMe').trim().isLength({ max: 500 }),
  
    async (req, res, next) => {
      //handle errors from express-valdiator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({ errors: errors.array() });
      }
      
      //try submission of new user 
      try {    
          const newUser = new User ({
            fullName:req.body.fullName,
            username:req.body.username,
            password:await hashPassword(req.body.password),
            email:req.body.email,
            dateOfBirth:req.body.dateOfBirth
          })
  
            await newUser.save()
            
            //if successful return status 200
            const user = {userid:req.body.username, email: req.body.email}
            const token = jwt.sign(user,jwtSecret,{expiresIn: '3h'})

            return res.status(200).json({ token, success: 'User Created'})

    } 
    
    //catch error from password hashing or saving new user
    catch (err) {
      if (err.code === 11000) {
        // Duplicate username error
        console.log('duplicate user name!')
        return res.status(409).json({ error: 'Username already taken' });
      } else {
        // Other error
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
    }
    }
  ];

  //accessory function to use bcrypt to hash password
async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password,10)
  return hashedPassword
}
  

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

          // test code to see if i can pull back the URL from the newly created object
          const params = {
            Bucket: bucketName,
            Key: objectKey,
            Expires:3600
          }
          const url = s3.getSignedUrl('getObject',params)
          console.log(url)


          res.status(200).json({ objectKey });

        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Error uploading profile photo' });
        }
      }



exports.get_allusers = function (req,res,next) { 
  User.find()
  .exec()
  .then(
      result => {
          res.json(result)
      }
  )
  }


exports.get_user = function(req,res,next){
  User.findOne({username:req.body.username})
  .exec()
  .then(
    result => {
      res.json(result)
    }
  )

}
  

exports.update_user 

