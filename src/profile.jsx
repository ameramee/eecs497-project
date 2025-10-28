export default function Profile() {
  const user = {
    name: "Eve",
    username: "@eve",
    bio: "Living life",
    profilePic: "img/profile.png",
    joined: "Joined January 2025",
    posts: [
      { id: 1, title: "New beginnings", content: "Starting my journey on Gather!" },
      { id: 2, title: "App experience", content: "I'm loving how intuitive and simple this app!" },
    ],
  };

  return (
    <div className="profile-page">
      <main className="profile-container">
        <div className="profile-card">
          <img src={user.profilePic} alt="Profile" className="profile-pic-large" />
          <h2>{user.name}</h2>
          <p className="username">{user.username}</p>
          <p className="bio">{user.bio}</p>
          <p className="joined">{user.joined}</p>

          <div className="profile-actions">
            <button className="edit-btn">Edit Profile</button>
            <button className="create-btn">Create Post</button>
            <button className="settings-btn">Settings</button>
          </div>
        </div>

        <section className="user-posts">
          <h3>{user.name.split(" ")[0]}'s Posts</h3>
          {user.posts.map((post) => (
            <div key={post.id} className="post">
              <div className="text">
                <p>{post.title}</p>
                <p>{post.content}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}