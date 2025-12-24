import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


const carouselImages = [
  { src: "/images/image1home.jpeg", alt: "Welcome to BlogBuzz" },
  { src: "/images/image2blog.jpeg", alt: "Share Your Stories" },
  { src: "/images/image3blog.jpeg", alt: "Connect with Others" }
];

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initial load of all blogs
  useEffect(() => {
    fetchBlogs();
  }, []);

  // Debounced search - waits 300ms after user stops typing
  useEffect(() => {
    // Skip on initial render when searchQuery is empty
    if (searchQuery === "" && !searching) {
      return;
    }

    setSearching(true);

    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    // Cleanup: cancel the timer if user types again before 300ms
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/blogs");
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Actual search API call
  const performSearch = async (query) => {
    try {
      const url = query.trim()
        ? `http://localhost:5000/api/blogs/search?query=${encodeURIComponent(query)}`
        : "http://localhost:5000/api/blogs";
      const res = await fetch(url);
      const data = await res.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error searching blogs:", error);
    } finally {
      setSearching(false);
    }
  };

  // Handle input change - just update the query, useEffect handles the search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearching(true);
    performSearch("");
  };

  // Handle Add Blog button click - redirect based on auth status
  const handleAddBlogClick = () => {
    if (user) {
      navigate("/add-blog");
    } else {
      navigate("/login");
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getShortDescription = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading) {
    return <div style={styles.loading}>Loading blogs...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1>✍🏼BlogApp</h1>
          <span style={styles.welcomeText}>
            {user ? `Welcome, ${user.name}`:"Welcome, Guest"}
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
      <div style={styles.carousel} className="carousel-container">
        <div style={styles.carouselInner}>
          <img
            src={carouselImages[currentSlide].src}
            alt={carouselImages[currentSlide].alt}
            style={styles.carouselImage}
          />
          <div style={styles.carouselOverlay}>
            <h2 style={styles.carouselTitle}>{carouselImages[currentSlide].alt}</h2>
          </div>
        </div>
        <button onClick={prevSlide} style={styles.carouselBtnLeft}>
          &#10094;
        </button>
        <button onClick={nextSlide} style={styles.carouselBtnRight}>
          &#10095;
        </button>
        <div style={styles.dotsContainer}>
          {carouselImages.map((_, index) => (
            <span
              key={index}
              style={index === currentSlide ? styles.dotActive : styles.dot}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>

      <main style={styles.main}>
        <div style={styles.searchSection}>
          <h2>All Blogs</h2>
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by title or content..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                style={styles.clearBtn}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p style={styles.loading}>Loading blogs...</p>
        ) : searching ? (
          <p style={styles.searchStatus}>Searching...</p>
        ) : blogs.length === 0 ? (
          <p style={styles.noResults}>
            {searchQuery
              ? `No blogs found for "${searchQuery}"`
              : "No blogs yet. Be the first to create one!"}
          </p>
        ) : (
          <div className="blog-grid" style={styles.blogGrid}>
            {blogs.map(blog => (
              <div
                key={blog._id}
                style={styles.blogCard}
                onClick={() => navigate(`/blog/${blog._id}`)}
              >
                <div style={styles.cardImageContainer}>
                  <img
                    src={blog.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={blog.title || "Blog"}
                    style={styles.cardImage}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                    }}
                  />
                </div>
                <div style={styles.cardContent}>
                  {blog.title && <h3 style={styles.cardTitle}>{blog.title}</h3>}
                  <p style={styles.cardDescription}>
                    {getShortDescription(blog.description, 100)}
                  </p>
                  <div style={styles.cardAuthor}>
                    By: {blog.authorId?.name || "Unknown"}
                  </div>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardStat}>
                      {blog.likes?.length || 0} Likes
                    </span>
                    <span style={styles.cardStat}>
                      {blog.comments?.length || 0} Comments
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "15px"
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },
  welcomeText: {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#333"
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
  addBtn: {
    padding: "10px 20px",
    cursor: "pointer",
    border: "none",
    background: "#28a745",
    color: "#fff"
  },

  carousel: {
    position: "relative",
    width: "100%",
    height: "240px",
    marginTop: "0",
    marginBottom: "20px",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)"
  },
  carouselInner: {
    width: "100%",
    height: "100%",
    position: "relative",
    display: "block",
    lineHeight: "0"
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center",
    display: "block",
    transition: "opacity 0.5s ease-in-out"
  },
  carouselOverlay: {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
    padding: "20px 15px 12px",
    color: "#fff"
  },
  carouselTitle: {
    margin: "0",
    fontSize: "20px",
    fontWeight: "600",
    textShadow: "1px 1px 3px rgba(0,0,0,0.5)"
  },
  carouselBtnLeft: {
    position: "absolute",
    top: "50%",
    left: "10px",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.85)",
    border: "none",
    padding: "10px 13px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "50%",
    transition: "background 0.3s",
    lineHeight: "1"
  },
  carouselBtnRight: {
    position: "absolute",
    top: "50%",
    right: "10px",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.85)",
    border: "none",
    padding: "10px 13px",
    fontSize: "16px",
    cursor: "pointer",
    borderRadius: "50%",
    transition: "background 0.3s",
    lineHeight: "1"
  },
  dotsContainer: {
    position: "absolute",
    bottom: "10px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "8px"
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    transition: "background 0.3s"
  },
  dotActive: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#fff",
    cursor: "pointer",
    transition: "background 0.3s"
  },
  main: {
    marginTop: "20px"
  },
  searchSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "15px"
  },
  searchBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center"
  },
  searchInput: {
    padding: "10px 15px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    width: "250px",
    outline: "none"
  },
  clearBtn: {
    padding: "10px 15px",
    fontSize: "14px",
    border: "none",
    borderRadius: "6px",
    background: "#6c757d",
    color: "#fff",
    cursor: "pointer"
  },
  searchStatus: {
    textAlign: "center",
    color: "#666",
    padding: "20px"
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    padding: "40px",
    background: "#f9f9f9",
    borderRadius: "8px"
  },
  loading: {
    textAlign: "center",
    padding: "50px"
  },
  blogGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px"
  },
  blogCard: {
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
  },
  cardImageContainer: {
    width: "100%",
    height: "160px",
    overflow: "hidden",
    background: "#f0f0f0"
  },
  cardImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s"
  },
  cardContent: {
    padding: "15px"
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    lineHeight: "1.3",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  },
  cardDescription: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.5",
    margin: "0 0 12px 0",
    height: "42px",
    overflow: "hidden"
  },
  cardAuthor: {
    fontSize: "13px",
    color: "#888",
    fontStyle: "italic",
    marginBottom: "12px"
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    borderTop: "1px solid #eee",
    paddingTop: "12px"
  },
  cardStat: {
    fontSize: "12px",
    color: "#666",
    background: "#f5f5f5",
    padding: "4px 10px",
    borderRadius: "12px"
  }
};
