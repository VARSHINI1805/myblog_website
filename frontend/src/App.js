import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BlogDetails from "./pages/BlogDetails";
import AddBlog from "./pages/AddBlog";
import EditBlog from "./pages/EditBlog";
import Chat from "./pages/Chat";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
         
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/blog/:id" element={<BlogDetails />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-blog"
            element={
              <ProtectedRoute>
                <AddBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-blog/:id"
            element={
              <ProtectedRoute>
                <EditBlog />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
