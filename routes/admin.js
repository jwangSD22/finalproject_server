var express = require('express');
var router = express.Router();
var chat = require('../models/chat')
var message = require('../models/message')
var post = require('../models/post')
var user = require ('../models/user')

/* GET users listing. */
router.get('/', (req, res) => {
    res.render('admin', { loggedIn: req.session.loggedIn, username: req.session.username });
});



router.post('/', (req, res) => {
  const { username, password } = req.body;

  // Check the credentials
  if (username === 'admin' && password === 'test1234') {
    // Set a cookie or session variable to indicate that the user is logged in
    req.session.loggedIn = true;
    req.session.username = username;

    // Redirect to the admin page
    res.redirect('/admin');

  } else {
    // Display an error message on the login page
    res.render('admin', { message: 'Invalid username or password' });
  }
});

router.get('/updateIndex',async (req,res,next)=>{

  const models = [chat,message,post,user];
  for(const model of models){
    await model.createIndexes();
  }

  console.log('created indexes')

  res.send('Created Indexes in MongoDB')


})



module.exports = router;
