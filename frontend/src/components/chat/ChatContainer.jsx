import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { io } from 'socket.io-client';

const ChatContainer = ({ user, userModel = 'User', currentChat }) => {

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { backendUrl } = useContext(AppContext);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  // 🔥 Initialize socket only once
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(backendUrl.replace('/api', ''), {
        transports: ['websocket']
      });
    }

    const socket = socketRef.current;

    if (user?._id) {
      socket.emit("user_online", user._id);
    }

    socket.on("online_users", (users) => {
      console.log("ONLINE USERS:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online_users");
    };

  }, [backendUrl, user?._id]);

  // Join room
  useEffect(() => {
    if (!socketRef.current || !currentChat) return;

    socketRef.current.emit('join_room', currentChat._id);

    socketRef.current.on("receive_message", (data) => {
      if (data.chatId === currentChat._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => {
      socketRef.current.off("receive_message");
    };
  }, [currentChat]);

  // Fetch messages
  useEffect(() => {
    if (!currentChat) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/api/chat/${currentChat._id}`);
        setMessages(res.data?.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentChat, backendUrl]);

  // Scroll bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post(`${backendUrl}/api/chat/message`, {
        chatId: currentChat._id,
        senderId: user._id,
        senderModel: userModel,
        content: newMessage
      });

      setMessages(prev => [...prev, res.data]);
      setNewMessage('');

      socketRef.current.emit("send_message", {
        chatId: currentChat._id,
        ...res.data
      });

    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  if (!currentChat) {
    return <div className="h-full flex items-center justify-center">Select a chat</div>;
  }

  // 🔥 Get Other User
  const otherUser = currentChat.participants?.find(
    p => String(p.id?._id) !== String(user?._id)
  )?.id;

  // 🔥 Proper ID comparison
  const isOnline = onlineUsers.some(
    id => String(id) === String(otherUser?._id)
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold">{otherUser?.name}</h3>
        <p className="text-sm text-gray-500">
          {isOnline ? "Online" : "Offline"}
        </p>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? "Loading..." : messages.map((msg, i) => (
          <div key={i}
            className={`flex ${
              String(msg.sender) === String(user?._id)
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div className={`px-4 py-2 rounded-lg max-w-[70%] ${
              String(msg.sender) === String(user?._id)
                ? "bg-blue-500 text-white"
                : "bg-white shadow"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Type message..."
        />
        <button className="bg-blue-500 text-white px-4 rounded-full">
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};

export default ChatContainer;
