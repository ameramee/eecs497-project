import "./styles.css";

export default function Messaging() {
  // Placeholder conversations - will be replaced with database data later
  const conversations = [
    {
      id: 1,
      username: "alice",
      lastMessage: "Hey, how are you?",
      timestamp: "2 hours ago",
      unread: 2,
    },
    {
      id: 2,
      username: "bob",
      lastMessage: "Thanks for the help!",
      timestamp: "1 day ago",
      unread: 0,
    },
    {
      id: 3,
      username: "carol",
      lastMessage: "See you tomorrow!",
      timestamp: "3 days ago",
      unread: 0,
    },
  ];

  // Placeholder messages for selected conversation - will be replaced with database data later
  const messages = [
    {
      id: 1,
      sender: "alice",
      text: "Hey, how are you?",
      timestamp: "2 hours ago",
      isOwn: false,
    },
    {
      id: 2,
      sender: "you",
      text: "I'm doing great, thanks for asking!",
      timestamp: "1 hour ago",
      isOwn: true,
    },
    {
      id: 3,
      sender: "alice",
      text: "That's wonderful to hear!",
      timestamp: "2 hours ago",
      isOwn: false,
    },
  ];

  const selectedConversation = conversations[0];

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        <div className="conversations-list">
          <h2 className="conversations-title">Messages</h2>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`conversation-item ${
                conversation.id === selectedConversation.id ? "active" : ""
              }`}
            >
              <img
                src="/img/profile.png"
                alt={conversation.username}
                className="conversation-avatar"
              />
              <div className="conversation-info">
                <div className="conversation-header">
                  <span className="conversation-username">
                    {conversation.username}
                  </span>
                  {conversation.unread > 0 && (
                    <span className="unread-badge">{conversation.unread}</span>
                  )}
                </div>
                <p className="conversation-preview">{conversation.lastMessage}</p>
                <span className="conversation-time">{conversation.timestamp}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="message-area">
          <div className="message-header">
            <img
              src="/img/profile.png"
              alt={selectedConversation.username}
              className="message-header-avatar"
            />
            <div className="message-header-info">
              <h3>{selectedConversation.username}</h3>
              <p className="message-header-status">Active now</p>
            </div>
          </div>

          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isOwn ? "message-own" : "message-other"}`}
              >
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <span className="message-time">{message.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="message-input-area">
            <form
              className="message-form"
              onSubmit={(e) => {
                e.preventDefault();
                // Message sending functionality will be added later
              }}
            >
              <input
                type="text"
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="message-send-btn">
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

