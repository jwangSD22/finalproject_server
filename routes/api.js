var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/user_controller')
const chat_controller = require('../controllers/chat_controller')
const post_controller = require('../controllers/post_controller')
const message_controller = require('../controllers/message_controller')
const friend_controller = require('../controllers/friend_controller')
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

// POST login a user
router.post('/users/login',user_controller.login)

// POST logout a user
router.post('/users/logout', user_controller.logout)

// POST create a new user
router.post('/users',user_controller.create_user)

// POST handle image submission for profile photo
router.post('/users/imageUpload',verifyToken,upload.single('profilePhoto'),user_controller.create_user_profile_photo)

// POST handle image submission for bg photo
router.post('/users/bgUpload',verifyToken,upload.single('bgPhoto'),user_controller.create_user_bg)


// POST username or email to check if already in DB for registration process
router.post('/user', user_controller.find_user)

// GET check login status
router.get('/users/loginstatus',verifyToken,user_controller.loginstatus)

// GET a list of all users in DB
router.get('/users', verifyToken, user_controller.get_allusers)

// GET info for a specific user by USER ID
router.get('/users/:username',verifyToken, user_controller.get_user )

// GET pfp URL for specific user by USER ID
router.get('/users/pfp/:id',verifyToken, user_controller.get_pfp )

// GET bg URL for specific user by USER ID
router.get('/users/bg/:id',verifyToken, user_controller.get_bg )


// GET a specific user's and their friends' posts with pagination
router.get('/users/:username/homeposts',verifyToken,user_controller.get_user_friend_posts)

// Get a specific user's posts only with pagination
router.get('/users/:username/posts',verifyToken,user_controller.get_solo_user_posts)




// PUT update a user's information
router.put('/users/:username',verifyToken, user_controller.update_user )

// DELETE delete a user's account (NOT IMPLEMENTING AT CURRENT TIME)

//<-----------------FRIEND ROUTES----------------->//

// GET all friends of a specific user
router.get('/user/friends/:username',verifyToken,friend_controller.get_user_friends)

//GET all pending of a specific user
router.get('/user/pending',verifyToken,friend_controller.get_user_pending)

// POST send an origin friend request to dest USERID from body
router.post('/user/friendrequest',verifyToken,friend_controller.post_friend_request)

// POST send an origin friend request to dest USERID from body
router.post('/user/removefriendrequest',verifyToken,friend_controller.remove_friend_request)

router.post('/user/removefriend',verifyToken,friend_controller.remove_friend)


// POST handle pending request action
router.post('/user/handlerequest',verifyToken,friend_controller.handle_pending_action )

// POST custom api route for seeding friends

router.post('/user/seedfriend',verifyToken,friend_controller.seed_friend)


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

// PUT update a post by toggling a **LIKE** status
router.put('/posts/:id/togglelike',verifyToken,post_controller.post_toggle_like)


// DELETE delete a post by POST ID
router.delete('/posts/:id',verifyToken)

//<-----------------CHAT ROUTES----------------->//

// POST other username to get chat between two users & create if doesn't exist
router.post('/chats/',verifyToken,chat_controller.get_chat)

// GET chats for a specific user
router.get('/chats/user/',verifyToken,chat_controller.get_all_chats)

//GET start a socket.io session for a specific chat by CHAT ID
  // router.get('/chats/:id',verifyToken)
  // removed -- this can be started from the frontend

// GET ALL MESSAGES for a specific chat by CHAT ID as PARAM
router.get('/chats/:id/messages',verifyToken,chat_controller.get_convo)

// POST create a new MESSAGE for a specific chat by CHAT ID
router.post('/chats/:id/newmessage',verifyToken)

// POST logout of a chat
router.post('/chats/:id',verifyToken)

// DELETE delete a chat session from a user's list by USER ID
router.delete('/chats/user/:id',verifyToken)


//<-----------------MESSAGE/COMMENT ROUTES----------------->//

// POST create a new COMMENT for a specific post by POST ID
router.post('/posts/:id/newcomment',verifyToken,message_controller.post_comment)

// GET ALL COMMENTS for a specific post by POST ID
router.get('/posts/:id/comments',verifyToken,message_controller.get_all_comments)

router.get('/comments/:id',verifyToken,message_controller.get_comment)

// PUT update a COMMENT by MESSAGE ID to TOGGLE **LIKES** status
router.put('/comments/:id/togglelike',verifyToken,message_controller.comment_toggle_like)

// PUT update a MESSAGE for a specific CHAT ID with a new IMAGE
router.put('/messages/:id/addimage',verifyToken)

// DELETE comment on a post by COMMENT ID and update POST
router.delete('/comments/:id/delete',verifyToken)

//DELETE message in a chat by MESSAGE ID and update CHAT
router.delete('/messages/:id/delete',verifyToken)


module.exports = router;
