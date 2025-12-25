import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const API = "https://myblog-website-it3w.onrender.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, message: data.message };
      }

      await checkAuth();
      return { success: true };
    } catch (err) {
      return { success: false, message: "Server not reachable" };
    }
  };

  // ✅ ADD THIS (MISSING)
  const register = async (username, email, password) => {
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, email, password })
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, message: data.message };
      }

      return { success: true };
    } catch (err) {
      return { success: false, message: "Server not reachable" };
    }
  };

  const logout = async () => {
    await fetch(`${API}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
