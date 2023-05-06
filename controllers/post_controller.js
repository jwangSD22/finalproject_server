const User = require("../models/user");
const Post = require("../models/post")
const { body, validationResult } = require("express-validator");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const jwt = require("jsonwebtoken");
const s3 = require("./s3instance")

// POST create a new post 
exports.create_post 

//POST handle image submission to a specific post by POST ID
exports.handle_image_upload

// GET all public posts to display on main page
exports.get_all_posts

// GET specific post information by POST ID
exports.get_post

// GET all posts from a specific USER ID
exports.get_user_posts

// PUT update a post by POST ID
exports.update_post

//PUT update a post and its comment number by POST ID

//PUT update a post by adding a **LIKE**
exports.post_add_like

// DELETE delete a post by POST ID
exports.delete_post