import { useState, useRef } from "react";

export default function CreatePost({ loggedInUser, onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const supportedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!file.type || !supportedTypes.includes(file.type.toLowerCase())) {
        setError(
          "Unsupported file type. Please upload an image file (JPEG, PNG, GIF, or WebP)."
        );
        setSelectedFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        return;
      }

      // Clear any previous errors
      setError("");
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("username", loggedInUser.username);
      formData.append("title", title.trim());
      formData.append("content", content.trim());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      const response = await fetch("http://localhost:5001/api/posts", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create post");
      }

      // Reset form
      setTitle("");
      setContent("");
      setSelectedFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsOpen(false);

      // Notify parent to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsOpen(false);
      setTitle("");
      setContent("");
      setSelectedFile(null);
      setImagePreview(null);
      setError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <>
      <button
        className="create-post-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Create new post"
      >
        Create Post
      </button>

      {isOpen && (
        <>
          <div
            className="modal-overlay"
            onClick={handleClose}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close modal"
          />
          <div
            className="create-post-modal"
            role="dialog"
            aria-labelledby="create-post-title"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2 id="create-post-title">Create New Post</h2>
              <button
                className="close-modal-btn"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="create-post-form">
              {error && (
                <div className="error-message" role="alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="post-title">Title *</label>
                <input
                  id="post-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What's your post about?"
                  required
                  disabled={isSubmitting}
                  maxLength={200}
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-content">Content *</label>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share your thoughts with the community..."
                  required
                  disabled={isSubmitting}
                  rows={6}
                  maxLength={2000}
                  aria-required="true"
                />
              </div>

              <div className="form-group">
                <label htmlFor="post-image-file">Image (optional)</label>
                <input
                  id="post-image-file"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                  aria-label="Select image file"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        marginTop: "10px",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                )}
                <small className="form-hint">
                  Leave empty to use the default image
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !title.trim() || !content.trim()}
                  className="submit-btn"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
