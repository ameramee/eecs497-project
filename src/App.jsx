import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Post from "./components/Post";
import Login from "./login";
import Register from "./register";
import Profile from "./profile";
import Messaging from "./messaging";
import GlobalControls from "./components/GlobalControls";
import CreatePost from "./components/CreatePost";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState([]);

  const handleLogin = (username, name, bio, joined) => {
    setLoggedInUser({ username, name, bio, joined });
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const fetchPosts = () => {
    fetch("http://localhost:5001/api/posts/get")
      .then((res) => res.json())
      .then((data) =>
        setPosts(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        )
      )
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Router>
      {loggedInUser ? (
        <div className="app-wrapper">
          <Header onLogout={handleLogout} />
          <div className="main-content">
            <Routes>
              <Route
                path="/"
                element={
                  <div className="post-container">
                    <div className="feed-header">
                      <CreatePost
                        loggedInUser={loggedInUser}
                        onPostCreated={fetchPosts}
                      />
                    </div>
                    {posts && posts.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-state-icon">🌱</div>
                        <h2 className="empty-state-title">No posts yet</h2>
                        <p className="empty-state-message">
                          Be the first to share something with the community!
                        </p>
                      </div>
                    ) : (
                      posts.map((post) => (
                        <Post
                          key={post.id || post._id}
                          post={post}
                          loggedInUser={loggedInUser}
                          onPostUpdated={fetchPosts}
                        />
                      ))
                    )}
                  </div>
                }
              />
              <Route
                path="/profile"
                element={
                  <Profile
                    loggedInUser={loggedInUser}
                    onPostCreated={fetchPosts}
                  />
                }
              />
              <Route path="/messages" element={<Messaging />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          <Footer />
          <GlobalControls />
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<Register onLogin={handleLogin} />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}
export default App;
