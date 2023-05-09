var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/user_controller')
const chat_controller = require('../controllers/chat_controller')
const post_controller = require('../controllers/post_controller')
const message_controller = require('../controllers/message_controller')
const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// CREATE READ UPDATE DELETE //

//<-----------------USER ROUTES----------------->//

//POST login a user
router.post('/users/login',user_controller.login)

//POST logout a user
router.post('/users/logout', user_controller.logout)

//POST create a new user
router.post('/users',user_controller.create_user)

//POST handle image submission for profile photo
router.post('/users/imageUpload',verifyToken,upload.single('profilePhoto'),user_controller.create_user_profile_photo)

//GET check login status
router.get('/users/loginstatus',verifyToken,user_controller.loginstatus)

//GET a list of all users in DB
router.get('/users', verifyToken, user_controller.get_allusers)

//GET info for a specific user by USER ID
router.get('/users/:username',verifyToken, user_controller.get_user )

//PUT update a user's information
router.put('/users/:username',verifyToken, user_controller.update_user )

//DELETE delete a user's account (NOT IMPLEMENTING AT CURRENT TIME)

//<-----------------POST ROUTES----------------->//

// POST create a new post 
router.post('/posts',verifyToken,post_controller.create_post)

//POST handle image submission to a specific post by POST ID
router.post('/posts/imageupload',verifyToken,upload.array('files'), post_controller.handle_image_upload)

// GET all public posts to display on main page
router.get('/posts',verifyToken,post_controller.get_all_posts);

// GET specific post information by POST ID
router.get('/posts/:id',verifyToken,post_controller.get_post)

// GET all posts from a specific USERNAME
router.get('/posts/user/:username',verifyToken,post_controller.get_user_posts)

// PUT update a post by POST ID
router.put('/posts/:id',verifyToken) 

//PUT update a post by adding a **LIKE**
router.put('/posts/:id/addlike',verifyToken,post_controller.post_add_like)

//PUT update a post by removing a **LIKE**
router.put('/posts/:id/removelike',verifyToken,post_controller.post_remove_like)


// DELETE delete a post by POST ID
router.delete('/posts/:id',verifyToken)

//<-----------------CHAT ROUTES----------------->//

//POST create a new chat between two users
router.post('/chats',verifyToken)

//GET chats for a specific user by USER ID
router.get('/chats/user/:id',verifyToken)

//GET start a socket.io session for a specific chat by CHAT ID
router.get('/chats/:id',verifyToken)

//PUT update a specific chat's preview message by getting the first message by CHAT ID
router.put('/chats/:id/preview',verifyToken)

//DELETE delete a chat session from a user's list by USER ID
router.delete('/chats/user/:id',verifyToken)


//<-----------------MESSAGE/COMMENT ROUTES----------------->//

//POST create a new COMMENT for a specific post by POST ID
router.post('/posts/:id/newcomment',verifyToken,message_controller.post_comment)

//POST create a new MESSAGE for a specific chat by CHAT ID
router.post('/chats/:id/newmessage',verifyToken)

//GET ALL COMMENTS for a specific post by POST ID
router.get('/posts/:id/comments',verifyToken)

//GET ALL MESSAGES for a specific chat by CHAT ID
router.get('/chats/:id/messages',verifyToken)

//PUT update a COMMENT by MESSAGE ID to add **LIKES**
router.put('/comments/:id/addlike',verifyToken)

//PUT update a MESSAGE for a specific CHAT ID with a new IMAGE
router.put('/messages/:id/addimage',verifyToken)

//DELETE comment on a post by COMMENT ID and update POST
router.delete('/comments/:id/delete',verifyToken)

//DELETE message in a chat by MESSAGE ID and update CHAT
router.delete('/messages/:id/delete',verifyToken)


module.exports = router;
