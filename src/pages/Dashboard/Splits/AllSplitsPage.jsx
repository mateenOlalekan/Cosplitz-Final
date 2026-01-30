import { useState } from "react";
import { Search, Filter, Users, X, Sliders } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as splits from "../../../services/queries/split";
import { 
  formatPrice, 
  getBadgeStyle, 
  getBadgeText, 
  getDistanceDisplay, 
  getTimeLeft, 
  parsePrice,
  filterSplits 
} from "../../../utils/splitsUtils";
import { Heart, Share2, Clock, MapPin } from "lucide-react";

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Food & Groceries", label: "Food & Groceries" },
  { value: "Transportation", label: "Transportation" },
  { value: "Events & Tickets", label: "Events & Tickets" },
  { value: "Utilities", label: "Utilities" },
  { value: "Entertainment", label: "Entertainment" },
  { value: "Housing", label: "Housing" },
];

const distanceOptions = [
  { value: "All", label: "All Distances" },
  { value: "5km", label: "Within 5km" },
  { value: "10km", label: "Within 10km" },
  { value: "25km", label: "Within 25km" },
  { value: "50km", label: "Within 50km" },
];

function AllSplitsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: "all",
    distance: "All",
    priceRange: [0, 50000],
    searchQuery: "",
  });

  const { data: splitsData = [], isLoading } = splits.useSplits();

  const handleJoinSplit = (splitId, e) => {
    e.stopPropagation();
    const split = splitsData.find(s => s.id === splitId);
    if (split) {
      navigate(`/dashboard/splitz-details/${splitId}`);
    }
  };

  const handlePriceChange = (index, value) => {
    const newValue = [...filters.priceRange];
    newValue[index] = parseInt(value) || 0;

    if (index === 0 && newValue[0] > newValue[1]) newValue[1] = newValue[0];
    if (index === 1 && newValue[1] < newValue[0]) newValue[0] = newValue[1];

    setFilters((prev) => ({ ...prev, priceRange: newValue }));
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  };

  const clearFilters = () => {
    setFilters({
      category: "all",
      distance: "All",
      priceRange: [0, 50000],
      searchQuery: "",
    });
    setSearchQuery("");
  };

  const filteredSplits = filterSplits(splitsData, filters);

  const activeFilterCount = 
    (filters.category !== "all" ? 1 : 0) +
    (filters.distance !== "All" ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000 ? 1 : 0);

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
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>
        <button 
          className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 relative"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Sliders size={20} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance
              </label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({ ...filters, distance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {distanceOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Min</label>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(0, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      min="0"
                      max={filters.priceRange[1]}
                    />
                  </div>
                  <span className="text-gray-400 mt-5">-</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-600 mb-1 block">Max</label>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(1, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                      min={filters.priceRange[0]}
                      max="100000"
                    />
                  </div>
                </div>
                
                {/* Price Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceChange(0, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceChange(1, e.target.value)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatPrice(filters.priceRange[0])}</span>
                  <span>{formatPrice(filters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.category !== "all" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {categories.find(c => c.value === filters.category)?.label}
              <button
                onClick={() => setFilters({ ...filters, category: "all" })}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.distance !== "All" && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {distanceOptions.find(d => d.value === filters.distance)?.label}
              <button
                onClick={() => setFilters({ ...filters, distance: "All" })}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {(filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000) && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
              <button
                onClick={() => setFilters({ ...filters, priceRange: [0, 50000] })}
                className="hover:text-green-900"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Active Splits Section */}
      <section>
        <div className="flex justify-between items-center my-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {filteredSplits.length} Active Split{filteredSplits.length !== 1 ? 's' : ''}
          </h2>
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
                  className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/dashboard/splitz-details/${split.id}`)}
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
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Heart
                          size={16}
                          className="text-white hover:text-red-500"
                        />
                      </button>
                      <button
                        className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
                        aria-label="Share"
                        onClick={(e) => e.stopPropagation()}
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
                No Splits Found
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || activeFilterCount > 0
                  ? "No splits match your filters. Try adjusting your search."
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