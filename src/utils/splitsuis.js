import { useNavigate } from "react-router-dom";

export const getBadgeText = (category) => {
  switch (category) {
    case "Food & Groceries":
      return "Groceries";
    case "Transportation":
      return "Ride";
    case "Events & Tickets":
      return "Event";
    case "Utilities":
      return "Utilities";
    case "Entertainment":
      return "Entertainment";
    case "Housing":
      return "Housing";
    default:
      return "Other";
  }
};

// Get badge style based on category
export const getBadgeStyle = (category) => {
  switch (category) {
    case "Food & Groceries":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    case "Transportation":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    case "Events & Tickets":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    case "Utilities":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    case "Entertainment":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    case "Housing":
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
    default:
      return { backgroundColor: "#E5F7E7", color: "#1F8225" };
  }
};

export const tabFilters = [
  "All Active",
  "Popular",
  "Newest",
  "Food",
  "Rides",
  "Tools",
];

export const parsePrice = (price) => {
  if (!price) return 0;
  return parseFloat(price) || 0;
};

//Filter splits based on criteria
export  const filteredSplits = allSplits.filter((split) => {
    if (filters.category !== "all") {
      if (filters.category === "groceries") {
        if (split.category !== "Food & Groceries") return false;
      } else if (split.category !== filters.category) {
        return false;
      }
    }

    const splitPrice = parsePrice(split.amount);
    if (
      splitPrice < filters.priceRange[0] ||
      splitPrice > filters.priceRange[1]
    ) {
      return false;
    }

    if (filters.distance !== "All") {
      const maxDistance = parseFloat(filters.distance.replace("km", "")) || 0;
      const splitDistance = split.visibility_radius || 0;
      if (splitDistance > maxDistance) {
        return false;
      }
    }

    if (filters.searchQuery) {
      const searchLower = filters.searchQuery.toLowerCase();
      const splitTitle = (split.title || "").toLowerCase();
      const splitCategory = (split.category || "").toLowerCase();
      const splitLocation = (split.location || "").toLowerCase();
      const splitDescription = (split.description || "").toLowerCase();

      return (
        splitTitle.includes(searchLower) ||
        splitCategory.includes(searchLower) ||
        splitLocation.includes(searchLower) ||
        splitDescription.includes(searchLower)
      );
    }

    return true;
  });

// Handle price range change

export const handlePriceChange = (index, value) => {
  const newValue = [...priceSliderValue];
  newValue[index] = parseInt(value) || 0;

  if (index === 0 && newValue[0] > newValue[1]) newValue[1] = newValue[0];
  if (index === 1 && newValue[1] < newValue[0]) newValue[0] = newValue[1];

  setPriceSliderValue(newValue);
  setFilters((prev) => ({ ...prev, priceRange: newValue }));
};

// Format price
export const formatPrice = (price) => {
  return `₦${parseFloat(price || 0).toLocaleString()}`;
};

// Get status color
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get category color
export const getCategoryColor = (category) => {
  switch (category) {
    case "Food & Groceries":
      return "bg-red-100 text-red-800";
    case "Transportation":
      return "bg-blue-100 text-blue-800";
    case "Events & Tickets":
      return "bg-purple-100 text-purple-800";
    case "Utilities":
      return "bg-yellow-100 text-yellow-800";
    case "Entertainment":
      return "bg-pink-100 text-pink-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Handle join split
export const handleJoinSplit = async (splitId, e) => {
  e.stopPropagation();
  const navigate = useNavigate();
  try {
    // await joinSplit(splitId);
    navigate(`/dashboard/splitz-details/${splitId}`);
  } catch (error) {
    console.error("Failed to join split:", error);
  }
};

// Categories for dashboard

// Calculate time left until end date
export const getTimeLeft = (endDate) => {
  if (!endDate) return "No deadline";
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return "Ended";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Get distance display
export const getDistanceDisplay = (radius) => {
  if (!radius || radius === 0) return "0 km";
  return `${radius} km`;
};
