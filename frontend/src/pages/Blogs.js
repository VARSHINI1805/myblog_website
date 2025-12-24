import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Blogs() {
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const saveBlog = async () => {
    await fetch("http://localhost:5000/api/blogs", {
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
