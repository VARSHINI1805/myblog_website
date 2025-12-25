import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [id]);

  useEffect(() => {
    if (user && blog) {
      setIsSaved(user.savedBlogs?.includes(blog._id));
    }
  }, [user, blog]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBlog(data);
      } else {
        setError("Blog not found");
      }
    } catch (error) {
      setError("Error loading blog");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like this blog");
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}/like`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
      }
    } catch (error) {
      console.error("Error liking blog:", error);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please login to save this blog");
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}/save`, {
        method: "POST",
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setIsSaved(data.saved);
        // Refresh user data to update savedBlogs array
        checkAuth();
      }
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to comment");
      return;
    }

    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}/comment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: comment })
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
        setComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        navigate("/");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  // Start editing a comment
  const handleStartEditComment = (commentId, currentMessage) => {
    setEditingCommentId(commentId);
    setEditCommentText(currentMessage);
  };

  // Cancel editing
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditCommentText("");
  };

  // Save edited comment
  const handleSaveEditComment = async (commentId) => {
    if (!editCommentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}/comment/${commentId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: editCommentText })
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
        setEditingCommentId(null);
        setEditCommentText("");
      } else {
        const data = await res.json();
        alert(data.message || "Failed to edit comment");
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${id}/comment/${commentId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        const updatedBlog = await res.json();
        setBlog(updatedBlog);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  // Check if current user has liked the blog
  const hasLiked = user && blog?.likes?.includes(user._id);

  // Check if current user can delete (is author or admin)
  const canDelete = user && blog && (
    blog.authorId?._id === user._id || user.role === "admin"
  );

  // Check if current user is the author (only author can edit)
  const canEdit = user && blog && blog.authorId?._id === user._id;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error || !blog) {
    return (
      <div style={styles.container}>
        <p>{error || "Blog not found"}</p>
        <button onClick={() => navigate("/")} style={styles.btn}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        &larr; Back to Home
      </button>

      <article style={styles.article}>
        <div style={styles.blogHeader}>
          <div style={styles.authorInfo}>
            <span style={styles.author}>By: {blog.authorId?.name || "Unknown"}</span>
            <span style={styles.date}>Created: {formatDate(blog.createdAt)}</span>
          </div>
          <div style={styles.headerActions}>
            {canEdit && (
              <button onClick={() => navigate(`/edit-blog/${id}`)} style={styles.editBtn}>
                Edit Blog
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} style={styles.deleteBtn}>
                Delete Blog
              </button>
            )}
          </div>
        </div>

        <div style={styles.content}>
          <p>{blog.description}</p>
        </div>

        <div style={styles.actions}>
          <button
            onClick={handleLike}
            style={hasLiked ? styles.likedBtn : styles.likeBtn}
          >
            {hasLiked ? "Unlike" : "Like"} ({blog.likes?.length || 0})
          </button>
          <button
            onClick={handleSave}
            style={isSaved ? styles.savedBtn : styles.saveBtn}
          >
            {isSaved ? "Unsave" : "Save"}
          </button>
        </div>
      </article>

      <section style={styles.commentsSection}>
        <h3>Comments ({blog.comments?.length || 0})</h3>

        {user && (
          <form onSubmit={handleAddComment} style={styles.commentForm}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
              style={styles.textarea}
              rows={3}
            />
            <button type="submit" style={styles.submitBtn}>
              Add Comment
            </button>
          </form>
        )}

        {!user && (
          <p style={styles.loginPrompt}>
            <a href="/login">Login</a> to add a comment
          </p>
        )}

        <div style={styles.commentsList}>
          {blog.comments?.length === 0 ? (
            <p style={styles.noComments}>No comments yet. Be the first to comment!</p>
          ) : (
            blog.comments?.map((c) => (
              <div key={c._id} style={styles.commentItem}>
                <div style={styles.commentHeader}>
                  <strong>{c.userId?.name || "Unknown"}</strong>
                  <div style={styles.commentHeaderRight}>
                    <span style={styles.commentDate}>
                      {formatDate(c.createdAt)}
                    </span>
                    {user && c.userId?._id === user._id && (
                      <div style={styles.commentActions}>
                        <button
                          onClick={() => handleStartEditComment(c._id, c.message)}
                          style={styles.commentEditBtn}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          style={styles.commentDeleteBtn}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {editingCommentId === c._id ? (
                  <div style={styles.editCommentForm}>
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      style={styles.editTextarea}
                      rows={3}
                    />
                    <div style={styles.editCommentButtons}>
                      <button
                        onClick={() => handleSaveEditComment(c._id)}
                        style={styles.saveCommentBtn}
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditComment}
                        style={styles.cancelCommentBtn}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={styles.commentMessage}>{c.message}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px"
  },
  loading: {
    textAlign: "center",
    padding: "50px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px"
  },
  article: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "25px",
    marginBottom: "30px"
  },
  blogHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "15px",
    borderBottom: "1px solid #eee"
  },
  authorInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "5px"
  },
  author: {
    fontWeight: "bold",
    color: "#333"
  },
  date: {
    color: "#666",
    fontSize: "14px"
  },
  headerActions: {
    display: "flex",
    gap: "10px"
  },
  editBtn: {
    padding: "8px 16px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  deleteBtn: {
    padding: "8px 16px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  content: {
    fontSize: "16px",
    lineHeight: "1.8",
    marginBottom: "20px"
  },
  actions: {
    marginTop: "20px",
    display: "flex",
    gap: "10px"
  },
  likeBtn: {
    padding: "10px 20px",
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer"
  },
  likedBtn: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  saveBtn: {
    padding: "10px 20px",
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer"
  },
  savedBtn: {
    padding: "10px 20px",
    background: "#ffc107",
    color: "#000",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  btn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "1px solid #333",
    background: "#fff"
  },
  commentsSection: {
    marginTop: "30px"
  },
  commentForm: {
    marginBottom: "20px"
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginBottom: "10px",
    resize: "vertical",
    boxSizing: "border-box"
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  loginPrompt: {
    color: "#666",
    marginBottom: "20px"
  },
  commentsList: {
    marginTop: "20px"
  },
  noComments: {
    color: "#666",
    fontStyle: "italic"
  },
  commentItem: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "4px",
    marginBottom: "10px"
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px"
  },
  commentHeaderRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  commentDate: {
    color: "#666",
    fontSize: "12px"
  },
  commentActions: {
    display: "flex",
    gap: "5px"
  },
  commentEditBtn: {
    padding: "4px 8px",
    fontSize: "12px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  },
  commentDeleteBtn: {
    padding: "4px 8px",
    fontSize: "12px",
    background: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  },
  editCommentForm: {
    marginTop: "10px"
  },
  editTextarea: {
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    resize: "vertical",
    boxSizing: "border-box",
    fontSize: "14px"
  },
  editCommentButtons: {
    display: "flex",
    gap: "10px",
    marginTop: "8px"
  },
  saveCommentBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  },
  cancelCommentBtn: {
    padding: "6px 12px",
    fontSize: "12px",
    background: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "3px",
    cursor: "pointer"
  },
  commentMessage: {
    margin: 0,
    lineHeight: "1.5"
  }
};
