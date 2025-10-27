export default function Header() {
  return (
    <div id="headers">
      <div className="header-content">
        <a className="left" href="/">
          Gather
        </a>
        <a className="right" href="/profile">
          Profile
        </a>
        <p style={{ color: "white" }}>|</p>
        <a className="right" href="/">
          Feed
        </a>
      </div>
    </div>
  );
}
