const Post = require('../models/post.model');

exports.createPost = async (req, res) => {
  try {
      const { title, text } = req.body;
      if (!title || !text) {
        return res.status(400).json({ success: false, message: 'Title and text are required' });
      }
    const imageUrl = req.file?.filename; // file uploaded via multer

    console.log('Image URL:', imageUrl);

    const post = await Post.create({
      title,
      text,
      imageUrl, // save only the filename
      creatorId: req.user.id
    });

    res.status(201).json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const id = req.user?.id;
    const posts = await Post.find({ creatorId: id }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.query;
    const skip = (page - 1) * limit;
    const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.incrementLikes = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.incrementViews = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    res.json({ success: true, post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
