import CreatePost from "./components/CreatePost";
import { useState, useEffect } from "react";
import Post from "./components/Post";

export default function Profile({ loggedInUser, onPostCreated }) {
  const user = {
    name: loggedInUser.name,
    username: loggedInUser.username,
    bio: loggedInUser.bio || "No bio yet.",
    profilePic: "img/profile.png",
    joined: loggedInUser.joined,
  };

  const [posts, setPosts] = useState([]);

  const fetchPosts = () => {
    fetch(`http://localhost:5001/api/posts/get/${loggedInUser.username}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  };

  const handlePostDeleted = () => {
    // Refresh both profile posts and main feed
    fetchPosts();
    if (onPostCreated) {
      onPostCreated();
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="profile-page">
      <main className="profile-container">
        <div className="profile-card">
          <img
            src={user.profilePic}
            alt="Profile"
            className="profile-pic-large"
          />
          <h2>{user.name}</h2>
          <p className="username">{user.username}</p>
          <p className="bio">{user.bio}</p>
          <p className="joined">{user.joined}</p>

          <div className="profile-actions">
            <button className="edit-btn">Edit Profile</button>
            {loggedInUser && (
              <CreatePost
                loggedInUser={loggedInUser}
                onPostCreated={onPostCreated}
              />
            )}
            <button className="settings-btn">Settings</button>
          </div>
        </div>

        <section className="user-posts">
          <h3>{user.name}'s Posts</h3>
          {posts.length > 0 ? (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                fromMyProfile={true}
                onDelete={handlePostDeleted}
                loggedInUser={loggedInUser}
                onPostUpdated={handlePostDeleted}
              />
            ))
          ) : (
            <div className="empty-state">
              <p>No posts yet.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
