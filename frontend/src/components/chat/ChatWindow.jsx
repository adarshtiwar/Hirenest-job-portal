import React, { useEffect, useMemo } from "react";
import { format, isToday, isYesterday } from "date-fns";

const ChatWindow = ({
  messages,
  user,
  isTyping,
  newMessage,
  onMessageChange,
  onSendMessage,
  messagesEndRef,
  currentChat,
  onlineUsers = []   // ✅ NEW PROP
}) => {

  const getOtherParticipant = () => {
    return currentChat?.participants?.find(
      (p) => p.id._id !== user._id
    )?.id;
  };

  const otherParticipant = getOtherParticipant();

  // ✅ Check Online Status
  const isOnline = onlineUsers.includes(otherParticipant?._id);

  // ✅ Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = {};

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt || msg.timestamp);
      const dateKey = format(date, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(msg);
    });

    return groups;
  }, [messages]);

  // ✅ Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd MMM yyyy");
  };

  const formatTime = (timestamp) =>
    format(new Date(timestamp), "h:mm a");

  return (
    <div className="chat-window">

      {/* HEADER */}
      <div className="chat-header">
        <div className="chat-header-user">
          <div className="chat-header-avatar">
            {otherParticipant?.name?.charAt(0) || "U"}
          </div>
          <div>
            <h3>{otherParticipant?.name || "Unknown"}</h3>
            <p>
              {isTyping
                ? "Typing..."
                : isOnline
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages">

        {Object.keys(groupedMessages).map((dateKey) => (
          <div key={dateKey}>

            {/* Sticky Date */}
            <div className="date-divider">
              {formatDateLabel(dateKey)}
            </div>

            {groupedMessages[dateKey].map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === user._id ? "sent" : "received"
                }`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {formatTime(message.createdAt || message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form className="chat-input-form" onSubmit={onSendMessage}>
        <input
          type="text"
          placeholder="Type a message 😊"
          value={newMessage}
          onChange={onMessageChange}
          className="chat-input"
        />
        <button type="submit" disabled={!newMessage.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
