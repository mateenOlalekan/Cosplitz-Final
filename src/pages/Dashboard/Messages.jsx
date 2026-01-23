import { useState, useEffect, useRef } from "react";
import { Search, Send, ArrowLeft, MoreVertical, Phone, Video, Smile, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagingApp() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState({});
  const messagesEndRef = useRef(null);

  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "See you tomorrow! 🎉",
      time: "2:30 PM",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      lastMessage: "Thanks for the help with the project",
      time: "1:15 PM",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "Did you get my email about the meeting?",
      time: "Yesterday",
      unread: 1,
      online: false,
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "DK",
      lastMessage: "Let's catch up soon, it's been a while",
      time: "Yesterday",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      avatar: "LA",
      lastMessage: "Perfect! That works for me 👍",
      time: "Monday",
      unread: 0,
      online: true,
    },
  ];

  // Initialize messages state
  useEffect(() => {
    const initialMessages = {
      1: [
        { id: 1, text: "Hey! How are you doing today?", sender: "them", time: "2:15 PM", timestamp: new Date() },
        { id: 2, text: "I'm great! Just working on some new features. How about you?", sender: "me", time: "2:20 PM", timestamp: new Date() },
        { id: 3, text: "Doing amazing! Want to grab coffee tomorrow morning?", sender: "them", time: "2:25 PM", timestamp: new Date() },
        { id: 4, text: "Absolutely! How about 10 AM at our usual spot?", sender: "me", time: "2:28 PM", timestamp: new Date() },
        { id: 5, text: "Sounds perfect! See you tomorrow! 🎉", sender: "them", time: "2:30 PM", timestamp: new Date() },
      ],
      2: [
        { id: 1, text: "Hi! Can you help me with the React project?", sender: "them", time: "1:00 PM", timestamp: new Date() },
        { id: 2, text: "Of course! What specific part are you stuck on?", sender: "me", time: "1:05 PM", timestamp: new Date() },
        { id: 3, text: "Thanks for the help! Really appreciate it.", sender: "them", time: "1:15 PM", timestamp: new Date() },
      ],
      3: [
        { id: 1, text: "Did you get my email about the meeting updates?", sender: "them", time: "Yesterday", timestamp: new Date() },
      ],
      4: [
        { id: 1, text: "Let's catch up soon, it's been too long!", sender: "them", time: "Yesterday", timestamp: new Date() },
      ],
      5: [
        { id: 1, text: "Perfect! That schedule works for me. Let's do it! 👍", sender: "them", time: "Monday", timestamp: new Date() },
      ],
    };
    setMessages(initialMessages);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (selectedContact) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedContact]);

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedContact) {
      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(),
      };
      
      setMessages(prev => ({
        ...prev,
        [selectedContact.id]: [...(prev[selectedContact.id] || []), newMessage]
      }));
      
      setMessageInput("");
      
      // Update last message in contact list
      const contactIndex = contacts.findIndex(c => c.id === selectedContact.id);
      if (contactIndex !== -1) {
        contacts[contactIndex].lastMessage = messageInput;
        contacts[contactIndex].time = "Just now";
        contacts[contactIndex].unread = 0;
      }
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const msgDate = new Date(timestamp);
    const diffTime = Math.abs(now - msgDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return msgDate.toLocaleDateString();
    }
  };

  return (
    <div className="h-full bg-gray-50 flex">

      {/* Sidebar - Contacts List */}
      <div
        className={`${selectedContact ? "hidden md:flex" : "flex"} w-full md:w-96 bg-white border-r border-gray-200 flex-col`}
      >
        {/* Header */}
        <div className="px-6 py-2 border-b border-gray-200 flex-shrink-0">
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-2"
          >
            Messages
          </motion.h1>
          
          {/* Search Bar */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors group-focus-within:text-green-600" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto py-2">
          <AnimatePresence>
            {filteredContacts.map((contact, index) => (
              <motion.button
                key={contact.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.01, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-all border-b border-gray-100 last:border-b-0 ${
                  selectedContact?.id === contact.id ? "bg-green-50 border-l-4 border-l-green-600" : ""
                }`}
              >
                {/* Avatar with online indicator */}
                <div className="relative flex-shrink-0">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
                  >
                    {contact.avatar}
                  </motion.div>
                  {contact.online && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"
                    ></motion.span>
                  )}
                </div>

                {/* Contact Info */}
                <div className="flex-1 text-left min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-semibold text-gray-800 truncate">{contact.name}</p>
                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{contact.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                </div>

                {/* Unread Badge */}
                <AnimatePresence>
                  {contact.unread > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-6 h-6 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md"
                    >
                      {contact.unread}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${selectedContact ? "flex" : "hidden md:flex"} flex-1 flex-col bg-gray-50`}
      >
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-b border-gray-200 p-4 flex items-center justify-between flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedContact(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button>
                
                <div className="relative">
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div>
                  <p className="font-semibold text-gray-800">{selectedContact.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedContact.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Phone className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Video className="w-5 h-5 text-gray-600" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </motion.button>
              </div>
            </motion.div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages[selectedContact.id]?.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                        message.sender === "me"
                          ? "bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-lg"
                          : "bg-white text-gray-800 rounded-bl-lg border border-gray-200"
                      }`}
                    >
                      <p className="leading-relaxed">{message.text}</p>
                      <p
                        className={`text-xs mt-1.5 font-medium ${
                          message.sender === "me" ? "text-green-100" : "text-gray-500"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-t border-gray-200 p-4 flex-shrink-0"
            >
              <div className="flex items-center gap-3">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </motion.button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-5 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white text-gray-800"
                />
                
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: "#15803d" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className={`bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-full transition-all flex-shrink-0 ${
                    !messageInput.trim() ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
                  }`}
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-8"
            >
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-24 h-24 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
              >
                <Send className="w-12 h-12 text-green-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">Select a conversation</h2>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                Choose a contact from the list to start messaging and sharing expenses
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}