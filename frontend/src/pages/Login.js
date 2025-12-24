import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back 👋</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p style={styles.text}>
          Don’t have an account?{" "}
          <Link to="/register" style={styles.link}>Sign up</Link>
        </p>

        <p style={styles.text}>
          <Link to="/" style={styles.link}>Back to Home</Link>
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
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "14px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    outline: "none",
    fontSize: "15px"
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
  error: {
    color: "#842029",
    background: "#f8d7da",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "15px",
    textAlign: "center",
    fontSize: "14px"
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
