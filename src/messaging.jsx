import { useEffect, useRef, useState } from "react";

export default function Messaging({ loggedInUser }) {
  const [friends, setFriends] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesListRef = useRef(null);

  // Fetch friends list for conversations
  useEffect(() => {
    if (!loggedInUser) return;
    fetch(`http://localhost:5001/api/user/${loggedInUser.username}/friends`)
      .then((res) => res.json())
      .then((data) => {
        setFriends(data);
        setConversations(
          data.map((f) => ({
            username: f.username,
            name: f.name,
            lastMessage: "",
            timestamp: "",
            unread: 0,
          }))
        );
        if (data.length > 0 && !selectedFriend) {
          setSelectedFriend(data[0].username);
        }
      });
  }, [loggedInUser]);

  // Fetch messages when selectedFriend changes, and poll every 2 seconds
  useEffect(() => {
    if (!selectedFriend || !loggedInUser) return;
    let isMounted = true;
    let timeoutId;
    let firstLoad = true;
    let prevMessages = [];

    const fetchMessages = () => {
      fetch(
        `http://localhost:5001/api/messages/history?user1=${encodeURIComponent(
          loggedInUser.username
        )}&user2=${encodeURIComponent(selectedFriend)}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (isMounted) {
            const newMessages = data.map((msg, idx) => ({
              id: msg._id || idx,
              sender: msg.from,
              text: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleString(),
              isOwn: msg.from === loggedInUser.username,
            }));
            // Only set loading false on first load
            if (firstLoad) {
              setLoading(false);
              setInitialLoad(false);
              firstLoad = false;
            }
            // Scroll logic: if user is at bottom or new message arrives, scroll to bottom
            const list = messagesListRef.current;
            const isAtBottom =
              list &&
              list.scrollHeight - list.scrollTop - list.clientHeight < 50;
            const newMsgArrived =
              prevMessages.length && newMessages.length > prevMessages.length;
            setMessages((oldMsgs) => {
              prevMessages = newMessages;
              return newMessages;
            });
            setTimeout(() => {
              if (list && (isAtBottom || newMsgArrived)) {
                list.scrollTop = list.scrollHeight;
              }
            }, 10);
          }
        });
    };

    setLoading(true);
    setInitialLoad(true);
    fetchMessages();
    const poll = () => {
      timeoutId = setTimeout(() => {
        fetchMessages();
        poll();
      }, 2000);
    };
    poll();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [selectedFriend, loggedInUser]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedFriend) return;
    const msg = messageInput.trim();
    setMessageInput("");
    const res = await fetch("http://localhost:5001/api/messages/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fromUsername: loggedInUser.username,
        toUsername: selectedFriend,
        content: msg,
      }),
    });
    if (res.ok) {
      // After sending, scroll to bottom
      setTimeout(() => {
        if (messagesListRef.current) {
          messagesListRef.current.scrollTop =
            messagesListRef.current.scrollHeight;
        }
      }, 50);
    }
  };

  return (
    <div className="messaging-page">
      <div className="messaging-container">
        <div className="conversations-list">
          <h2 className="conversations-title">Messages</h2>
          {conversations.length === 0 && (
            <div className="empty-state">
              <p>No friends to message yet.</p>
            </div>
          )}
          {conversations.map((conversation) => (
            <div
              key={conversation.username}
              className={`conversation-item ${
                conversation.username === selectedFriend ? "active" : ""
              }`}
              onClick={() => setSelectedFriend(conversation.username)}
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
                </div>
                <p className="conversation-preview">
                  {conversation.lastMessage}
                </p>
                <span className="conversation-time">
                  {conversation.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="message-area">
          {selectedFriend ? (
            <>
              <div className="message-header">
                <img
                  src="/img/profile.png"
                  alt={selectedFriend}
                  className="message-header-avatar"
                />
                <div className="message-header-info">
                  <h3>{selectedFriend}</h3>
                  <p className="message-header-status">Active now</p>
                </div>
              </div>

              <div
                className="messages-list"
                ref={messagesListRef}
                style={{ minHeight: 200, maxHeight: 400, overflowY: "auto" }}
              >
                {initialLoad && loading ? (
                  <div>Loading...</div>
                ) : messages.length === 0 ? (
                  <div className="empty-state">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`message ${
                        message.isOwn ? "message-own" : "message-other"
                      }`}
                    >
                      <div className="message-content">
                        <p className="message-text">{message.text}</p>
                        <span className="message-time">
                          {message.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-area">
                <form className="message-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="message-input"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    disabled={!selectedFriend}
                  />
                  <button
                    type="submit"
                    className="message-send-btn"
                    disabled={!selectedFriend || !messageInput.trim()}
                  >
                    Send
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Select a friend to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
