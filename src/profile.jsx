import CreatePost from "./components/CreatePost";
import { useState, useEffect } from "react";
import Post from "./components/Post";

export default function Profile({ loggedInUser, onPostCreated, onLogout }) {
  const user = {
    name: loggedInUser.name,
    username: loggedInUser.username,
    bio: loggedInUser.bio || "No bio yet.",
    profilePic: "img/profile.png",
    joined: loggedInUser.joined,
  };

  const [posts, setPosts] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState({});

  const fetchPosts = () => {
    fetch(`http://localhost:5001/api/posts/get/${loggedInUser.username}`)
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.error(err));
  };

  const fetchFriends = () => {
    fetch(`http://localhost:5001/api/user/${loggedInUser.username}/friends`)
      .then((res) => res.json())
      .then((data) => setFriends(data))
      .catch((err) => console.error(err));
  };

  const fetchFriendRequests = () => {
    fetch(
      `http://localhost:5001/api/user/${loggedInUser.username}/friend-requests`
    )
      .then((res) => res.json())
      .then((data) => setFriendRequests(data))
      .catch((err) => console.error(err));
  };

  const handlePostDeleted = () => {
    // Refresh both profile posts and main feed
    fetchPosts();
    if (onPostCreated) {
      onPostCreated();
    }
  };

  const handleSearchUsers = async (query) => {
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5001/api/user/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Filter out the logged-in user
      const filteredResults = data.filter(
        (user) => user.username !== loggedInUser.username
      );

      setSearchResults(filteredResults);

      // Fetch friend status for each result
      const statusPromises = filteredResults.map((result) =>
        fetch(
          `http://localhost:5001/api/user/${loggedInUser.username}/friend-status/${result.username}`
        )
          .then((res) => res.json())
          .catch(() => ({ status: "none" }))
      );

      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      filteredResults.forEach((result, index) => {
        statusMap[result.username] = statuses[index].status;
      });
      setFriendStatuses(statusMap);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSendFriendRequest = async (toUsername) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/user/friend-request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fromUsername: loggedInUser.username,
            toUsername,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to send friend request");
        return;
      }

      // Update friend status
      setFriendStatuses((prev) => ({
        ...prev,
        [toUsername]: "request_sent",
      }));

      if (data.accepted) {
        fetchFriends();
        alert("Friend request accepted automatically!");
      } else {
        alert("Friend request sent!");
      }

      // Refresh search to update statuses
      handleSearchUsers(searchQuery);
    } catch (error) {
      console.error("Send friend request error:", error);
      alert("Failed to send friend request");
    }
  };

  const handleAcceptFriendRequest = async (fromUsername) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/user/friend-request/accept",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser.username,
            fromUsername,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to accept friend request");
        return;
      }

      fetchFriendRequests();
      fetchFriends();
      alert("Friend request accepted!");
    } catch (error) {
      console.error("Accept friend request error:", error);
      alert("Failed to accept friend request");
    }
  };

  const handleRejectFriendRequest = async (fromUsername) => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/user/friend-request/reject",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser.username,
            fromUsername,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to reject friend request");
        return;
      }

      fetchFriendRequests();
    } catch (error) {
      console.error("Reject friend request error:", error);
      alert("Failed to reject friend request");
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchFriends();
    fetchFriendRequests();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearchUsers(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

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
            <button className="settings-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        </div>

        {/* Friends Section */}
        <section className="friends-section">
          <div className="friends-section-header">
            <h3>Friends</h3>
            <button
              className="add-friend-btn"
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? "Cancel" : "Add Friends"}
            </button>
          </div>

          {/* Search for Friends */}
          {showSearch && (
            <div className="friend-search-container">
              <input
                type="text"
                placeholder="Search for users by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="friend-search-input"
              />
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((result) => {
                    const status = friendStatuses[result.username] || "none";
                    return (
                      <div key={result.username} className="search-result-item">
                        <div className="search-result-info">
                          <p className="search-result-name">{result.name}</p>
                          <p className="search-result-username">
                            @{result.username}
                          </p>
                        </div>
                        {status === "none" && (
                          <button
                            className="friend-action-btn send-request-btn"
                            onClick={() =>
                              handleSendFriendRequest(result.username)
                            }
                          >
                            Send Request
                          </button>
                        )}
                        {status === "request_sent" && (
                          <span className="friend-status-text">
                            Request Sent
                          </span>
                        )}
                        {status === "friends" && (
                          <span className="friend-status-text friends">
                            Friends
                          </span>
                        )}
                        {status === "request_received" && (
                          <span className="friend-status-text">
                            Accept Request
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="friend-requests-container">
              <h4>Friend Requests ({friendRequests.length})</h4>
              <div className="friend-requests-list">
                {friendRequests.map((requester) => (
                  <div key={requester.username} className="friend-request-item">
                    <div className="friend-request-info">
                      <p className="friend-request-name">{requester.name}</p>
                      <p className="friend-request-username">
                        @{requester.username}
                      </p>
                    </div>
                    <div className="friend-request-actions">
                      <button
                        className="friend-action-btn accept-btn"
                        onClick={() =>
                          handleAcceptFriendRequest(requester.username)
                        }
                      >
                        Accept
                      </button>
                      <button
                        className="friend-action-btn reject-btn"
                        onClick={() =>
                          handleRejectFriendRequest(requester.username)
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          {friends.length > 0 ? (
            <div className="friends-list">
              {friends.map((friend) => (
                <div key={friend.username} className="friend-item">
                  <div className="friend-info">
                    <p className="friend-name">{friend.name}</p>
                    <p className="friend-username">@{friend.username}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showSearch && (
              <div className="empty-state">
                <p>
                  No friends yet. Click "Add Friends" to find people to connect
                  with!
                </p>
              </div>
            )
          )}
        </section>

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
