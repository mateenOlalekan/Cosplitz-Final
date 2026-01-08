import React, { useState } from "react";
import { Search, CircleX, Filter } from "lucide-react";
import Avatar from "../../assets/Avatar.svg";
import SelectedHeader from "../../components/Headers/Location";

export default function CosplitzNotifications() {
  const [activeTab, setActiveTab] = useState("all");

  const [notifications] = useState([
    { id: 1, type: "join", message: "Sarah Kelvin joined your Shared Taxi to Campus splittz", date: "10/16/2025", time: "10:00pm", status: null },
    { id: 2, type: "join", message: "You successfully joined The Concert Ticket Group splittz", date: "10/16/2025", time: "10:00pm", status: null },
    { id: 3, type: "payment", message: "Payment successful", amount: "₦2,000", date: "10/16/2025", time: "10:00pm", status: "successful" },
    { id: 4, type: "payment", message: "Payment failed", date: "10/16/2025", time: "10:00pm", status: "failed" },
    { id: 5, type: "join", message: "Sarah Kelvin joined your Shared Taxi to Campus splittz", date: "10/16/2025", time: "10:00pm", status: null },
    { id: 6, type: "join", message: "You successfully joined The Concert Ticket Group splittz", date: "10/16/2025", time: "10:00pm", status: null },
    { id: 7, type: "payment", message: "Payment successful", amount: "₦2,000", date: "10/16/2025", time: "10:00pm", status: "successful" },
    { id: 8, type: "payment", message: "Payment failed", date: "10/16/2025", time: "10:00pm", status: "failed" },
  ]);

  const tabs = [
    { id: "all", label: "All", count: 60 },
    { id: "unread", label: "Unread", count: 0 },
    { id: "read", label: "Read", count: 0 },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 overflow-hidden">
      <div className="flex-1 overflow-y-auto">

        {/* Container */}
        <div className="max-w-screen-xl mx-auto w-full">

          {/* ───── Top Bar ───── */}
          <div className="flex justify-between items-center bg-white shadow-sm px-6 py-4 mb-4">
            <CircleX size={24} className="cursor-pointer" />
            <span className="font-semibold text-lg sm:text-xl">Notifications</span>
            <div className="w-6" />
          </div>

          {/* Inner Content */}
          <div className="px-4 sm:px-6">

            {/* ───── Page Header + Search ───── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Notifications
              </h1>

              <div className="flex items-stretch sm:items-center gap-3 w-full sm:w-auto">

                {/* Search Box */}
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-2 flex-1 sm:flex-none focus-within:ring-2 focus-within:ring-green-500">
                  <Search size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="flex-1 outline-none text-base"
                  />
                </div>

                {/* Filter Icon */}
                <Filter
                  size={40}
                  className="cursor-pointer border border-gray-200 rounded-lg p-2 bg-white"
                />
              </div>
            </div>

            {/* ───── Tabs ───── */}
            <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 transition-all
                    ${
                      activeTab === tab.id
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-600 hover:text-gray-800"
                    }
                  `}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ───── Notification List ───── */}
            <div className="space-y-3 pb-6">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-[#ECE9F1] border border-gray-200 px-4 py-3 rounded-lg cursor-pointer hover:shadow transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    {/* Left Section (Avatar + Message) */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <img
                        src={Avatar}
                        alt="Avatar"
                        className="w-11 h-11 rounded-full flex-shrink-0"
                      />
                      <p className="text-gray-800 text-base font-medium leading-snug break-words">
                        {notif.message}
                        {notif.amount && (
                          <span className="font-semibold"> {notif.amount}</span>
                        )}
                      </p>
                    </div>

                    {/* Right Section (Status + Time) */}
                    <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 text-right">

                      {notif.status && (
                        <span
                          className={`px-2 py-1 rounded-full font-medium ${
                            notif.status === "successful"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {notif.status}
                        </span>
                      )}

                      <div>
                        <div>{notif.date}</div>
                        <div>{notif.time}</div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
