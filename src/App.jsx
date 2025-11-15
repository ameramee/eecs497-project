import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Post from "./components/Post";
import Login from "./login";
import Profile from "./profile";
import Messaging from "./messaging";
import GlobalControls from "./components/GlobalControls";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [posts, setPosts] = useState(null)

  const handleLogin = (username) => {
    setLoggedInUser(username);
  };

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  useEffect(() => {
    fetch("http://localhost:5173/api/posts")    //TODO: Change??
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  }, []);

  /*
  const posts = [
    {
      id: 1,
      username: "alice",
      postId: 1,
      timestamp: "2025-10-16 14:00",
      likeCount: 3,
      comments: [
        { username: "bob", text: "Nice shot!" },
        { username: "carol", text: "Love this." },
      ],
    },
    {
      id: 2,
      username: "bob",
      postId: 2,
      timestamp: "2025-10-17 09:30",
      likeCount: 5,
      comments: [
        { username: "alice", text: "Beautiful day!" },
        { username: "carol", text: "So lovely!" },
        { username: "dave", text: "Great picture!" },
      ],
    },
    {
      id: 3,
      username: "carol",
      postId: 3,
      timestamp: "2025-10-18 16:45",
      likeCount: 7,
      comments: [
        { username: "alice", text: "Amazing!" },
        { username: "bob", text: "This is wonderful." },
        { username: "dave", text: "Love it!" },
        { username: "eve", text: "So nice to see this!" },
      ],
    },
  ];
*/
  return (
    <Router>
      {loggedInUser ? (
        <>
          <Header onLogout={handleLogout} />
          <Routes>
            <Route
              path="/"
              element={
                <div className="post-container">
                  {posts.map((post) => (
                    <Post key={post.id} post={post} />
                  ))}
                </div>
              }
            />
            <Route path="/profile" element={<Profile />} />
            <Route path="/messages" element={<Messaging />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Footer />
          <GlobalControls />
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}
