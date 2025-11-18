export default function Post({
  post,
  fromMyProfile = false,
  onDelete,
  loggedInUser,
  onPostUpdated,
}) {
  const isLiked = post.likedBy && post.likedBy.includes(loggedInUser?.username);

  const handleLike = async (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      alert("Please log in to like posts");
      return;
    }

    try {
      const postId = post.postId || post._id;
      const response = await fetch(
        `http://localhost:5001/api/posts/${postId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser.username,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to like post");
      }

      // Notify parent component to refresh posts
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error("Like error:", error);
      alert(error.message || "Failed to like post");
    }
  };

  const handleUnlike = async (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      alert("Please log in to unlike posts");
      return;
    }

    try {
      const postId = post.postId || post._id;
      const response = await fetch(
        `http://localhost:5001/api/posts/${postId}/unlike`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser.username,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to unlike post");
      }

      // Notify parent component to refresh posts
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error("Unlike error:", error);
      alert(error.message || "Failed to unlike post");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!loggedInUser) {
      alert("Please log in to comment");
      return;
    }

    const formData = new FormData(e.target);
    const commentText = formData.get("text");

    if (!commentText || !commentText.trim()) {
      return;
    }

    try {
      const postId = post.postId || post._id;
      const response = await fetch(
        `http://localhost:5001/api/posts/${postId}/comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: loggedInUser.username,
            text: commentText.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add comment");
      }

      e.target.reset();

      // Notify parent component to refresh posts
      if (onPostUpdated) {
        onPostUpdated();
      }
    } catch (error) {
      console.error("Comment error:", error);
      alert(error.message || "Failed to add comment");
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const postId = post.postId || post._id;
      const response = await fetch(
        `http://localhost:5001/api/posts/${postId}?username=${post.username}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete post");
      }

      // Notify parent component to refresh posts
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message || "Failed to delete post");
    }
  };

  return (
    <div id={post.id || post._id} className="post">
      <div className="top">
        <a href={`/users/${post.username}/`}>
          <img
            className="profilePic"
            src="/img/profile.png"
            alt="profile picture"
          />
        </a>
        <a href={`/users/${post.username}/`}>{post.username}</a>
        <a href={`/posts/${post.postId || post._id}/`} className="time">
          {post.timestamp || new Date(post.createdAt).toLocaleString()}
        </a>
      </div>

      <div id={`image${post.id || post._id}`}>
        <img
          className="image"
          src={post.imageUrl || "/img/post.png"}
          alt={post.title || "post image"}
        />
        <div className="text">
          {post.title && <p>{post.title}</p>}
          {post.content && <p>{post.content}</p>}
          <p>{post.likeCount || 0} likes</p>

          {post.comments && post.comments.length > 0
            ? post.comments.map((comment, index) => (
                <p key={index}>
                  <a href={`/users/${comment.username}/`}>{comment.username}</a>{" "}
                  {comment.text}
                </p>
              ))
            : null}
        </div>

        {fromMyProfile && (
          <div className="actions">
            <button
              onClick={handleDelete}
              className="delete-btn"
              style={{
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Delete Post
            </button>
          </div>
        )}

        {!fromMyProfile && (
          <div className="actions">
            {isLiked ? (
              <form action="#" method="get" onSubmit={handleUnlike}>
                <input
                  type="hidden"
                  name="postid"
                  value={post.postId || post._id}
                />
                <input type="submit" value="unlike" />
              </form>
            ) : (
              <form action="#" method="get" onSubmit={handleLike}>
                <input
                  type="hidden"
                  name="postid"
                  value={post.postId || post._id}
                />
                <input type="submit" value="like" />
              </form>
            )}
          </div>
        )}

        {!fromMyProfile && (
          <form
            action="#"
            method="get"
            className="comment-form"
            onSubmit={handleComment}
          >
            <input
              type="hidden"
              name="postid"
              value={post.postId || post._id}
            />
            <input
              type="text"
              name="text"
              placeholder="Add a comment..."
              required
            />
            <input type="submit" value="comment" />
          </form>
        )}
      </div>
    </div>
  );
}
