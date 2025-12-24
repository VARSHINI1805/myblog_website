import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getAllBlogs,
  getBlogById,
  getMyBlogs,
  createBlog,
  deleteBlog,
  updateBlog,
  toggleLike,
  addComment,
  editComment,
  deleteComment,
  toggleSaveBlog,
  getSavedBlogs,
  searchBlogs
} from "../controllers/blogController.js";

const router = express.Router();

router.get("/", getAllBlogs);
router.get("/search", searchBlogs);

router.get("/user/my-blogs", authMiddleware, getMyBlogs);
router.get("/user/saved", authMiddleware, getSavedBlogs);

router.get("/:id", getBlogById);
router.post("/", authMiddleware, createBlog);
router.put("/:id", authMiddleware, updateBlog);
router.delete("/:id", authMiddleware, deleteBlog);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);
router.put("/:id/comment/:commentId", authMiddleware, editComment);
router.delete("/:id/comment/:commentId", authMiddleware, deleteComment);
router.post("/:id/save", authMiddleware, toggleSaveBlog);

export default router;
