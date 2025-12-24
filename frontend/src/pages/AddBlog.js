import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddBlog() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Please enter blog content");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/blogs", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, imageUrl })
      });

      if (res.ok) {
        navigate("/dashboard");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create blog");
      }
    } catch (error) {
      setError("Error creating blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        &larr; Back
      </button>

      <h2>Create New Blog</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="title">Blog Title (Optional)</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="imageUrl">Image URL (Optional)</label>
          <input
            type="text"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={styles.input}
          />
          {imageUrl && (
            <div style={styles.imagePreview}>
              <img
                src={imageUrl}
                alt="Preview"
                style={styles.previewImage}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="description">Blog Content *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your blog content here..."
            style={styles.textarea}
            rows={10}
          />
        </div>
        <div style={styles.buttons}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={styles.submitBtn}
          >
            {loading ? "Creating..." : "Create Blog"}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "700px",
    margin: "0 auto",
    padding: "20px"
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#007bff",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px"
  },
  form: {
    marginTop: "20px"
  },
  formGroup: {
    marginBottom: "20px"
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginTop: "8px",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginTop: "8px",
    resize: "vertical",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  imagePreview: {
    marginTop: "10px",
    borderRadius: "8px",
    overflow: "hidden",
    maxWidth: "300px"
  },
  previewImage: {
    width: "100%",
    height: "auto",
    display: "block"
  },
  buttons: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end"
  },
  cancelBtn: {
    padding: "12px 24px",
    background: "#f0f0f0",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer"
  },
  submitBtn: {
    padding: "12px 24px",
    background: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  error: {
    color: "#dc3545",
    background: "#f8d7da",
    padding: "10px",
    borderRadius: "4px",
    marginBottom: "15px"
  }
};
