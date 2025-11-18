import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (username.trim() === "" || password.trim() === "") {
      setError("Please fill in both fields.");
      return;
    }

    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // tell App.js the user logged in
      onLogin(
        data.user.username,
        data.user.name,
        data.user.bio,
        data.user.joined
      );
    } catch (err) {
      setError("Server error");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Gather</h1>
        <p className="login-subtitle">Welcome back — log in to continue</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "#555" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{
              color: "#388e3c",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
