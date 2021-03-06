const tokenService = require("../../_utils/tokenService");
const { model: Post } = require("./postModel");

exports.loginCheck = async token => {
  if (!token) {
    return false;
  } else {
    try {
      const decoded = await tokenService.verifyToken(token);
      if (decoded) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      return false;
    }
  }
};

exports.createPost = async newPost => {
  try {
    const post = new Post(newPost);
    return await post.save();
  } catch (e) {
    throw e;
  }
};

exports.getAllPosts = async page => {
  const perPage = 5;
  try {
    const posts = await Post.find({})
      .sort({ postDate: "desc" })
      .limit(perPage)
      .skip((page - 1) * perPage)
      .populate("user", "username _id")
      .populate({
        path: "comments",
        populate: { path: "user", select: "username _id" }
      });
    if (posts) {
      return posts;
    }
  } catch (e) {
    throw e;
  }
};

exports.getPostsById = async id => {
  try {
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: { path: "user", select: "username _id" }
      })
      .populate("user", "username _id");
    if (post) {
      return post;
    }
  } catch (e) {
    throw e;
  }
};

exports.editPost = async (id, title, body, headerImage, postDate, tags) => {
  try {
    return await Post.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          body,
          headerImage,
          postDate,
          tags
        }
      }
    );
  } catch (e) {
    throw e;
  }
};

exports.deletePost = async id => {
  try {
    return await Post.findByIdAndDelete({
      _id: id
    });
  } catch (e) {
    throw e;
  }
};

exports.addToCounter = async (id, reads) => {
  try {
    return await Post.findByIdAndUpdate(
      {
        _id: id
      },
      {
        $set: {
          reads
        }
      }
    );
  } catch (e) {
    throw e;
  }
};
