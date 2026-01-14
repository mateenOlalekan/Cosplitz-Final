// // src/pages/dashboard/MySplitz.js
// import { useState, useEffect } from "react";
// import { ChevronDown, Bell, Settings, MapPin, ListFilter, Search } from "lucide-react";
// import { useNavigate, Link } from "react-router-dom";
// import screen from "../../../assets/screen.svg";
// import useSplitStore from "../../../store/splitStore";
// import useAuthStore from "../../../store/authStore";

// function MySplitz() {
//   const navigate = useNavigate();
//   const [filter, setFilter] = useState("All");
//   const [searchQuery, setSearchQuery] = useState("");

//   // Use real data from splitStore
//   const { mySplits, fetchMySplits, isLoading } = useSplitStore();
//   const user = useAuthStore(state => state.user);

//   // Filter options
//   const allfiter = ["All", "Active", "Success", "Failed"];

//   // Fetch user's splits on mount
//   useEffect(() => {
//     fetchMySplits();
//   }, []);

//   // Filter counts calculation
//   const filterCounts = {
//     All: mySplits.length,
//     Active: mySplits.filter(item => item.status === "Active").length,
//     Success: mySplits.filter(item => item.status === "Success").length,
//     Failed: mySplits.filter(item => item.status === "Failed").length
//   };

//   // Filter and search data
//   const filteredData = mySplits.filter(item => {
//     // Apply status filter
//     const statusMatch = filter === "All" || item.status === filter;
    
//     // Apply search filter
//     const searchMatch = searchQuery === "" || 
//       item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));
    
//     return statusMatch && searchMatch;
//   });

//   const goCreateSplitz = () => {
//     navigate("/dashboard/create-splitz");
//   };

//   // View details handler
//   const handleViewDetails = (id) => {
//     navigate(`/dashboard/splitz-details/${id}`);
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     const numAmount = parseFloat(amount) || 0;
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0
//     }).format(numAmount);
//   };

//   // Calculate progress percentage
//   const calculateProgress = (split) => {
//     const participants = split.participants?.length || 0;
//     const maxParticipants = split.max_participants || 1;
//     return Math.min((participants / maxParticipants) * 100, 100);
//   };

//   // Determine user's role in the split
//   const getUserRole = (split) => {
//     return split.creator?.id === user?.id ? 'Creator' : 'Participant';
//   };

//   return (
//     <div className="w-full flex flex-col min-h-screen bg-gray-50">
//       {/* Header - unchanged */}
//       <div className="w-full flex items-center justify-between py-3 px-4 md:px-6 bg-white shadow-sm">
//         <div className="flex items-center gap-1 text-[#67707E]">
//           <MapPin size={16} />
//           <span className="text-sm font-medium">
//             Ikeja, Lagos, Nigeria
//           </span>
//           <ChevronDown size={16} />
//         </div>

//         <div className="flex items-center gap-2">
//           <Link
//             to="/dashboard/notification"
//             className="relative p-2 hover:bg-gray-100 rounded-lg transition"
//           >
//             <Bell size={18} className="text-[#67707E]" />
//             <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
//           </Link>

//           <Link
//             to="/dashboard/settings"
//             className="p-2 hover:bg-gray-100 rounded-lg transition"
//           >
//             <Settings size={18} className="text-[#67707E]" />
//           </Link>
//         </div>
//       </div>

//       {/* Page Title */}
//       <div className="flex items-center justify-between px-4 md:px-6 py-4">
//         <div>
//           <h2 className="text-base sm:text-lg font-bold text-gray-800">
//             My Splitz
//           </h2>
//           <p className="text-xs sm:text-sm text-gray-500">
//             Check your splitz history
//           </p>
//         </div>

//         <button className="flex items-center gap-1 px-3 py-2 border border-gray-300 text-sm rounded-md hover:bg-gray-50 transition">
//           This month
//           <ChevronDown size={16} />
//         </button>
//       </div>

//       {/* Filter Tabs */}
//       <div className="border-b border-gray-200">
//         <div className="flex space-x-6 md:space-x-8 px-4 md:px-6 overflow-x-auto">
//           {allfiter.map((item) => (
//             <button
//               key={item}
//               onClick={() => setFilter(item)}
//               className={`flex-shrink-0 pb-3 relative ${
//                 filter === item
//                   ? 'text-green-700 border-b-2 border-green-700 font-semibold'
//                   : 'text-gray-500 hover:text-gray-700'
//               }`}
//             >
//               <span className="text-sm md:text-base">
//                 {item} ({filterCounts[item]})
//               </span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="flex items-center justify-end gap-2 px-4 md:px-6 mt-4">
//         <div className="relative w-full max-w-sm">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
//           <input
//             type="text"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder="Search for your splitz..."
//             className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//           />
//         </div>

//         <button
//           className="h-10 w-10 flex items-center justify-center border border-gray-300 rounded-lg text-[#67707E] hover:bg-green-600 hover:text-white hover:border-green-600 transition"
//           aria-label="Filter"
//         >
//           <ListFilter size={18} />
//         </button>
//       </div>
      
//       {/* Table with REAL DATA */}
//       <div className="px-4 md:px-6 mt-6 flex-1">
//         {isLoading ? (
//           // Loading skeleton
//           <div className="space-y-3">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <div key={i} className="bg-white p-4 rounded-lg animate-pulse">
//                 <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
//                 <div className="h-3 bg-gray-200 rounded w-1/3"></div>
//               </div>
//             ))}
//           </div>
//         ) : filteredData.length > 0 ? (
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-[#F7F5F9]">
//                     <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Splitz name</th>
//                     <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Role</th>
//                     <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Status</th>
//                     <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Progress</th>
//                     <th className="py-4 px-4 text-left text-sm font-semibold text-gray-700">Action</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredData.map((split) => {
//                     const progress = calculateProgress(split);
//                     const role = getUserRole(split);
                    
//                     return (
//                       <tr key={split.id} className="hover:bg-gray-50 transition-colors">
//                         <td className="py-4 px-4">
//                           <div>
//                             <div className="font-medium text-gray-900">{split.title}</div>
//                             <div className="text-xs text-gray-500 mt-1">
//                               {formatCurrency(split.amount)} • {split.max_participants || 1} participants
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             role === 'Creator' 
//                               ? 'bg-purple-100 text-purple-800' 
//                               : 'bg-blue-100 text-blue-800'
//                           }`}>
//                             {role}
//                           </span>
//                         </td>
//                         <td className="py-4 px-4">
//                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                             split.status === 'Active' 
//                               ? 'bg-green-100 text-green-800' 
//                               : split.status === 'Success'
//                               ? 'bg-blue-100 text-blue-800'
//                               : 'bg-red-100 text-red-800'
//                           }`}>
//                             {split.status || 'Active'}
//                           </span>
//                         </td>
//                         <td className="py-4 px-4">
//                           <div className="w-32">
//                             <div className="flex items-center justify-between mb-1">
//                               <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
//                               <span className="text-xs text-gray-500">
//                                 {split.participants?.length || 0}/{split.max_participants || 1}
//                               </span>
//                             </div>
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className={`h-2 rounded-full ${
//                                   progress === 100 
//                                     ? 'bg-green-600' 
//                                     : progress > 70 
//                                     ? 'bg-blue-600' 
//                                     : progress > 40 
//                                     ? 'bg-yellow-500' 
//                                     : 'bg-red-500'
//                                 }`}
//                                 style={{ width: `${progress}%` }}
//                               />
//                             </div>
//                           </div>
//                         </td>
//                         <td className="py-4 px-4">
//                           <button
//                             onClick={() => handleViewDetails(split.id)}
//                             className="px-4 py-2 text-sm font-medium text-green-700 hover:text-green-800 hover:bg-green-50 rounded-md transition-colors"
//                           >
//                             View Details
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         ) : (
//           // Empty State
//           <div className="flex flex-1 items-center justify-center px-4 py-12">
//             <div className="max-w-md w-full text-center">
//               <img
//                 src={screen}
//                 alt="analytics"
//                 className="mx-auto max-h-48 object-contain"
//               />

//               <h1 className="mt-4 font-bold text-lg text-[#67707E]/40">
//                 {searchQuery ? 'No splitz found' : 'You haven\'t created or joined any splitz yet'}
//               </h1>
//               <p className="mt-2 text-sm text-[#67707E]/60">
//                 {searchQuery 
//                   ? 'Try adjusting your search or filter to find what you\'re looking for.'
//                   : 'Splitz you create or join will appear here for easy tracking and updates.'
//                 }
//               </p>

//               <div className="mt-6 flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={goCreateSplitz}
//                   className="flex-1 bg-[#1F8225] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition active:scale-95"
//                 >
//                   Create a splitz
//                 </button>

//                 <button 
//                   className="flex-1 border border-green-600 text-green-700 py-2.5 rounded-lg text-sm font-medium hover:bg-green-50 transition active:scale-95"
//                   onClick={() => navigate('/dashboard/allsplits')}
//                 >
//                   Join Splitz
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pagination (if needed) */}
//         {filteredData.length > 0 && (
//           <div className="flex items-center justify-between px-4 py-4 border-t border-gray-200 bg-white">
//             <div className="text-sm text-gray-700">
//               Showing <span className="font-medium">{filteredData.length}</span> of <span className="font-medium">{mySplits.length}</span> results
//             </div>
//             <div className="flex gap-2">
//               <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
//                 Previous
//               </button>
//               <button className="px-3 py-1.5 text-sm border border-gray-300 rounded bg-green-50 text-green-700 border-green-600">
//                 1
//               </button>
//               <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
//                 2
//               </button>
//               <button className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50">
//                 Next
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MySplitz;