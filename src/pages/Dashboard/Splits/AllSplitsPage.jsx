// src/pages/Dashboard/Splits/AllSplitsPage.jsx
import { useState } from "react";
import { Search, Filter, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as splits from "../../../services/queries/split";
import { 
  formatPrice, 
  getBadgeStyle, 
  getBadgeText, 
  getDistanceDisplay, 
  getTimeLeft, 
  parsePrice 
} from "../../../utils/splitsUtils";
import { Heart, Share2, Clock, MapPin } from "lucide-react";

const tabFilters = ["All Active", "Near You", "Ending Soon", "Most Popular"];

function AllSplitsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Active");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: splitsData = [], isLoading } = splits.useSplits();

  const handleJoinSplit = (splitId, e) => {
    e.stopPropagation();
    const split = splitsData.find(s => s.id === splitId);
    if (split) {
      navigate(`/dashboard/splitz-details/${splitId}`);
    }
  };

  const filteredSplits = splitsData.filter(split => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      split.title?.toLowerCase().includes(query) ||
      split.category?.toLowerCase().includes(query) ||
      split.location?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-4 md:p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Splits</h1>
        <p className="text-gray-600">Browse and join splits near you</p>
      </header>

      {/* Search Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search splits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter size={20} />
          <span className="hidden sm:inline">Filter</span>
        </button>
      </div>

      {/* Tab Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabFilters.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Splits Section */}
      <section>
        <div className="flex justify-between items-center my-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Nearby Splits
          </h2>
          <button className="text-green-600 text-sm font-medium hover:text-green-700">
            View All
          </button>
        </div>

        {/* Splits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))
          ) : filteredSplits.length > 0 ? (
            filteredSplits.map((split) => {
              const participants = split.participants?.length || 0;
              const maxParticipants = split.max_participants || 1;
              const pricePerPerson = parsePrice(split.amount) / maxParticipants;
              const badgeText = getBadgeText(split.category);
              const badgeStyle = getBadgeStyle(split.category);
              const timeLeft = getTimeLeft(split.end_date);
              const distance = getDistanceDisplay(split.visibility_radius);

              return (
                <div
                  key={split.id}
                  className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100"
                >
                  {/* Image Section */}
                  <div className="relative">
                    <img
                      src={
                        split.image ||
                        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
                      }
                      alt={split.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />

                    {/* Badge */}
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                      {badgeText}
                    </span>

                    {/* Action Buttons */}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
                        aria-label="Add to favorites"
                      >
                        <Heart
                          size={16}
                          className="text-white hover:text-red-500"
                        />
                      </button>
                      <button
                        className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
                        aria-label="Share"
                      >
                        <Share2
                          size={16}
                          className="text-white hover:text-green-600"
                        />
                      </button>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="space-y-2 p-3">
                    {/* Title and Status */}
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
                        {split.title}
                      </h3>
                      <span
                        className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
                        style={badgeStyle}
                      >
                        {badgeText}
                      </span>
                    </div>

                    {/* Price per person */}
                    <p className="text-sm text-gray-600">
                      <span className="text-[#1F8225] font-bold text-base">
                        {formatPrice(pricePerPerson)}
                      </span>
                      /person
                    </p>

                    {/* Details */}
                    <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1">
                        <Users size={12} />
                        <span>{participants}/{maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#E60000]">
                        <Clock size={12} />
                        <span>{timeLeft}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-[#1F8225]" />
                        <span>{distance}</span>
                      </div>
                    </div>

                    {/* CTA Section */}
                    <div className="flex items-center justify-between pt-3">
                      <div>
                        <span className="text-green-600 font-semibold text-lg">
                          {formatPrice(split.amount)}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          total
                        </span>
                      </div>
                      <button
                        className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => handleJoinSplit(split.id, e)}
                        disabled={participants >= maxParticipants}
                      >
                        {participants >= maxParticipants
                          ? "Full"
                          : "Join Split"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Empty state
            <div className="col-span-full text-center py-10">
              <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
                <Users size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Active Splits Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? "No splits match your search."
                  : "There are currently no active splits in your area."}
              </p>
              <button
                className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                onClick={() => navigate("/dashboard/create-splitz")}
              >
                Create a Split
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default AllSplitsPage;