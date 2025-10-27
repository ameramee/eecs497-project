export default function Post({ post }) {
  const handleLike = (e) => {
    e.preventDefault();
    // Add like functionality here
    console.log("Like clicked for post", post.postId);
  };

  const handleUnlike = (e) => {
    e.preventDefault();
    // Add unlike functionality here
    console.log("Unlike clicked for post", post.postId);
  };

  const handleComment = (e) => {
    e.preventDefault();
    // Add comment functionality here
    const formData = new FormData(e.target);
    const commentText = formData.get("text");
    console.log("Comment:", commentText, "for post", post.postId);
    e.target.reset();
  };

  return (
    <div id={post.id} className="post">
      <div className="top">
        <a href={`/users/${post.username}/`}>
          <img
            className="profilePic"
            src="/img/profile.png"
            alt="profile picture"
          />
        </a>
        <a href={`/users/${post.username}/`}>{post.username}</a>
        <a href={`/posts/${post.postId}/`} className="time">
          {post.timestamp}
        </a>
      </div>

      <div id={`image${post.id}`}>
        <img className="image" src="/img/post.png" alt="post image" />
        <div className="text">
          <p>{post.likeCount} likes</p>

          {post.comments.map((comment, index) => (
            <p key={index}>
              <a href={`/users/${comment.username}/`}>{comment.username}</a>{" "}
              {comment.text}
            </p>
          ))}
        </div>

        <div className="actions">
          <form action="#" method="get" onSubmit={handleLike}>
            <input type="hidden" name="postid" value={post.postId} />
            <input type="submit" value="like" />
          </form>

          <form action="#" method="get" onSubmit={handleUnlike}>
            <input type="hidden" name="postid" value={post.postId} />
            <input type="submit" value="unlike" />
          </form>
        </div>

        <form
          action="#"
          method="get"
          className="comment-form"
          onSubmit={handleComment}
        >
          <input type="hidden" name="postid" value={post.postId} />
          <input
            type="text"
            name="text"
            placeholder="Add a comment..."
            required
          />
          <input type="submit" value="comment" />
        </form>
      </div>
    </div>
  );
}
