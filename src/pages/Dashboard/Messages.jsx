import { useState } from "react";
import { Search, Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";


export default function MessagingApp() {
  const [selectedContact, setSelectedContact] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const contacts = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "SJ",
      lastMessage: "See you tomorrow!",
      time: "2:30 PM",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Michael Chen",
      avatar: "MC",
      lastMessage: "Thanks for the help",
      time: "1:15 PM",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      avatar: "ER",
      lastMessage: "Did you get my email?",
      time: "Yesterday",
      unread: 1,
      online: false,
    },
    {
      id: 4,
      name: "David Kim",
      avatar: "DK",
      lastMessage: "Let's catch up soon",
      time: "Yesterday",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Lisa Anderson",
      avatar: "LA",
      lastMessage: "Perfect! 👍",
      time: "Monday",
      unread: 0,
      online: true,
    },
  ];

  const messages = {
    1: [
      { id: 1, text: "Hey! How are you?", sender: "them", time: "2:15 PM" },
      { id: 2, text: "I'm good! How about you?", sender: "me", time: "2:20 PM" },
      { id: 3, text: "Doing great! Want to meet up tomorrow?", sender: "them", time: "2:25 PM" },
      { id: 4, text: "Sure! What time works for you?", sender: "me", time: "2:28 PM" },
      { id: 5, text: "See you tomorrow!", sender: "them", time: "2:30 PM" },
    ],
    2: [
      { id: 1, text: "Can you help me with the project?", sender: "them", time: "1:00 PM" },
      { id: 2, text: "Of course! What do you need?", sender: "me", time: "1:05 PM" },
      { id: 3, text: "Thanks for the help", sender: "them", time: "1:15 PM" },
    ],
    3: [
      { id: 1, text: "Did you get my email?", sender: "them", time: "Yesterday" },
    ],
    4: [
      { id: 1, text: "Let's catch up soon", sender: "them", time: "Yesterday" },
    ],
    5: [
      { id: 1, text: "Perfect! 👍", sender: "them", time: "Monday" },
    ],
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput("");
    }
  };

  const handleBackToContacts = () => {
    setSelectedContact(null);
  };

  return (
    <div className="h-screen bg-gray-50 flex  ">

      {/* Sidebar - Contacts List */}
      <div
        className={`${
          selectedContact ? "hidden md:flex" : "flex"
        } w-full md:w-96 bg-white border-r flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold text-green-700 mb-4">Messages</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition border-b ${
                selectedContact?.id === contact.id ? "bg-green-50" : ""
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {contact.avatar}
                </div>
                {contact.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              {/* Contact Info */}
              <div className="flex-1 text-left">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-800">{contact.name}</p>
                  <span className="text-xs text-gray-500">{contact.time}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
              </div>

              {/* Unread Badge */}
              {contact.unread > 0 && (
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {contact.unread}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={`${
          selectedContact ? "flex" : "hidden md:flex"
        } flex-1 flex-col bg-gray-50`}
      >
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToContacts}
                  className="md:hidden text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {selectedContact.avatar}
                  </div>
                  {selectedContact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                
                <div>
                  <p className="font-semibold text-gray-800">{selectedContact.name}</p>
                  <p className="text-xs text-gray-500">
                    {selectedContact.online ? "Active now" : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full transition">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages[selectedContact.id]?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "me" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.sender === "me"
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "me" ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Select a conversation
              </h2>
              <p className="text-gray-500">
                Choose a contact to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}