const express = require("express");
const router = express.Router();
const postServices = require("./postServices");
const userServices = require("../users/userServices");
const commentServices = require("../comments/commentServices");
const middleWare = require("../../_middleware");
const { applyMiddleware } = require("../../_utils");

applyMiddleware(middleWare, router);

router.route("/new").post(async (req, res) => {
  const { token, user: id, post } = req.body.data;
  const loggedIn = await postServices.loginCheck(token);
  if (loggedIn) {
    const user = await userServices.getUserById(id);
    const hasPermission =
      (await user.role) === "Admin" || user.role === "Author";
    if (hasPermission) {
      post.user = id;
      const newPost = await postServices.createPost(post);
      res.status(201).json({
        data: [newPost]
      });
    } else {
      res
        .status(401)
        .statusMessage(`You are not allowed to write a new blog post!`);
    }
  } else {
    res.status(401).statusMessage(`You are not logged in.`);
  }
});

router.route("/").get(async (req, res) => {
  const page = req.query.page || 1;
  try {
    const posts = await postServices.getAllPosts({
      page
    });
    res.status(200).json({
      data: posts
    });
  } catch (e) {
    res.status(400).statusMessage(e);
  }
});

router.route("/:id").get(async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postServices.getPostsById(id);
    res.status(200).json({
      data: post
    });
  } catch (e) {
    res.status(400).statusMessage(e);
  }
});

router.route("/:id").delete(async (req, res) => {
  const { token, user } = req.body;
  const { id: postId } = req.params;
  // Check if logged in
  const loggedIn = await postServices.loginCheck(token);
  if (!loggedIn) {
    res.status(401).statusMessage("You are not logged in.");
  }
  // Grab post
  const post = await postServices.getPostsById(postId);
  const deletingUser = await userServices.getUserById(user);
  // Check to see if post is owned by user, or if user is Admin.
  if (deletingUser !== "Admin") {
    if (post.user._id !== user) {
      res
        .status(401)
        .statusMessage("You do not have permission to delete this post.");
    }
  }
  // Run through comments and delete them.
  const comments = [];
  for (let i = 0; i < post.comments.length; i++) {
    comments.push(post.comments[i]._id);
  }
  const deletedComments = await commentServices.deleteAllComments(comments);
  // Delete post.
  if (deletedComments) {
    const deletedPost = await postServices.deletePost(postId);
    res.status(201).json({
      data: deletedPost
    });
  }
});

router.route("/:id").put(async (req, res) => {
  const { token, user, title, body, headerImage, postDate, tags } = req.body;
  const { id: postId } = req.params;
  const loggedIn = await postServices.loginCheck(token);
  if (!loggedIn) {
    res.status(401).statusMessage("You are not logged in.");
  }
  const post = await postServices.getPostsById(postId);
  const editingUser = await userServices.getUserById(user);
  if (editingUser.role !== "Admin" && post.user._id.toString() !== user) {
    res.status(401).send("You do not have permission to edit this post.");
  }
  const result = await postServices.editPost(
    postId,
    title,
    body,
    headerImage,
    postDate,
    tags
  );
  const updatedPost = await postServices.getPostsById(postId);
  if (result) {
    res.status(201).json({
      data: updatedPost
    });
  }
});

router.route("/counter/:id").put(async (req, res) => {
  const { id } = req.params;
  try {
    const post = await postServices.getPostsById(id);
    post.reads += 1;
    const updatedPost = await postServices.addToCounter(id, post.reads);
    res.status(201).json({
      data: updatedPost
    });
  } catch (e) {
    res.status(401).send("Could not add to counter.");
  }
});

exports.router = router;
