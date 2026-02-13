import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import ChatContainer from '../components/chat/ChatContainer';
import ChatList from '../components/chat/ChatList';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';

const Chat = () => {
  const { userData, companyData, backendUrl } = useContext(AppContext);
  const [contacts, setContacts] = useState([]);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // Determine if we're in recruiter dashboard
  const isRecruiterDashboard = location.pathname.includes('/dashboard/messages');
  const authEntity = isRecruiterDashboard ? companyData : userData;
  const userTypeParam = isRecruiterDashboard ? 'recruiter' : 'candidate';
  const userModel = isRecruiterDashboard ? 'Company' : 'User';

  // Helper to try multiple URLs for GET with 404 fallback
  const fetchWithFallback = async (urls) => {
    let lastError;
    for (const url of urls) {
      try {
        const res = await axios.get(url);
        return res;
      } catch (err) {
        lastError = err;
        if (err?.response?.status !== 404) throw err;
      }
    }
    throw lastError;
  };

  // Fetch existing chats for the current user/company and list of contacts
  useEffect(() => {
    const fetchChats = async () => {
      try {
        if (!authEntity?._id) return;
        setLoading(true);
        const chatsResponse = await fetchWithFallback([
          `${backendUrl}/api/chat/user/${authEntity._id}/${userTypeParam}`,
          `${backendUrl}/chat/user/${authEntity._id}/${userTypeParam}`
        ]);
        setChats(chatsResponse.data || []);
      } catch (error) {
        console.error('Error fetching chats:', error);
        toast.error('Failed to load chats');
      }
      try {
        const contactsUrls = isRecruiterDashboard
          ? [
              `${backendUrl}/api/chat/candidates`,
              `${backendUrl}/chat/candidates`
            ]
          : [
              `${backendUrl}/api/chat/recruiters`,
              `${backendUrl}/chat/recruiters`
            ];
        const contactsResponse = await fetchWithFallback(contactsUrls);
        setContacts(contactsResponse.data || []);
      } catch (error) {
        console.error('Error fetching contacts:', error);
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, [authEntity?._id, userTypeParam, backendUrl]);

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
  };

  const startNewChat = async (recipientId, recipientType) => {
    try {
      if (!authEntity?._id) return;
      const urls = [
        `${backendUrl}/api/chat`,
        `${backendUrl}/chat`
      ];
      let response;
      try {
        response = await axios.post(urls[0], {
          userId: authEntity._id,
          userType: userTypeParam,
          recipientId,
          recipientType
        });
      } catch (err) {
        if (err?.response?.status === 404) {
          response = await axios.post(urls[1], {
            userId: authEntity._id,
            userType: userTypeParam,
            recipientId,
            recipientType
          });
        } else {
          throw err;
        }
      }
      // Avoid duplicate chat entries if one already exists
      const newChat = response.data;
      const exists = chats.some((c) => c._id === newChat._id);
      const updated = exists ? chats.map((c) => (c._id === newChat._id ? newChat : c)) : [...chats, newChat];
      setChats(updated);
      setCurrentChat(newChat);
      toast.success('Chat started successfully');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Conversations</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <ChatList chats={chats} currentChat={currentChat} onSelectChat={handleSelectChat} user={authEntity} />
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-2">{isRecruiterDashboard ? 'All Applicants' : 'All Recruiters'}</h3>
                {contacts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No contacts available</p>
                ) : (
                  <ul className="space-y-2">
                    {contacts.map((c) => (
                      <li key={c._id} className="p-2 hover:bg-gray-50 rounded cursor-pointer flex items-center"
                          onClick={() => startNewChat(c._id, isRecruiterDashboard ? 'candidate' : 'recruiter')}>
                        <img src={c.image || 'https://via.placeholder.com/40'} alt={c.name} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                          <p className="font-medium">{c.name}</p>
                          <p className="text-sm text-gray-500">{c.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="w-full md:w-2/3 h-[600px]">
          <ChatContainer currentChat={currentChat} user={authEntity} userModel={userModel} />
        </div>
      </div>
    </div>
  );
};

export default Chat;