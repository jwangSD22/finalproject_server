const User = require("../models/user");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const s3 = require("./s3instance");

// POST create a new post
exports.create_post = async function (req, res, next) {
  const { jwtusername, jwtemail, jwtid } = req.user;

  //find author
  const author = await User.findOne({ username: jwtusername });

  let postContent = {
    author: jwtusername,
    postMessage: req.body.postMessage,
  };
  //check if req.body contains an array of image URLs
  let arrayToUpload = [];
  if (req.body.imageKeyArray) {
    for (let key of req.body.imageKeyArray) {
      let img = { s3key: key };
      arrayToUpload.push(img);
    }
    postContent.images = arrayToUpload;
  }

  //create post object
  const newPost = new Post(postContent);
  newPost.save();
  //add post object to author's list of posts

  author.posts.push(newPost);
  author.save();

  res.send("ok");
};

//POST handle image submission to a specific post by POST ID
//--> this will filter the image upload and return back the S3 key to the frontend
exports.handle_image_upload = async function (req, res, next) {
  try {
    console.log(req.files);
    const files = req.files;
    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files were uploaded" });
    }
    const finalObjectKeys = [];

    // loop through each file
    for (const file of files) {
      // Use Sharp library to resize the image to 500px width
      const resizedImageBuffer = await sharp(file.buffer)
        .resize({ height: 500 })
        .toBuffer();

      // Set the S3 bucket and object key
      const bucketName = process.env.BUCKET_NAME;
      const objectKey = `profile-photos/${Date.now()}-${file.originalname}`;
      finalObjectKeys.push(objectKey);

      // Upload the resized image to S3
      await s3
        .putObject({
          Bucket: bucketName,
          Key: objectKey,
          Body: resizedImageBuffer,
          ContentType: file.mimetype,
        })
        .promise();
    }
 

    res.status(200).json({ finalObjectKeys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading profile photo" });
  }
};

// GET all public posts to display on main page
exports.get_all_posts;

// GET specific post information by POST ID
exports.get_post = async function (req,res,next) {
    let id = req.params.id

    const post = await Post.findOne({_id:id})
    const imageURLs = await post.imageURLs


    res.json(imageURLs)
}

// GET all posts from a specific USER ID
exports.get_user_posts;

// PUT update a post by POST ID
exports.update_post;

//PUT update a post and its comment number by POST ID

//PUT update a post by adding a **LIKE**
exports.post_add_like;

// DELETE delete a post by POST ID
exports.delete_post;



