import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Check if user is the author
        if (user && data.authorId?._id !== user._id) {
          setError("You are not authorized to edit this blog");
          return;
        }
        setDescription(data.description);
      } else {
        setError("Blog not found");
      }
    } catch (error) {
      setError("Error loading blog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setError("Please enter blog content");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description })
      });

      if (res.ok) {
        navigate(`/blog/${id}`);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update blog");
      }
    } catch (error) {
      setError("Error updating blog");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error && !description) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          &larr; Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        &larr; Back
      </button>

      <h2>Edit Blog</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="description">Blog Content</label>
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
            disabled={saving}
            style={styles.submitBtn}
          >
            {saving ? "Saving..." : "Save Changes"}
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
  form: {
    marginTop: "20px"
  },
  formGroup: {
    marginBottom: "20px"
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
    background: "#007bff",
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
