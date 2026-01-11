// import { Search, Filter, Plus } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// import SplitCard from "./SplitzCard";

// import { Heart, Share2, Users, Clock, MapPin } from "lucide-react";

// import {
//   formatPrice,
//   getBadgeStyle,
//   getBadgeText,
//   getDistanceDisplay,
//   getTimeLeft,
//   handleJoinSplit,
//   parsePrice,
// } from "../../utils/splitsutls";
// import { useSplits } from "./useSpits";

// function AllSplitsPage() {
//   const navigate = useNavigate();

//   const { data: splitsData, isLoading } = useSplits();
//   console.log(splitsData);
//   return (
//     <main className="space-y-6">
//       {/* Active Splittz Section */}
//       <section>
//         <div className="flex justify-between items-center my-4">
//           <h2 className="text-lg font-semibold text-gray-900">
//             Active Nearby Splitz
//           </h2>
//           <button className="text-green-600 text-sm font-medium hover:text-green-700">
//             View All
//           </button>
//         </div>

//         {/* Tab Filters */}
//         <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
//           {tabFilters.map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
//                 activeTab === tab
//                   ? "bg-green-600 text-white"
//                   : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Splits Grid with REAL DATA - Matching the UI exactly */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
//           {isLoading ? (
//             // Loading skeleton
//             Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
//                 <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
//                 <div className="h-4 bg-gray-300 rounded mb-2"></div>
//                 <div className="h-4 bg-gray-300 rounded w-1/2"></div>
//               </div>
//             ))
//           ) : splitsData.length > 0 ? (
//             splitsData.map((split) => {
//               const participants = split.max_participants;
//               const maxParticipants = split.max_participants;
//               const pricePerPerson = parsePrice(split.amount) / maxParticipants;
//               const badgeText = getBadgeText(split.category);
//               const badgeStyle = getBadgeStyle(split.category);
//               const timeLeft = getTimeLeft(split.end_date);
//               const distance = getDistanceDisplay(split.visibility_radius);

//               return (
//                 <div
//                   key={split.id}
//                   className="bg-[#F3F3F3] rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-1.5 border border-gray-100"
//                 >
//                   {/* Image Section */}
//                   <div className="relative">
//                     <img
//                       src={
//                         split.image ||
//                         "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
//                       }
//                       alt={split.title}
//                       className="w-full h-48 object-cover rounded-lg"
//                     />

//                     {/* Badge */}
//                     <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-3 py-1 rounded-full">
//                       {badgeText}
//                     </span>

//                     {/* Action Buttons */}
//                     <div className="absolute top-2 right-2 flex gap-2">
//                       <button
//                         className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
//                         aria-label="Add to favorites"
//                       >
//                         <Heart
//                           size={16}
//                           className="text-white hover:text-red-500"
//                         />
//                       </button>
//                       <button
//                         className="bg-black/60 p-1.5 rounded-full hover:bg-white transition-all duration-200"
//                         aria-label="Share"
//                       >
//                         <Share2
//                           size={16}
//                           className="text-white hover:text-green-600"
//                         />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Content Section - Matching the exact UI */}
//                   <div className="space-y-2 p-3">
//                     {/* Title and Status */}
//                     <div className="flex justify-between items-start">
//                       <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 flex-1 mr-2">
//                         {split.title}
//                       </h3>
//                       <span
//                         className="text-xs px-2 py-1 rounded-full whitespace-nowrap"
//                         style={badgeStyle}
//                       >
//                         {badgeText}
//                       </span>
//                     </div>

//                     {/* Price per person */}
//                     <p className="text-sm text-gray-600">
//                       <span className="text-[#1F8225] font-bold text-base">
//                         {formatPrice(pricePerPerson)}
//                       </span>
//                       /person
//                     </p>

//                     {/* Details */}
//                     <div className="flex items-center justify-between text-xs text-gray-600 pt-2 border-t border-gray-200">
//                       <div className="flex items-center gap-1">
//                         <Users size={12} />
//                         <span>{participants}</span>
//                       </div>
//                       <div className="flex items-center gap-1 text-[#E60000]">
//                         <Clock size={12} />
//                         <span>{timeLeft}</span>
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <MapPin size={12} className="text-[#1F8225]" />
//                         <span>{distance}</span>
//                       </div>
//                     </div>

//                     {/* CTA Section */}
//                     <div className="flex items-center justify-between pt-3">
//                       <div>
//                         <span className="text-green-600 font-semibold text-lg">
//                           {formatPrice(split.amount)}
//                         </span>
//                         <span className="text-xs text-gray-500 ml-1">
//                           total
//                         </span>
//                       </div>
//                       <button
//                         className="px-4 py-2 text-sm bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                         onClick={(e) => handleJoinSplit(split.id, e)}
//                         disabled={participants >= maxParticipants}
//                       >
//                         {participants >= maxParticipants
//                           ? "Full"
//                           : "Join Splitz"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             // Empty state - Matching the exact UI
//             <div className="col-span-full text-center py-10">
//               <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
//                 <Users size={24} className="text-gray-400" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-700 mb-2">
//                 No Active Splits Found
//               </h3>
//               <p className="text-gray-500 mb-4">
//                 There are currently no active splits in your area.
//               </p>
//               <button
//                 className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
//                 onClick={() => navigate("/dashboard/create-splitz")}
//               >
//                 Create a Split
//               </button>
//             </div>
//           )}
//         </div>
//       </section>
//     </main>
//   );
// }

// export default AllSplitsPage;
