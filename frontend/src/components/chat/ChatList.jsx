import React from 'react';

const ChatList = ({ chats = [], currentChat, onSelectChat, user }) => {
  // Get the other participant in the chat (not the current user)
  const getOtherParticipant = (chat) => {
    if (!user || !chat.participants) return null;
    return chat.participants.find(
      (p) => p.id && user._id && p.id._id !== user._id
    )?.id;
  };

  // Format the last message time
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return messageTime.toLocaleDateString();
  };

  // Check if there are unread messages
  const hasUnreadMessages = (chat) => {
    if (!user || !chat.messages) return false;
    return chat.messages.some(
      (msg) => msg.sender !== user._id && !msg.readBy.includes(user._id)
    );
  };

  return (
    <div className="space-y-2">
      {chats.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No conversations yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const lastMessage = chat.messages?.[chat.messages.length - 1];
            const isUnread = hasUnreadMessages(chat);
            
            return (
              <div 
                key={chat._id} 
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  currentChat?._id === chat._id 
                    ? 'bg-blue-50 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50'
                } ${isUnread ? 'bg-blue-50' : ''}`}
                onClick={() => onSelectChat(chat)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {otherParticipant?.image ? (
                      <img 
                        src={otherParticipant.image} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {otherParticipant?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    {isUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {otherParticipant?.name || 'Unknown'}
                      </h4>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(lastMessage?.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-600 truncate flex-1">
                        {lastMessage?.content || 'No messages yet'}
                      </p>
                      {isUnread && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;