import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Blogs() {
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const saveBlog = async () => {
    await fetch("https://myblog-website-it3w.onrender.com/api/blogs", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description })
    });
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Create Blog</h2>
      
      <textarea onChange={e => setDescription(e.target.value)} />
      <button onClick={saveBlog}>Save</button>
    </div>
  );
}
