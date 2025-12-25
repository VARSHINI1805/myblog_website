import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const register = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("https://myblog-website-it3w.onrender.com/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();

      if (res.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure backend is running on port 5000.");
      console.error("Register error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          placeholder="Full Name"
          onChange={e => setName(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Email Address"
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={register} disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <p style={styles.text}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8"
  },
  card: {
    width: "360px",
    padding: "30px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px"
  },
  error: {
    color: "#dc3545",
    background: "#f8d7da",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "14px",
    textAlign: "center",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px"
  },
  text: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px"
  },
  link: {
    color: "#4f46e5",
    textDecoration: "none",
    fontWeight: "500"
  }
};
