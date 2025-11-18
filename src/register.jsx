import { useState } from "react";
import { Link } from "react-router-dom";
import "./styles.css";

function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      username.trim() === "" ||
      password.trim() === "" ||
      name.trim() === "" ||
      bio.trim() === ""
    ) {
      setError("Please fill in all fields.");
      return;
    }

    setError("");

    try {
      const res = await fetch("http://localhost:5001/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, name, bio }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      // tell App.js the user registered and is now logged in
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
      <div className="register-card">
        <h1 className="login-title">Gather</h1>
        <p className="login-subtitle">Create an account to get started</p>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="register-form-fields">
            <div className="input-group full-width">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

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

            <div className="input-group full-width">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
                maxLength={200}
              />
              <small className="form-hint">{bio.length}/200 characters</small>
            </div>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn register-submit-btn">
            Create Account
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", fontSize: "0.95rem", color: "#555" }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{
              color: "#388e3c",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
