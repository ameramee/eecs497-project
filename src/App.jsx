import Header from "./components/Header";
import Post from "./components/Post";
import Footer from "./components/Footer";

function App() {
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

  return (
    <>
      <Header />
      <div className="post-container">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <Footer />
    </>
  );
}

export default App;
