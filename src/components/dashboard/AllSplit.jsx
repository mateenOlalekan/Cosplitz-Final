import { useMemo } from "react";
import { useSplits } from "../../services/queries/split";
import placeholderImage from "../../assets/onboard3.jpg";
import {TABS,CATEGORY_STYLES} from '../../Data/Alldata';
import SplitCard from '../../components/dashboard/SplitCard';
import { Loader } from "lucide-react";

/* Calculate time left from created_at */
const getTimeLeft = (createdAt) => {
  if (!createdAt) return "N/A";
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} left`;
  if (diffHours > 0) return `${diffHours}h left`;
  if (diffMins > 0) return `${diffMins} min left`;
  return "Just now";
};

/* Get category style based on category name */
const getCategoryStyle = (category) => {
  const categoryLower = category?.toLowerCase() || "";
  return (
    CATEGORY_STYLES[categoryLower] ||
    { ...CATEGORY_STYLES.default, badge: category || "Split" }
  );
};

/* Transform API split data to component format */
const transformSplit = (apiSplit) => {
  const categoryStyle = getCategoryStyle(apiSplit.category);
  const currentParticipants = apiSplit.current_participants || 0;
  const maxParticipants = apiSplit.max_participants || 0;
  const pricePerPerson =  maxParticipants > 0 ? Math.round(apiSplit.amount / maxParticipants)  : apiSplit.amount;
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
    timeLeft: getTimeLeft(apiSplit.created_at),
    location: apiSplit.location || "Unknown location",
    rawData: apiSplit, // Keep raw data for debugging
  };
};

/* Filter splits based on active tab */
const filterSplits = (splits, activeTab) => {
  if (activeTab === "All Active") return splits;
  if (activeTab === "Food") return splits.filter((s) => s.categoryName === "food");
  if (activeTab === "Rides") return splits.filter((s) => s.categoryName === "ride");
  if (activeTab === "Popular") return splits.filter((s) => s.hasParticipants);
  if (activeTab === "Tools") return splits.filter((s) => s.categoryName === "tools");
  if (activeTab === "Newest")
    return [...splits].sort((a, b) => new Date(b.rawData.created_at) - new Date(a.rawData.created_at) );
  return splits;
};



const LoadingState = () => (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <Loader
        className="h-12 w-12 text-green-500 animate-spin"
        strokeWidth={2.5}
      />

      <div className="flex items-center gap-1 text-green-600 font-medium">
        <span>Loading</span>
        <span className="animate-bounce">.</span>
        <span className="animate-bounce delay-150">.</span>
        <span className="animate-bounce delay-300">.</span>
      </div>
    </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center">
    <p className="mb-2">{error?.message || "Failed to load splits"}</p>
    <button  onClick={onRetry} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
      Try Again
    </button>
  </div>
);

const EmptyState = ({ activeTab }) => (
  <div className="text-center py-12">
    <p className="text-gray-500">
      {activeTab === "All Active"
        ? "No active splits found."
        : `No ${activeTab.toLowerCase()} splits found.`}
    </p>
    <p className="text-sm text-gray-400 mt-1">Check back later or create your own!</p>
  </div>
);

// ============ MAIN COMPONENT ============
function ActiveSplits({ activeTab, onTabChange }) {
  const {
    data: splitsData,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useSplits();

  // Transform and filter splits using useMemo for performance
  const filteredSplits = useMemo(() => {
    if (!splitsData) return [];
    const transformed = splitsData.map(transformSplit);
    return filterSplits(transformed, activeTab);
  }, [splitsData, activeTab]);

  // Handlers
  const handleTabClick = (tab) => {
    onTabChange?.(tab);
  };

  const handleRetry = () => {
    refetch();
  };
  return (
    <section className="space-y-4">
      {/* Header */}
      <h2 className="text-lg font-semibold text-gray-900">
        Active Nearby Splittz
        {isFetching && !isLoading && (
          <span className="ml-2 text-xs text-gray-400 font-normal">
            (refreshing...)
          </span>
        )}
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button key={tab}  onClick={() => handleTabClick(tab)}   disabled={isLoading}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab? "bg-green-600 text-white": "bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50" }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content States */}
      {isLoading && <LoadingState />}

      {error && !isLoading && <ErrorState error={error} onRetry={handleRetry} />}

      {!isLoading && !error && filteredSplits.length === 0 && (
        <EmptyState activeTab={activeTab} />
      )}

      {!isLoading && !error && filteredSplits.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSplits.map((split) => (
            <SplitCard key={split.id} split={split} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ActiveSplits;