import Blog from "../models/Blog.js";
import User from "../models/User.js";

export const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .populate("authorId", "name")
      .populate("comments.userId", "name")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const searchBlogs = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      const blogs = await Blog.find()
        .populate("authorId", "name")
        .populate("comments.userId", "name")
        .sort({ createdAt: -1 });
      return res.json(blogs);
    }
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const blogs = await Blog.find({
      $or: [
        { title: { $regex: escapedQuery, $options: "i" } },
        { description: { $regex: escapedQuery, $options: "i" } }
      ]
    })
      .populate("authorId", "name")
      .populate("comments.userId", "name")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ authorId: req.user.userId })
      .populate("authorId", "name")
      .sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const blog = await Blog.create({
      authorId: req.user.userId,
      title: title || "",
      description,
      imageUrl: imageUrl || ""
    });

    const populatedBlog = await Blog.findById(blog._id).populate("authorId", "name");
    res.status(201).json(populatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const user = await User.findById(req.user.userId);

    const isAuthor = blog.authorId.toString() === req.user.userId;
    const isAdmin = user.role === "admin";

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Only the author can update their blog
    const isAuthor = blog.authorId.toString() === req.user.userId;

    if (!isAuthor) {
      return res.status(403).json({ message: "Not authorized to edit this blog" });
    }

    // Update only the description, preserving likes and comments
    blog.description = description;
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Like/Unlike a blog
export const toggleLike = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.userId;
    const hasLiked = blog.likes.includes(userId);

    if (hasLiked) {
      // Unlike - remove user from likes array
      blog.likes = blog.likes.filter(id => id.toString() !== userId);
    } else {
      // Like - add user to likes array
      blog.likes.push(userId);
    }

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add a comment to a blog
export const addComment = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.comments.push({
      userId: req.user.userId,
      message,
      createdAt: new Date()
    });

    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Edit a comment (only comment owner can edit)
export const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Comment message is required" });
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Find the comment
    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to edit this comment" });
    }

    // Update the comment message
    comment.message = message;
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a comment (only comment owner can delete)
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Find the comment
    const comment = blog.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the comment owner
    if (comment.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    // Remove the comment using pull
    blog.comments.pull(commentId);
    await blog.save();

    const updatedBlog = await Blog.findById(req.params.id)
      .populate("authorId", "name")
      .populate("comments.userId", "name");

    res.json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Save/Unsave a blog (bookmark)
export const toggleSaveBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.user.userId;

    // Check if blog exists
    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const user = await User.findById(userId);
    const hasSaved = user.savedBlogs.includes(blogId);

    if (hasSaved) {
      // Unsave - remove blog from savedBlogs array
      user.savedBlogs = user.savedBlogs.filter(id => id.toString() !== blogId);
    } else {
      // Save - add blog to savedBlogs array
      user.savedBlogs.push(blogId);
    }

    await user.save();

    res.json({
      message: hasSaved ? "Blog unsaved" : "Blog saved",
      saved: !hasSaved,
      savedBlogs: user.savedBlogs
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get user's saved blogs
export const getSavedBlogs = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate({
      path: "savedBlogs",
      populate: { path: "authorId", select: "name" }
    });

    res.json(user.savedBlogs || []);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
