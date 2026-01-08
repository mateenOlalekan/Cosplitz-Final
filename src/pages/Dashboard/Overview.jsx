// import { useState, useEffect } from "react";
// import { Heart, Share2, Users, Clock, MapPin, Bell, Settings, Search, ListFilter } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import Overlay1 from "../../assets/Overlay.svg";
// import Overlay2 from "../../assets/Overlay1.svg";
// import Overlay3 from "../../assets/Overlay2.svg";
// import Overlay4 from "../../assets/Overlay3.svg";
// import useSplitStore from "../../store/splitStore";
// import useAuthStore from "../../store/authStore";
// import DashOverview from "../../components/Headers/Overview";

// function Overview() {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("All Active");
//   const [hidden, setHidden] = useState(false);
//   const [filters, setFilters] = useState({
//     category: 'all',
//     priceRange: [0, 100000],
//     distance: 'All',
//     searchQuery: ''
//   });
//   const [priceSliderValue, setPriceSliderValue] = useState([0, 100000]);
//   const [maxPrice, setMaxPrice] = useState(100000);
//   const [showDeals, setShowDeals] = useState(true);
//   const [isSearchFocused, setIsSearchFocused] = useState(false);
  
//   // Use real data from splitStore
//   const { allSplits, fetchAllSplits, joinSplit, isLoading } = useSplitStore();
//   const user = useAuthStore(state => state.user);

//   const hideComponent = () => {
//     setHidden((prev) => !prev);
//   };

//   // Fetch splits on component mount
//   useEffect(() => {
//     fetchAllSplits();
//   }, []);

//   // Update max price based on fetched splits
//   useEffect(() => {
//     if (allSplits.length > 0) {
//       const prices = allSplits.map(split => {
//         const price = parseFloat(split.amount) || 0;
//         return isNaN(price) ? 0 : price;
//       });
//       const maxTaskPrice = Math.max(...prices);
//       const roundedMax = Math.ceil(maxTaskPrice / 10000) * 10000 || 100000;
//       setMaxPrice(roundedMax);
//       setPriceSliderValue([0, roundedMax]);
//       setFilters(prev => ({
//         ...prev,
//         priceRange: [0, roundedMax]
//       }));
//     }
//   }, [allSplits]);

//   // Filter categories
//   const filterCategories = [
//     'All',
//     'Ride',
//     'Groceries',
//     'Food',
//     'Utilities',
//     'Entertainment',
//     'Other'
//   ];

//   const distances = ['All', '1km', '2km', '3km', '5km', '7km', '10km'];

//   const parsePrice = (price) => {
//     if (!price) return 0;
//     return parseFloat(price) || 0;
//   };

//   // Filter splits based on criteria
//   const filteredSplits = allSplits.filter(split => {
//     if (filters.category !== 'all') {
//       if (filters.category === 'groceries') {
//         if (split.category !== 'Food & Groceries') return false;
//       } else if (split.category !== filters.category) {
//         return false;
//       }
//     }

//     const splitPrice = parsePrice(split.amount);
//     if (splitPrice < filters.priceRange[0] || splitPrice > filters.priceRange[1]) {
//       return false;
//     }

//     if (filters.distance !== 'All') {
//       const maxDistance = parseFloat(filters.distance.replace('km', '')) || 0;
//       const splitDistance = split.visibility_radius || 0;
//       if (splitDistance > maxDistance) {
//         return false;
//       }
//     }

//     if (filters.searchQuery) {
//       const searchLower = filters.searchQuery.toLowerCase();
//       const splitTitle = (split.title || '').toLowerCase();
//       const splitCategory = (split.category || '').toLowerCase();
//       const splitLocation = (split.location || '').toLowerCase();
//       const splitDescription = (split.description || '').toLowerCase();
      
//       return (
//         splitTitle.includes(searchLower) ||
//         splitCategory.includes(searchLower) ||
//         splitLocation.includes(searchLower) ||
//         splitDescription.includes(searchLower)
//       );
//     }

//     return true;
//   });

//   // Handle price range change
//   const handlePriceChange = (index, value) => {
//     const newValue = [...priceSliderValue];
//     newValue[index] = parseInt(value) || 0;
    
//     if (index === 0 && newValue[0] > newValue[1]) newValue[1] = newValue[0];
//     if (index === 1 && newValue[1] < newValue[0]) newValue[0] = newValue[1];
    
//     setPriceSliderValue(newValue);
//     setFilters(prev => ({ ...prev, priceRange: newValue }));
//   };

//   // Format price
//   const formatPrice = (price) => {
//     return `₦${parseFloat(price || 0).toLocaleString()}`;
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'active': return 'bg-green-100 text-green-800';
//       case 'pending': return 'bg-yellow-100 text-yellow-800';
//       case 'completed': return 'bg-blue-100 text-blue-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Get category color
//   const getCategoryColor = (category) => {
//     switch (category) {
//       case 'Food & Groceries': return 'bg-red-100 text-red-800';
//       case 'Transportation': return 'bg-blue-100 text-blue-800';
//       case 'Events & Tickets': return 'bg-purple-100 text-purple-800';
//       case 'Utilities': return 'bg-yellow-100 text-yellow-800';
//       case 'Entertainment': return 'bg-pink-100 text-pink-800';
//       default: return 'bg-gray-100 text-gray-800';
//     }
//   };

//   // Handle join split
//   const handleJoinSplit = async (splitId, e) => {
//     e.stopPropagation();
//     try {
//       await joinSplit(splitId);
//       navigate(`/dashboard/splitz-details/${splitId}`);
//     } catch (error) {
//       console.error('Failed to join split:', error);
//     }
//   };

//   // Categories for dashboard
//   const categories = [
//     { icon: Overlay1, label: "Split Expenses" },
//     { icon: Overlay2, label: "Bulk Orders & Riders" },
//     { icon: Overlay3, label: "Borrow/Lend" },
//     { icon: Overlay4, label: "Crowdfund" },
//   ];

//   // Reset filters
//   const resetFilters = () => {
//     setFilters({
//       category: 'all',
//       priceRange: [0, maxPrice],
//       distance: 'All',
//       searchQuery: ''
//     });
//     setPriceSliderValue([0, maxPrice]);
//     setIsSearchFocused(false);
//   };

//   const tabFilters = ["All Active", "Popular", "Newest", "Food", "Rides", "Tools"];

//   const handleSearchFocus = () => {
//     setIsSearchFocused(true);
//   };

//   const handleSearchBlur = () => {
//     setIsSearchFocused(false);
//   };

//   // Get badge text based on category
//   const getBadgeText = (category) => {
//     switch (category) {
//       case 'Food & Groceries': return 'Groceries';
//       case 'Transportation': return 'Ride';
//       case 'Events & Tickets': return 'Event';
//       case 'Utilities': return 'Utilities';
//       case 'Entertainment': return 'Entertainment';
//       case 'Housing': return 'Housing';
//       default: return 'Other';
//     }
//   };

//   // Get badge style based on category
//   const getBadgeStyle = (category) => {
//     switch (category) {
//       case 'Food & Groceries': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       case 'Transportation': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       case 'Events & Tickets': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       case 'Utilities': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       case 'Entertainment': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       case 'Housing': return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//       default: return { backgroundColor: '#E5F7E7', color: '#1F8225' };
//     }
//   };

//   // Calculate time left until end date
//   const getTimeLeft = (endDate) => {
//     if (!endDate) return 'No deadline';
//     const now = new Date();
//     const end = new Date(endDate);
//     const diff = end - now;
    
//     if (diff <= 0) return 'Ended';
    
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
//     if (days > 0) return `${days}d ${hours}h`;
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     return `${minutes}m`;
//   };

//   // Get distance display
//   const getDistanceDisplay = (radius) => {
//     if (!radius || radius === 0) return '0 km';
//     return `${radius} km`;
//   };

//   return (
//     <div className="w-full min-h-screen bg-white transition-all duration-300 p-3 md:p-4">


//       {/* Search and Filter */}
//       <div className="w-full flex flex-col gap-3 space-y-2">
//         <div className='flex justify-between items-center gap-2'>
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300" />
//             <input 
//               type="text" 
//               placeholder="Search tasks by title, category, location, or amount..." 
//               value={filters.searchQuery} 
//               onClick={hideComponent}
//               onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
//               onFocus={handleSearchFocus}
//               onBlur={handleSearchBlur}
//               className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-300"
//             />
//           </div>          
//           <button className="p-2.5 text-[#67707E] border border-[#67707E] rounded-lg hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors duration-200" aria-label="Filter options">
//             <ListFilter size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Filter Panel */}
//       <div
//         className={`
//           bg-white mb-2 mt-2 space-y-2
//           transition-all duration-500 ease-in-out
//           overflow-hidden
//           ${hidden
//             ? "opacity-100 translate-y-0 max-h-[1000px] scale-100"
//             : "opacity-0 -translate-y-4 max-h-0 scale-95 pointer-events-none"}
//         `}
//       >
//         {/* Category Filter */}
//         <div className="transition-opacity duration-500">
//           <div className='flex justify-between items-center mb-3'>  
//             <label className="block text-sm font-medium text-gray-700">Category</label>
//             <button
//               onClick={resetFilters}
//               className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
//             >
//               Clear Filters
//             </button>
//           </div>
          
//           <div className="flex flex-wrap gap-2">
//             {filterCategories.map((category) => {
//               const isActive = filters.category === category;
//               return (
//                 <button
//                   key={category}
//                   onClick={() => setFilters(prev => ({ ...prev, category }))}
//                   className={`
//                     px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105
//                     ${isActive
//                       ? "bg-green-600 text-white shadow-lg scale-105"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }
//                   `}
//                 >
//                   {category === "all" ? "All" : category === "groceries" ? "Groceries" : category}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Distance Filter */}
//         <div className="transition-opacity duration-500">
//           <label className="block text-sm font-medium text-gray-700 mb-3">
//             Distance
//           </label>
          
//           <div className="flex flex-wrap gap-2">
//             {distances.map((distance) => {
//               const isActive = filters.distance === distance;
//               return (
//                 <button
//                   key={distance}
//                   onClick={() => setFilters(prev => ({ ...prev, distance }))}
//                   className={`
//                     px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105
//                     ${isActive
//                       ? "bg-green-600 text-white shadow-lg scale-105"
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }
//                   `}
//                 >
//                   {distance === "All" ? "All Distances" : `Within ${distance}`}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Price Slider */}
//         <div className="transition-opacity duration-500">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Price Range: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}
//           </label>
//           <div className="space-y-4">
//             <div className="relative h-2">
//               {/* Track background */}
//               <div className="absolute top-0 left-0 right-0 h-2 bg-gray-300 rounded-full transition-all duration-500"></div>
              
//               {/* Colored track between thumbs */}
//               <div 
//                 className="absolute top-0 h-2 bg-green-500 rounded-full transition-all duration-500"
//                 style={{
//                   left: `${(priceSliderValue[0] / maxPrice) * 100}%`,
//                   right: `${100 - (priceSliderValue[1] / maxPrice) * 100}%`
//                 }}
//               ></div>
              
//               {/* Thumb indicators */}
//               <div 
//                 className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-600 rounded-full shadow cursor-pointer z-30 transition-all duration-300 hover:scale-125"
//                 style={{ left: `${(priceSliderValue[0] / maxPrice) * 100}%` }}
//               />
//               <div 
//                 className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-green-600 rounded-full shadow cursor-pointer z-30 transition-all duration-300 hover:scale-125"
//                 style={{ left: `${(priceSliderValue[1] / maxPrice) * 100}%` }}
//               />
              
//               {/* Min thumb */}
//               <input
//                 type="range"
//                 min="0"
//                 max={maxPrice}
//                 value={priceSliderValue[0]}
//                 onChange={(e) => handlePriceChange(0, e.target.value)}
//                 className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer z-10"
//               />
              
//               {/* Max thumb */}
//               <input
//                 type="range"
//                 min="0"
//                 max={maxPrice}
//                 value={priceSliderValue[1]}
//                 onChange={(e) => handlePriceChange(1, e.target.value)}
//                 className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer z-20"
//               />
//             </div>
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>{formatPrice(0)}</span>
//               <span>{formatPrice(maxPrice)}</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Dashboard Overview Component */}
//       <div className={`
//         transition-all duration-500 ease-in-out
//         ${hidden
//           ? "opacity-0 translate-y-4 scale-95 pointer-events-none hidden"
//           : "opacity-100 translate-y-0 scale-100 block"}
//       `}>
//         {/* <DashOverview /> */}
//       </div>

//       {/* Main Content */}
//       <main className="space-y-6">
//         {/* Active Splittz Section */}
//         <section>
//           <div className="flex justify-between items-center my-4">
//             <h2 className="text-lg font-semibold text-gray-900">
//               Active Nearby Splitz
//             </h2>
//             <button className="text-green-600 text-sm font-medium hover:text-green-700">
//               View All
//             </button>
//           </div>
          
//           {/* Tab Filters */}
//           <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
//             {tabFilters.map((tab) => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
//                   activeTab === tab
//                     ? "bg-green-600 text-white"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>
          
//           {/* Splits Grid with REAL DATA - Matching the UI exactly */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//             {isLoading ? (
//               // Loading skeleton
//               Array.from({ length: 6 }).map((_, i) => (
//                 <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
//                   <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
//                   <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                   <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//                 </div>
//               ))
//             ) : filteredSplits.length > 0 ? (
//               filteredSplits.map((split) => {
//                 const participants = split.participants?.length || 0;
//                 const maxParticipants = split.max_participants || 1;
//                 const pricePerPerson = parsePrice(split.amount) / maxParticipants;
//                 const badgeText = getBadgeText(split.category);
//                 const badgeStyle = getBadgeStyle(split.category);
//                 const timeLeft = getTimeLeft(split.end_date);
//                 const distance = getDistanceDisplay(split.visibility_radius);
                
//                 return (
//                   <div
//                     key={split.id}
//                     className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100"
//                   >
//                     {/* Image Section */}
//                     <div className="relative">
//                       <img
//                         src={split.image || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"}
//                         alt={split.title}
//                         className="w-full h-48 object-cover rounded-lg"
//                       />
                      
//                       {/* Badge */}
//                       <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
//                         {badgeText}
//                       </span>
                      
//                       {/* Action Buttons */}
//                       <div className="absolute top-2 right-2 flex gap-2">
//                         <button 
//                           className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
//                           aria-label="Add to favorites"
//                         >
//                           <Heart size={16} className="text-white hover:text-red-500" />
//                         </button>
//                         <button 
//                           className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
//                           aria-label="Share"
//                         >
//                           <Share2 size={16} className="text-white hover:text-green-600" />
//                         </button>
//                       </div>
//                     </div>

//                     {/* Content Section - Matching the exact UI */}
//                     <div className="space-y-2 p-3">
//                       {/* Title and Status */}
//                       <div className="flex justify-between items-start">
//                         <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
//                           {split.title}
//                         </h3>
//                         <span 
//                           className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
//                           style={badgeStyle}
//                         >
//                           {badgeText}
//                         </span>
//                       </div>

//                       {/* Price per person */}
//                       <p className="text-sm text-gray-600">
//                         <span className="text-[#1F8225] font-bold text-base">
//                           {formatPrice(pricePerPerson)}
//                         </span>/person
//                       </p>

//                       {/* Details */}
//                       <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
//                         <div className="flex items-center gap-1">
//                           <Users size={12} />
//                           <span>{participants}</span>
//                         </div>
//                         <div className="flex items-center gap-1 text-[#E60000]">
//                           <Clock size={12} />
//                           <span>{timeLeft}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <MapPin size={12} className="text-[#1F8225]" />
//                           <span>{distance}</span>
//                         </div>
//                       </div>

//                       {/* CTA Section */}
//                       <div className="flex items-center justify-between pt-3">
//                         <div>
//                           <span className="text-green-600 font-semibold text-lg">
//                             {formatPrice(split.amount)}
//                           </span>
//                           <span className="text-xs text-gray-500 ml-1">total</span>
//                         </div>
//                         <button 
//                           className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                           onClick={(e) => handleJoinSplit(split.id, e)}
//                           disabled={participants >= maxParticipants}
//                         >
//                           {participants >= maxParticipants ? 'Full' : 'Join Splitz'}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               // Empty state - Matching the exact UI
//               <div className="col-span-full text-center py-10">
//                 <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
//                   <Users size={24} className="text-gray-400" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-gray-700 mb-2">No Active Splits Found</h3>
//                 <p className="text-gray-500 mb-4">There are currently no active splits in your area.</p>
//                 <button 
//                   className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
//                   onClick={() => navigate('/dashboard/create-splitz')}
//                 >
//                   Create a Split
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>
//       </main>
//     </div>
//   );
// }

// export default Overview;

import React from 'react'

function Overview() {
  return (
    <div className='w-full flex flex-col p-4'>Overview</div>
  )
}

export default Overview