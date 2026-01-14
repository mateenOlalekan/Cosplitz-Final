// // src/pages/dashboard/SplitzDetail.js
// import {
//   ChevronLeft,
//   Share2,
//   Users,
//   MapPin,
//   Clock,
//   Heart,
//   ChevronDown,
//   User,
//   TrendingUp,
//   Wallet,
//   CreditCard,
//   Building2,
//   Star,
//   Shield,
//   Flag,
// } from "lucide-react";
// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import useSplitStore from "../../../store/splitStore";
// import useAuthStore from "../../../store/authStore";

// function SplitzDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [selectedPayment, setSelectedPayment] = useState("Wallet");

//   // Get the split from the store
//   const { allSplits, joinSplit, isLoading } = useSplitStore();
//   const user = useAuthStore((state) => state.user);

//   // Find the specific split
//   const split = allSplits.find((s) => s.id === parseInt(id));

//   // Calculate progress
//   const participants = split?.participants?.length || 0;
//   const maxParticipants = split?.max_participants || 1;
//   const progress = Math.min((participants / maxParticipants) * 100, 100);
//   const pricePerPerson = split ? parseFloat(split.amount) / maxParticipants : 0;

//   // Handle join split
//   const handleJoinAndPay = async () => {
//     try {
//       await joinSplit(split.id);
//       // After joining, you might want to show a success message
//       alert("Successfully joined the split!");
//     } catch (error) {
//       console.error("Failed to join:", error);
//       alert(error.message || "Failed to join the split");
//     }
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     const numAmount = parseFloat(amount) || 0;
//     return new Intl.NumberFormat("en-NG", {
//       style: "currency",
//       currency: "NGN",
//       minimumFractionDigits: 0,
//     }).format(numAmount);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg">Loading...</div>
//       </div>
//     );
//   }

//   if (!split) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen">
//         <div className="text-xl font-semibold text-gray-700 mb-2">
//           Split not found
//         </div>
//         <button
//           onClick={() => navigate(-1)}
//           className="px-4 py-2 bg-green-600 text-white rounded-lg"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col w-full min-h-screen bg-white">
//       {/* Header */}
//       <header className="flex sticky top-0 items-center justify-between px-4 md:px-10 py-4 shadow-sm bg-white">
//         <button onClick={() => navigate(-1)} className="flex items-center">
//           <ChevronLeft size={20} />
//         </button>

//         <p className="text-lg font-semibold">Splitz Detail</p>

//         <button className="flex items-center justify-center w-8 h-8 bg-slate-200 rounded-xl">
//           <Share2 size={15} />
//         </button>
//       </header>

//       {/* Content */}
//       <div className="flex flex-col w-full mx-auto max-w-5xl px-4 md:px-10 pt-6 gap-6">
//         {/* Title & Tags */}
//         <div className="flex flex-col gap-3">
//           <span className="text-lg font-bold">{split.title}</span>

//           <div className="flex gap-3">
//             <span className="px-4 py-1 text-sm text-[#FB9851] bg-[#FB9851]/20 rounded-full">
//               {split.category || "General"}
//             </span>
//             <span
//               className={`px-4 py-1 text-sm ${
//                 split.status === "Active"
//                   ? "bg-green-100 text-green-800"
//                   : "bg-gray-100 text-gray-800"
//               } rounded-full`}
//             >
//               {split.status || "Active"}
//             </span>
//           </div>
//         </div>

//         {/* Amount Card */}
//         <div className="rounded-xl bg-white p-5 shadow-sm shadow-[#D0C9D6]">
//           {/* Amount */}
//           <div className="flex justify-between items-start pb-2 border-b border-[#D0C9D6]">
//             <div className="flex flex-col gap-1">
//               <p className="text-sm text-gray-500">Total Amount</p>
//               <p className="text-xl font-bold">
//                 {formatCurrency(split.amount)}
//               </p>
//             </div>

//             <div className="flex flex-col gap-1 text-right">
//               <p className="text-sm text-gray-500">Per person</p>
//               <p className="text-lg font-bold text-[#1F8225]">
//                 {formatCurrency(pricePerPerson)}
//               </p>
//             </div>
//           </div>

//           {/* Details */}
//           <div className="flex justify-between items-start pb-2 border-b border-[#D0C9D6] pt-3">
//             <div className="flex flex-col gap-4 text-sm text-gray-600">
//               <div className="flex items-center gap-2">
//                 <Users size={15} />
//                 <span>Participants</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock size={15} />
//                 <span>Deadline</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <MapPin size={15} />
//                 <span>Distance</span>
//               </div>
//             </div>

//             <div className="flex flex-col gap-4 text-sm text-right">
//               <span className="font-medium">
//                 {participants} / {maxParticipants} Joined
//               </span>
//               <span className="text-red-600 font-medium">
//                 {split.end_date
//                   ? new Date(split.end_date).toLocaleDateString()
//                   : "No deadline"}
//               </span>
//               <span className="text-gray-600">
//                 {split.visibility_radius || 0} km away
//               </span>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div className="flex flex-col gap-2 pt-3">
//             <div className="w-full h-2 bg-[#D0C9D6] rounded-full overflow-hidden">
//               <div
//                 className="h-full bg-[#1F8225] rounded-full transition-all"
//                 style={{ width: `${progress}%` }}
//               />
//             </div>
//             <div className="flex justify-between text-xs text-gray-500">
//               <span>0%</span>
//               <span>{Math.round(progress)}%</span>
//               <span>100%</span>
//             </div>
//           </div>
//         </div>

//         {/* Location Details */}
//         <div className="rounded-xl bg-white p-5 shadow-sm shadow-[#D0C9D6]">
//           <div className="flex gap-3 items-center text-black/90 text-lg">
//             <MapPin size={15} />
//             <p>Location Details</p>
//           </div>

//           <p className="text-[#67707E] mt-2">
//             {split.location || "Location not specified"}
//           </p>
//           {split.start_date && (
//             <p className="text-[#1F8225] mt-1">
//               Starts: {new Date(split.start_date).toLocaleDateString()}
//             </p>
//           )}
//         </div>

//         {/* Description */}
//         <div className="rounded-xl bg-white p-5 shadow-sm shadow-[#D0C9D6]">
//           <p className="font-semibold text-black/90">Description</p>
//           <p className="text-[#67707E] mt-2">
//             {split.description || "No description provided."}
//           </p>
//           {split.rules && (
//             <div className="mt-4">
//               <p className="font-semibold text-black/90 mb-2">Rules:</p>
//               <p className="text-[#67707E] text-sm">{split.rules}</p>
//             </div>
//           )}
//         </div>

//         {/* Participants Section */}
//         {split.participants && split.participants.length > 0 && (
//           <div className="rounded-xl bg-white p-5 shadow-sm shadow-[#D0C9D6]">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-semibold text-gray-900">
//                 Participants ({participants})
//               </h3>
//               <span className="text-xs text-gray-500">
//                 {split.participants.filter((p) => p.has_paid).length} paid,{" "}
//                 {participants -
//                   split.participants.filter((p) => p.has_paid).length}{" "}
//                 pending
//               </span>
//             </div>

//             <div className="space-y-3">
//               {split.participants.map((participant, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold">
//                       {participant.name?.charAt(0) || "U"}
//                     </div>

//                     <div className="flex flex-col gap-1">
//                       <div className="flex items-center gap-2">
//                         <span className="text-sm font-medium text-gray-900">
//                           {participant.name || `User ${index + 1}`}
//                         </span>
//                         {participant.is_creator && (
//                           <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
//                             Host
//                           </span>
//                         )}
//                       </div>

//                       {participant.trust_score && (
//                         <div className="flex items-center gap-1 text-xs text-gray-600">
//                           <Star size={12} className="text-yellow-400" />
//                           <span>{participant.trust_score}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <span
//                     className={`px-3 py-1 text-xs rounded-full font-medium ${
//                       participant.has_paid
//                         ? "bg-emerald-500 text-white"
//                         : "bg-gray-200 text-gray-700"
//                     }`}
//                   >
//                     {participant.has_paid ? "Paid" : "Pending"}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Payment Section */}
//         <div className="rounded-xl bg-white p-5 shadow-sm shadow-[#D0C9D6]">
//           <h3 className="font-semibold text-gray-900 mb-4">Payment</h3>
//           <p className="text-xs text-gray-500 mb-3">(Choose payment method)</p>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//             <button
//               onClick={() => setSelectedPayment("Wallet")}
//               className={`p-4 rounded-xl border-2 transition-all ${
//                 selectedPayment === "Wallet"
//                   ? "border-emerald-500 bg-emerald-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               <Wallet className="w-6 h-6 mx-auto mb-2 text-emerald-500" />
//               <p className="text-xs font-medium text-gray-900">Wallet</p>
//             </button>

//             <button
//               onClick={() => setSelectedPayment("Card")}
//               className={`p-4 rounded-xl border-2 transition-all ${
//                 selectedPayment === "Card"
//                   ? "border-emerald-500 bg-emerald-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               <CreditCard className="w-6 h-6 mx-auto mb-2 text-gray-600" />
//               <p className="text-xs font-medium text-gray-900">Card</p>
//             </button>

//             <button
//               onClick={() => setSelectedPayment("Transfer")}
//               className={`p-4 rounded-xl border-2 transition-all ${
//                 selectedPayment === "Transfer"
//                   ? "border-emerald-500 bg-emerald-50"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               <Building2 className="w-6 h-6 mx-auto mb-2 text-gray-600" />
//               <p className="text-xs font-medium text-gray-900">Transfer</p>
//             </button>
//           </div>

//           {/* Security Message */}
//           <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2">
//             <Shield className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
//             <p className="text-xs text-emerald-700">
//               Funds held securely in escrow until split completes
//             </p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="py-5 flex gap-3">
//           <button className="w-12 h-12 border-2 border-[#67707E] rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors">
//             <Heart className="w-5 h-5 text-[#67707E]" />
//           </button>
//           <button className="w-12 h-12 border-2 border-[#67707E] rounded-xl flex items-center justify-center hover:border-gray-400 transition-colors">
//             <Share2 className="w-5 h-5 text-[#67707E]" />
//           </button>
//           <button
//             onClick={handleJoinAndPay}
//             className="flex-1 bg-[#1F8225] text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:bg-[#16681d] disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={participants >= maxParticipants}
//           >
//             {participants >= maxParticipants
//               ? "Split is Full"
//               : `Join & Pay ${formatCurrency(pricePerPerson)}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default SplitzDetail;
