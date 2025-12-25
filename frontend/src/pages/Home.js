import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = "https://myblog-website-it3w.onrender.com";

const carouselImages = [
  { src: "/images/image1home.jpeg", alt: "Welcome to BlogBuzz" },
  { src: "/images/image2blog.jpeg", alt: "Share Your Stories" },
  { src: "/images/image3blog.jpeg", alt: "Connect with Others" }
];

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  /* ================= FETCH BLOGS ================= */
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${API}/api/blogs`);
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SEARCH ================= */
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchBlogs();
      return;
    }

    setSearching(true);
    const timer = setTimeout(() => searchBlogs(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchBlogs = async (query) => {
    try {
      const res = await fetch(
        `${API}/api/blogs/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setBlogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setBlogs([]);
    } finally {
      setSearching(false);
    }
  };

  /* ================= CAROUSEL ================= */
  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((p) => (p + 1) % carouselImages.length),
      4000
    );
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () =>
    setCurrentSlide((p) => (p + 1) % carouselImages.length);

  const prevSlide = () =>
    setCurrentSlide(
      (p) => (p - 1 + carouselImages.length) % carouselImages.length
    );

  const handleAddBlogClick = () => {
    user ? navigate("/add-blog") : navigate("/login");
  };

  const getShortDescription = (text, max = 120) =>
    text.length > max ? text.substring(0, max) + "..." : text;

  if (loading) return <p style={styles.loading}>Loading blogs...</p>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div>
          <h2>✍🏼 BlogApp</h2>
          <span style={styles.welcomeText}>
            {user ? `Welcome, ${user.name}` : "Welcome, Guest"}
          </span>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={handleAddBlogClick} style={styles.addBtn}>
            + Add Blog
          </button>
          {user ? (
            <button onClick={() => navigate("/dashboard")} style={styles.btn}>
              Dashboard
            </button>
          ) : (
            <>
              <Link to="/login">
                <button style={styles.btn}>Login</button>
              </Link>
              <Link to="/register">
                <button style={styles.btn}>Signup</button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* CAROUSEL */}
      <div style={styles.carousel}>
        <img
          src={carouselImages[currentSlide].src}
          alt={carouselImages[currentSlide].alt}
          style={styles.carouselImage}
        />
        <button onClick={prevSlide} style={styles.carouselBtnLeft}>‹</button>
        <button onClick={nextSlide} style={styles.carouselBtnRight}>›</button>
      </div>

      {/* SEARCH */}
      <input
        style={styles.searchInput}
        placeholder="Search blogs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searching && <p style={styles.searchStatus}>Searching...</p>}

      {/* BLOG LIST */}
      {blogs.length === 0 ? (
        <p style={styles.noResults}>No blogs found</p>
      ) : (
        <div style={styles.blogGrid}>
          {blogs.map((blog) => (
            <div
              key={blog._id}
              style={styles.blogCard}
              onClick={() => navigate(`/blog/${blog._id}`)}
            >
              <img
                src={blog.imageUrl || "https://via.placeholder.com/400x200"}
                alt="blog"
                style={styles.cardImage}
              />
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{blog.title}</h3>
                <p style={styles.cardDescription}>
                  {getShortDescription(blog.description)}
                </p>
                <div style={styles.cardAuthor}>
                  By {blog.authorId?.name || "Unknown"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */
const styles = {
  container: { maxWidth: "900px", margin: "0 auto", padding: "20px" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  welcomeText: { fontWeight: "bold" },
  headerButtons: { display: "flex", gap: "10px" },
  btn: { padding: "8px 15px", cursor: "pointer" },
  addBtn: {
    padding: "8px 15px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    cursor: "pointer"
  },
  carousel: { margin: "20px 0" },
  carouselImage: { width: "100%", height: "240px", objectFit: "cover" },
  carouselBtnLeft: { position: "absolute", left: "10px" },
  carouselBtnRight: { position: "absolute", right: "10px" },
  searchInput: { width: "100%", padding: "10px", marginBottom: "20px" },
  blogGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" },
  blogCard: { border: "1px solid #ddd", cursor: "pointer" },
  cardImage: { width: "100%", height: "150px", objectFit: "cover" },
  cardContent: { padding: "10px" },
  cardTitle: { margin: "5px 0" },
  cardDescription: { fontSize: "14px" },
  cardAuthor: { fontSize: "12px", color: "#666" },
  loading: { textAlign: "center" },
  noResults: { textAlign: "center" },
  searchStatus: { textAlign: "center" }
};
