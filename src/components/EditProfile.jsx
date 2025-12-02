import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EditProfile({ loggedInUser }) {
  const navigate = useNavigate();

  const [name, setName] = useState(loggedInUser.name);
  const [bio, setBio] = useState(loggedInUser.bio || "");
  const [profilePic, setProfilePic] = useState(loggedInUser.profilePic);

  const handleSave = async () => {
    const response = await fetch("http://localhost:5001/api/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loggedInUser.username,
        name,
        bio,
        profilePic, 
      }),
    });

    if (response.ok) {
      alert("Profile updated!");
      navigate("/profile");
    } else {
      alert("Update failed.");
    }
  };

  return (
    <div className="edit-profile-page" style={{ maxWidth: "450px", margin: "0 auto" }}>
      <h2>Edit Profile</h2>

      {/* NAME */}
      <div className="form-group">
        <label>Name</label>
        <input
          type="text"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />
      </div>

      {/* BIO */}
      <div className="form-group">
        <label>Bio</label>
        <textarea
          className="textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell people about yourself..."
          rows={4}
        />
      </div>

      {/* PROFILE PICTURE */}
      <div className="form-group">
        <label>Profile Picture URL</label>
        <input
          type="text"
          className="input"
          value={profilePic}
          onChange={(e) => setProfilePic(e.target.value)}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {/* BUTTONS */}
      <div className="button-group">
        <button className="save-btn" onClick={handleSave}>
          Save Changes
        </button>
        <button className="cancel-btn" onClick={() => navigate("/profile")}>
          Cancel
        </button>
      </div>
    </div>
  );
}