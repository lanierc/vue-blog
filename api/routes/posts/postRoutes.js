const express = require("express");
const router = express.Router();
const postServices = require("./postServices");
const userServices = require("../users/userServices");

router.route("/new").post(async (req, res) => {
  const { token, user: id, post } = req.body;
  const loggedIn = await postServices.loginCheck(token);
  if (loggedIn) {
    const user = await userServices.getUserById(id);
    const hasPermission =
      (await user.role) === "Admin" || user.role === "Author";
    if (hasPermission) {
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

exports.router = router;
