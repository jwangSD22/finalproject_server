const User = require("../models/user");
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const s3 = require("./s3instance");



exports.login = async function (req, res, next) {
  try {
    const { emailOrUsername, password } = req.body;

    function isEmail(str) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(str);
    }


    const thisUser = isEmail(emailOrUsername)?await User.findOne({ email: emailOrUsername }):await User.findOne({ username: emailOrUsername })
    bcrypt.compare(password, thisUser.password, (err, result) => {
      if (err) {
        //handle err
        console.log(err);
      } else if (result) {
        console.log("passwords match");
        const user = {
          jwtusername: thisUser.username,
          jwtemail: thisUser.email,
          jwtid: thisUser.id,
        };
        const token = jwt.sign(user, jwtSecret, { expiresIn: "3h" });
        return res
          .status(200)
          .json({ token, success: "User Logged-in", ...user });
      } else {
        console.log("passwords do not match");
        console.log(result);
        return res.status(401).json({ error: "failed" });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.logout = function (req, res) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // TODO: Verify and revoke token on server

  res.json({ message: "Logged out" });
};

exports.loginstatus = function (req, res, next) {
  //triggers middleware to check if JWT is present
  res.json({ message: "Logged in", user: req.user });
};

exports.create_user = [
  body("fullName").trim().notEmpty(),
  body("username").trim().notEmpty(),
  body("password").trim().isLength({ min: 8 }),
  body("email").trim().isEmail(),
  body("dateOfBirth").trim().isISO8601().toDate(),
  body("aboutMe").trim().isLength({ max: 500 }),

  async (req, res, next) => {
    //handle errors from express-valdiator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json({ errors: errors.array() });
    }

    //try submission of new user
    try {
      const newUser = new User({
        fullName: req.body.fullName,
        username: req.body.username,
        password: await hashPassword(req.body.password),
        email: req.body.email,
        dateOfBirth: req.body.dateOfBirth,
      });

      await newUser.save();

      //if successful return status 200

      /* ADD LOGIC TO LOG IN USER AFTER CREATING THE ACCOUNT??? OR REDIRECT AND FORCE LOGIN */

      return res.status(200).json({ success: "User Created" });
    } catch (err) {
      //catch error from password hashing or saving new user
      if (err.code === 11000) {
        // Duplicate username error
        console.log("duplicate user name!");
        return res.status(409).json({ error: "Username already taken" });
      } else {
        // Other error
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  },
];

//accessory function to use bcrypt to hash password
async function hashPassword(password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return hashedPassword;
}

exports.create_user_profile_photo = async function (req, res, next) {
  try {
    const file = req.file;

    // Use Sharp library to resize the image to 500px width
    const resizedImageBuffer = await sharp(file.buffer)
      .resize(500, 500)
      .toBuffer();

    // Set the S3 bucket and object key
    const bucketName = process.env.BUCKET_NAME;
    const objectKey = `profile-photos/${Date.now()}-${file.originalname}`;

    // Upload the resized image to S3
    await s3
      .putObject({
        Bucket: bucketName,
        Key: objectKey,
        Body: resizedImageBuffer,
        ContentType: file.mimetype,
      })
      .promise();

    // test code to see if i can pull back the URL from the newly created object
    const params = {
      Bucket: bucketName,
      Key: objectKey,
      Expires: 3600,
    };
    const url = s3.getSignedUrl("getObject", params);
    console.log(url);

    res.status(200).json({ objectKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading profile photo" });
  }
};

exports.get_allusers = async function (req, res, next) {
  // need to generated signed URL for all profile pictures during this time

let users = await User.find()

let usersWithPhoto = await Promise.all(
  users.map(async user => {
return {...user.toObject(),profilePhotoURL:await user.imageURLs}
  })
)


return res.json(usersWithPhoto)

};



exports.get_user = async function (req, res, next) {
  try {
    let username = req.params.username;
    const bucketName = process.env.BUCKET_NAME;
    let thisUser = await User.findOne({ username: username });

    if (thisUser === null) {
      return res.status(404).json({ message: "User does not exist" });
    }
    if (thisUser.profilePhoto) {
      const params = {
        Bucket: bucketName,
        Key: thisUser.profilePhoto.s3key,
        Expires: 3600,
      };
      const url = s3.getSignedUrl("getObject", params);
      res.json({ ...thisUser.toObject(), profilePhotoURL: url });
    } else {
      res.json({ ...thisUser.toObject() });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.update_user = async function (req, res, next) {
  //need to add verification that email body IS a email in validation

  //add security measure to just make sure that the params and the jwt token username matches?

  try {
    console.log(req.body.profilePhoto);
    //must conform with imageschema defined in userschema -- use s3key
    let username = req.user.jwtusername;

    let updateFields = {
      fullName: req.body.fullName,
      email: req.body.email,
      aboutMe: req.body.aboutMe,
    };
    //conditionally apply profilePhoto s3key to updateFields if it's present in req.body
    if (req.body.profilePhoto) {
      updateFields.profilePhoto = {
        s3key: req.body.profilePhoto,
      };
    }

    console.log(req.body);

    await User.updateOne({ username: username }, { $set: updateFields });
    res.json({ data: "Profile Updated" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server rror" });
  }
};

//update_password
