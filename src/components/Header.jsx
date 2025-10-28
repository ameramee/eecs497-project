import { Link } from "react-router-dom";

export default function Header() {
  return (
    <div id="headers">
      <div className="header-content">
        <Link className="left" to="/">
          Gather
        </Link>
        <Link className="right" to="/profile">
          Profile
        </Link>
        <p style={{ color: "white" }}>|</p>
        <Link className="right" to="/">
          Feed
        </Link>
      </div>
    </div>
  );
}