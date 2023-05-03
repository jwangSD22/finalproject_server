var express = require('express');
var router = express.Router();
const user_controller = require('../controllers/user_controller')
const chat_controller = require('../controllers/chat_controller')
const post_controller = require('../controllers/post_controller')
const message_controller = require('../controllers/message_controller')
const multer = require('multer')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// CREATE READ UPDATE DELETE //

//<-----------------USER ROUTES----------------->//

//POST login a user
router.post('/users/login',user_controller.login)

//POST create a new user
router.post('/users',user_controller.create_user)

//POST handle image submission for profile photo
router.post('/users/imageUpload',upload.single('profilePhoto'),user_controller.create_user_profile_photo)

//GET a list of all users in DB
router.get('/users')

//GET info for a specific user by USER ID
router.get('/users/:id')

//PUT update a user's information
router.put('/users/:id')

//DELETE delete a user's account (NOT IMPLEMENTING AT CURRENT TIME)

//<-----------------POST ROUTES----------------->//

// POST create a new post 
router.post('/posts',)

//POST handle image submission to a specific post by POST ID
router.post('/posts/:id/image')

// GET all public posts to display on main page
router.get('/posts',);

// GET specific post information by POST ID
router.get('/posts/:id')

// GET all posts from a specific USER ID
router.get('/posts/user/:id')

// PUT update a post by POST ID
router.put('/posts/:id') 

//PUT update a post and its comment number by POST ID
router.put('/posts/:id/comment_number')

//PUT update a post by adding a **LIKE**
router.put('/posts/:id/like')

// DELETE delete a post by POST ID
router.delete('/posts/:id')

//<-----------------CHAT ROUTES----------------->//

//POST create a new chat between two users
router.post('/chats')

//GET chats for a specific user by USER ID
router.get('/chats/user/:id')

//GET start a socket.io session for a specific chat by CHAT ID
router.get('/chats/:id')

//PUT update a specific chat's preview message by getting the first message by CHAT ID
router.put('/chats/:id/preview')

//DELETE delete a chat session from a user's list by USER ID
router.delete('/chats/user/:id')


//<-----------------MESSAGE/COMMENT ROUTES----------------->//

//POST create a new COMMENT for a specific post by POST ID
router.post('/posts/:id/newcomment')

//POST create a new MESSAGE for a specific chat by CHAT ID
router.post('/chats/:id/newmessage')

//GET ALL COMMENTS for a specific post by POST ID
router.get('/posts/:id/comments')

//GET ALL MESSAGES for a specific chat by CHAT ID
router.get('/chats/:id/messages')

//PUT update a COMMENT by MESSAGE ID to add **LIKES**
router.put('/comments/:id/addlike')

//PUT update a MESSAGE for a specific CHAT ID with a new IMAGE
router.put('/messages/:id/addimage')

//DELETE comment on a post by COMMENT ID and update POST
router.delete('/comments/:id/delete')

//DELETE message in a chat by MESSAGE ID and update CHAT
router.delete('/messages/:id/delete')


module.exports = router;
