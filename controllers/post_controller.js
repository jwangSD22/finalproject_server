const User = require("../models/user");
const Post = require("../models/post");
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const s3 = require("./s3instance");

///////// TO DO  -- UPDATE POST AND DELETE POST

// POST create a new post
exports.create_post = async function (req, res, next) {
  const { jwtusername, jwtemail, jwtid } = req.user;

  //find author
  const author = await User.findOne({ username: jwtusername });

  let postContent = {
    author: jwtusername,
    postMessage: req.body.postMessage,
    timestamp: new Date()
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

  res.send(newPost);
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
exports.get_all_posts = async function (req,res,next) {
  const page = req.query.page || 1; // default to page 1
  const limit = 10; // number of posts to retrieve per page
  const skip = (page - 1) * limit; // number of posts to skip based on current page
  const posts = await Post.find().skip(skip).limit(limit).sort({timestamp: -1});
  const postsWithImageUrlsAndComments = await Promise.all(
    posts.map(async (post) => {
      const imageURLs = await post.imageURLs;
      const topCommentsSnippet = await post.topCommentsSnippet;
      return { ...post.toObject(), imageURLs, topCommentsSnippet };
    })
  );
  res.json(postsWithImageUrlsAndComments);
};

//FRONT END CODE
// const fetchPosts = async (page) => {
//   const response = await axios.get(`/posts?page=${page}`);
//   const posts = response.data;
//   // update the page with the retrieved posts
// };

// // Example usage
// let currentPage = 1;
// fetchPosts(currentPage);

// // Example code for "next page" button
// const nextPage = () => {
//   currentPage++;
//   fetchPosts(currentPage);
// };


// GET specific post information by POST ID
exports.get_post = async function (req,res,next) {
  try{
    let id = req.params.id
    const post = await Post.findOne({_id:id})
    //this is a mongoose virtual off post model to get signed URLs from keys within POST
    const imageURLs = await post.imageURLs
    const topCommentsSnippet = post.comments.length>0?await post.topCommentsSnippet:null
    const postImageAndComments = {...post.toObject(),imageURLs,topCommentsSnippet}
    res.json(postImageAndComments)
  }
  catch(err){
    res.status(400).json({error:err})
  }

}

// GET all posts from a specific USER ID
exports.get_user_posts = async function (req,res,next) {
  const username = req.params.username
  //would it make more sense to get all the post ids, and the run a command back to my get specific post by ID?
  const posts = await Post.find({ author: username }).sort({timestamp: -1});
  const postsWithImageUrlsAndComments = await Promise.all(
    posts.map(async (post) => {
      const imageURLs = await post.imageURLs;
      const topCommentsSnippet = await post.topCommentsSnippet
      return { ...post.toObject(), imageURLs,topCommentsSnippet };
    })
  );
  res.json(postsWithImageUrlsAndComments)

};

// PUT update a post by POST ID
exports.update_post;

//PUT update a post and its comment number by POST ID

//PUT update a post by TOGGLING **LIKE** status
// router.put('/posts/:id/like',verifyToken)
exports.post_toggle_like = async function (req, res, next) {
  const userId = req.user.jwtid;
  const id = req.params.id;
  const post = await Post.findById(id);

  try {
    const index = post.likes.indexOf(userId);
    if (index > -1) {
      // User already liked the post, remove the like
      post.likes.splice(index, 1);
      post.numberOfLikes--;
    } else {
      // User hasn't liked the post yet, add the like
      post.likes.push(userId);
      post.numberOfLikes++;
    }

    // Save the updated post and return the updated document
    const updatedPost = await post.save();

    return res.json(updatedPost);
  } catch (error) {
    res.status(400).json(error);
  }
};






// DELETE delete a post by POST ID
exports.delete_post;



