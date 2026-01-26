// src/components/Splits/ActiveSplits.jsx
import { useMemo } from "react";
import { Heart, Share2, Users, Clock, MapPin } from "lucide-react";
import { useSplits } from "../../services/queries/split";
import { useNavigate } from "react-router-dom";
import placeholderImage from "../../assets/onboard3.jpg";

const TABS = ["All Active", "Popular", "Newest", "Food", "Rides", "Tools"];

const CATEGORY_STYLES = {
  food: { name: "food", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Food" },
  groceries: { name: "food", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Food" },
  "food & groceries": { name: "food", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Food" },
  transport: { name: "ride", textColor: "#FB9851", bgClass: "bg-[rgba(251,152,81,0.16)]", badge: "Ride" },
  transportation: { name: "ride", textColor: "#FB9851", bgClass: "bg-[rgba(251,152,81,0.16)]", badge: "Ride" },
  ride: { name: "ride", textColor: "#FB9851", bgClass: "bg-[rgba(251,152,81,0.16)]", badge: "Ride" },
  event: { name: "event", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Event" },
  "events & tickets": { name: "event", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Event" },
  ticket: { name: "event", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Event" },
  tools: { name: "tools", textColor: "#8B5CF6", bgClass: "bg-[rgba(139,92,246,0.16)]", badge: "Tools" },
  housing: { name: "housing", textColor: "#1F8225", bgClass: "bg-[rgba(31,130,37,0.16)]", badge: "Housing" },
  utilities: { name: "utilities", textColor: "#8B5CF6", bgClass: "bg-[rgba(139,92,246,0.16)]", badge: "Utilities" },
  entertainment: { name: "entertainment", textColor: "#FB9851", bgClass: "bg-[rgba(251,152,81,0.16)]", badge: "Fun" },
  default: { name: "other", textColor: "#65CADF", bgClass: "bg-[rgba(101,202,223,0.16)]", badge: "Split" },
};

const getTimeLeft = (endDate) => {
  if (!endDate) return "N/A";
  const now = new Date();
  const end = new Date(endDate);
  const diffMs = end - now;
  if (diffMs <= 0) return "Expired";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
  if (diffHours > 0) return `${diffHours}h left`;
  return "Ending soon";
};

const getCategoryStyle = (category) => {
  const categoryLower = (category || "").toLowerCase();
  return CATEGORY_STYLES[categoryLower] || { ...CATEGORY_STYLES.default, badge: category || "Split" };
};

const transformSplit = (apiSplit) => {
  const categoryStyle = getCategoryStyle(apiSplit.category);
  const currentParticipants = apiSplit.current_participants || 0;
  const maxParticipants = apiSplit.max_participants || 1;
  const pricePerPerson = maxParticipants > 0
    ? Math.round(parseFloat(apiSplit.amount) / maxParticipants)
    : parseFloat(apiSplit.amount) || 0;

  return {
    id: apiSplit.id,
    title: apiSplit.title || "Untitled Split",
    image: apiSplit.image_url || placeholderImage,
    badge: categoryStyle.badge,
    categoryName: categoryStyle.name,
    textColor: categoryStyle.textColor,
    bgClass: categoryStyle.bgClass,
    price: `₦${pricePerPerson.toLocaleString()}`,
    participants: `${currentParticipants}/${maxParticipants}`,
    hasParticipants: currentParticipants > 0,
    timeLeft: getTimeLeft(apiSplit.end_date),
    location: apiSplit.location || "Unknown location",
    rawData: apiSplit,
  };
};

const filterSplits = (splits, activeTab) => {
  if (activeTab === "All Active") return splits;
  if (activeTab === "Food") return splits.filter((s) => s.categoryName === "food");
  if (activeTab === "Rides") return splits.filter((s) => s.categoryName === "ride");
  if (activeTab === "Popular") return splits.filter((s) => s.hasParticipants);
  if (activeTab === "Tools") return splits.filter((s) => s.categoryName === "tools");
  if (activeTab === "Newest")
    return [...splits].sort((a, b) => new Date(b.rawData.created_at) - new Date(a.rawData.created_at));
  return splits;
};

const SplitCard = ({ split }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/dashboard/splitz-details/${split.id}`);
  };

  const handleJoinClick = (e) => {
    e.stopPropagation();
    navigate(`/dashboard/splitz-details/${split.id}`);
  };

  return (
    <div onClick={handleCardClick} className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100 cursor-pointer">
      <div className="relative">
        <img src={split.image} alt={split.title} loading="lazy" className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3" onError={(e) => { e.target.src = placeholderImage; }} />
        <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">{split.badge}</span>
        <div className="absolute top-2 right-2 flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); }} className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all">
            <Heart size={16} className="text-white hover:text-red-500" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); }} className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all">
            <Share2 size={16} className="text-white hover:text-green-600" />
          </button>
        </div>
      </div>

      <div className="space-y-1 p-1.5">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1">{split.title}</h3>
          <span className={`${split.bgClass} text-xs px-2 py-1 rounded-full whitespace-nowrap`} style={{ color: split.textColor }}>{split.categoryName}</span>
        </div>
        <p className="text-xs"><span className="text-[#1F8225] font-bold">{split.price}</span>/person</p>
        <div className="flex items-center justify-between text-xs text-gray-600 pt-2">
          <span className="flex items-center gap-1"><Users size={12} /> {split.participants}</span>
          <span className="flex items-center text-[#E60000] gap-1"><Clock size={12} /> {split.timeLeft}</span>
          <span className="flex items-center gap-1"><MapPin size={12} className="text-[#1F8225]" /><span className="truncate max-w-[80px]">{split.location}</span></span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-green-600 font-semibold">{split.price}</span>
          <button onClick={handleJoinClick} className="px-3 py-1.5 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">Join Splitz</button>
        </div>
      </div>
    </div>
  );
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
      <p className="mt-4 text-gray-600">Loading splits...</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
    <p className="mb-2">{error?.message || "Failed to load splits"}</p>
    <button onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">Try Again</button>
  </div>
);

const EmptyState = ({ activeTab }) => (
  <div className="text-center py-12">
    <p className="text-gray-500">{activeTab === "All Active" ? "No active splits found." : `No ${activeTab.toLowerCase()} splits found.`}</p>
    <p className="text-sm text-gray-400 mt-1">Check back later or create your own!</p>
  </div>
);

function ActiveSplits({ activeTab, onTabChange }) {
  const { data: splitsData, isLoading, error, refetch, isFetching } = useSplits();

  const filteredSplits = useMemo(() => {
    if (!splitsData) return [];
    const transformed = splitsData.map(transformSplit);
    return filterSplits(transformed, activeTab);
  }, [splitsData, activeTab]);

  const handleTabClick = (tab) => onTabChange?.(tab);
  const handleRetry = () => refetch();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Active Nearby Splittz
        {isFetching && !isLoading && <span className="ml-2 text-xs text-gray-400 font-normal">(refreshing...)</span>}
      </h2>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            disabled={isLoading}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && <LoadingState />}
      {error && !isLoading && <ErrorState error={error} onRetry={handleRetry} />}
      {!isLoading && !error && filteredSplits.length === 0 && <EmptyState activeTab={activeTab} />}
      {!isLoading && !error && filteredSplits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSplits.map((split) => <SplitCard key={split.id} split={split} />)}
        </div>
      )}
    </section>
  );
}

export default ActiveSplits;