// Category and Badge Utilities
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

export const getBadgeStyle = (category) => {
  const colors = {
    'Housing': { backgroundColor: '#4F46E5', color: 'white' },
    'Food': { backgroundColor: '#10B981', color: 'white' },
    'Transportation': { backgroundColor: '#F59E0B', color: 'white' },
    'Events': { backgroundColor: '#EF4444', color: 'white' },
    'Utilities': { backgroundColor: '#8B5CF6', color: 'white' },
    'Entertainment': { backgroundColor: '#EC4899', color: 'white' },
    'Other': { backgroundColor: '#6B7280', color: 'white' },
  };
  
  const key = category?.split(' ')[0] || 'Other';
  return colors[key] || colors.Other;
};

export const getCategoryColor = (category) => {
  switch (category) {
    case "Food & Groceries":
      return "bg-green-500 text-white";
    case "Transportation":
      return "bg-green-500 text-white";
    case "Events & Tickets":
      return "bg-green-500 text-white";
    case "Utilities":
      return "bg-green-500 text-white";
    case "Entertainment":
      return "bg-green-500 text-white";
    default:
      return "bg-green-500 text-gray-800";
  }
};

// Price Utilities
export const parsePrice = (price) => {
  if (!price) return 0;
  return parseFloat(price) || 0;
};

export const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(num);
};

// Status Utilities
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
      return "bg-green-500 text-white";
    case "pending":
      return "bg-green-500 text-white";
    case "completed":
      return "bg-green-500 text-white";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Time and Distance Utilities
export const getTimeLeft = (endDate) => {
  if (!endDate) return 'No deadline';
  
  const end = new Date(endDate);
  const now = new Date();
  const diffMs = end - now;
  
  if (diffMs <= 0) return 'Expigreen';
  
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
  if (diffHours > 0) return `${diffHours}h`;
  
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffMinutes}m`;
};

export const getDistanceDisplay = (radius) => {
  if (!radius || radius === 0) return 'Anywhere';
  return `${radius} km`;
};

// Filter Function
export const filterSplits = (allSplits, filters) => {
  return allSplits.filter((split) => {
    // Category filter
    if (filters.category && filters.category !== "all") {
      if (filters.category === "groceries") {
        if (split.category !== "Food & Groceries") return false;
      } else if (split.category !== filters.category) {
        return false;
      }
    }

    // Price range filter
    const splitPrice = parsePrice(split.amount);
    if (
      splitPrice < filters.priceRange[0] ||
      splitPrice > filters.priceRange[1]
    ) {
      return false;
    }

    // Distance filter
    if (filters.distance && filters.distance !== "All") {
      const maxDistance = parseFloat(filters.distance.replace("km", "")) || 0;
      const splitDistance = split.visibility_radius || 0;
      if (splitDistance > maxDistance) {
        return false;
      }
    }

    // Search query filter
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
};