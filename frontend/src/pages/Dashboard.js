import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [blogs, setBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("my-blogs");
  const { user, logout, checkAuth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBlogs();
    fetchSavedBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      const res = await fetch("https://myblog-website-it3w.onrender.com/api/blogs/user/my-blogs", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedBlogs = async () => {
    try {
      const res = await fetch("https://myblog-website-it3w.onrender.com/api/blogs/user/saved", {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        setSavedBlogs(data);
      }
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${blogId}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (res.ok) {
        setBlogs(blogs.filter(b => b._id !== blogId));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete blog");
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const handleUnsave = async (blogId) => {
    try {
      const res = await fetch(`https://myblog-website-it3w.onrender.com/api/blogs/${blogId}/save`, {
        method: "POST",
        credentials: "include"
      });

      if (res.ok) {
        setSavedBlogs(savedBlogs.filter(b => b._id !== blogId));
        checkAuth();
      }
    } catch (error) {
      console.error("Error unsaving blog:", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Dashboard</h1>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate("/")} style={styles.btn}>
            Home
          </button>
          <button onClick={() => navigate("/chat")} style={styles.chatBtn}>
            Community Chat
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>
      <section style={styles.userSection}>
        <h2>User Details</h2>
        <div style={styles.userCard}>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Member since:</strong> {user?.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
        </div>
      </section>

      <div style={styles.tabs}>
        <button
          style={activeTab === "my-blogs" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("my-blogs")}
        >
          My Blogs ({blogs.length})
        </button>
        <button
          style={activeTab === "saved" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("saved")}
        >
          Saved Blogs ({savedBlogs.length})
        </button>
      </div>

      {activeTab === "my-blogs" && (
        <section style={styles.blogsSection}>
          <div style={styles.sectionHeader}>
            <h2>My Blogs</h2>
            <button onClick={() => navigate("/add-blog")} style={styles.addBtn}>
              + Add New Blog
            </button>
          </div>

          {blogs.length === 0 ? (
            <p style={styles.noBlogs}>
              You haven't created any blogs yet.
              <button onClick={() => navigate("/add-blog")} style={styles.linkBtn}>
                Create your first blog
              </button>
            </p>
          ) : (
            <div style={styles.blogList}>
              {blogs.map(blog => (
                <div key={blog._id} style={styles.blogCard}>
                  <div
                    style={styles.blogContent}
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    <p style={styles.description}>
                      {blog.description.length > 200
                        ? blog.description.substring(0, 200) + "..."
                        : blog.description}
                    </p>
                    <div style={styles.blogMeta}>
                      <span>{formatDate(blog.createdAt)}</span>
                      <span>{blog.likes?.length || 0} Likes</span>
                      <span>{blog.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                  <div style={styles.blogActions}>
                    <button
                      onClick={() => navigate(`/blog/${blog._id}`)}
                      style={styles.viewBtn}
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-blog/${blog._id}`)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "saved" && (
        <section style={styles.blogsSection}>
          <div style={styles.sectionHeader}>
            <h2>Saved Blogs</h2>
          </div>
          {savedBlogs.length === 0 ? (
            <p style={styles.noBlogs}>
              You haven't saved any blogs yet.
              <button onClick={() => navigate("/")} style={styles.linkBtn}>
                Browse blogs
              </button>
            </p>
          ) : (
            <div style={styles.blogList}>
              {savedBlogs.map(blog => (
                <div key={blog._id} style={styles.blogCard}>
                  <div
                    style={styles.blogContent}
                    onClick={() => navigate(`/blog/${blog._id}`)}
                  >
                    <p style={styles.description}>
                      {blog.description.length > 200
                        ? blog.description.substring(0, 200) + "..."
                        : blog.description}
                    </p>
                    <div style={styles.blogMeta}>
                      <span>By: {blog.authorId?.name || "Unknown"}</span>
                      <span>{blog.likes?.length || 0} Likes</span>
                      <span>{blog.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                  <div style={styles.blogActions}>
                    <button
                      onClick={() => navigate(`/blog/${blog._id}`)}
                      style={styles.viewBtn}
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUnsave(blog._id)}
                      style={styles.unsaveBtn}
                    >
                      Unsave
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px"
  },
  loading: {
    textAlign: "center",
    padding: "50px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "15px"
  },
  headerButtons: {
    display: "flex",
    gap: "10px"
  },
  btn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "1px solid #333",
    background: "#fff"
  },
  chatBtn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "#17a2b8",
    color: "#fff",
    borderRadius: "4px"
  },
  logoutBtn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "#dc3545",
    color: "#fff"
  },
  userSection: {
    marginBottom: "30px"
  },
  userCard: {
    background: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },
  tabs: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "10px"
  },
  tab: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "1px solid #ddd",
    background: "#fff",
    borderRadius: "4px"
  },
  activeTab: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "4px"
  },
  blogsSection: {
    marginTop: "20px"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  addBtn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "#28a745",
    color: "#fff",
    borderRadius: "4px"
  },
  noBlogs: {
    color: "#666",
    textAlign: "center",
    padding: "40px"
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    marginLeft: "10px",
    textDecoration: "underline"
  },
  blogList: {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },
  blogCard: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    overflow: "hidden"
  },
  blogContent: {
    padding: "20px",
    cursor: "pointer"
  },
  description: {
    fontSize: "16px",
    marginBottom: "10px",
    lineHeight: "1.5"
  },
  blogMeta: {
    display: "flex",
    gap: "20px",
    color: "#666",
    fontSize: "14px"
  },
  blogActions: {
    display: "flex",
    gap: "10px",
    padding: "10px 20px",
    background: "#f9f9f9",
    borderTop: "1px solid #ddd"
  },
  viewBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #007bff",
    background: "#fff",
    color: "#007bff",
    borderRadius: "4px"
  },
  editBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "none",
    background: "#007bff",
    color: "#fff",
    borderRadius: "4px"
  },
  deleteBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "none",
    background: "#dc3545",
    color: "#fff",
    borderRadius: "4px"
  },
  unsaveBtn: {
    padding: "8px 16px",
    cursor: "pointer",
    border: "none",
    background: "#ffc107",
    color: "#000",
    borderRadius: "4px"
  }
};
