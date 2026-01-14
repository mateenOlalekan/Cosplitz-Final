
// // // import CheckLast from "../../assets/CheckLast.svg";

// // // function SplitzSuccessful() {
// // //   return (
// // //     <div className="w-full h-screen flex  items-center bg-white">
// // //       <div className="shadow-md max-w-xl rounded-2xl p-6 bg-white flex flex-col items-center gap-4">
        
// // //         {/* Success Image */}
// // //         <img src={CheckLast} alt="Payment Successful" className="w-20 h-20" />

// // //         {/* Message */}
// // //         <div className="flex flex-col text-center gap-1">
// // //           <h1 className="text-2xl font-semibold text-gray-900">PAYMENT SUCCESSFUL</h1>
// // //           <p className="text-gray-600 text-sm">Your Splitz has been created</p>
// // //         </div>

// // //         {/* Action Buttons */}
// // //         <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
// // //           <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition">
// // //             View Splitz
// // //           </button>
// // //           <button className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 py-2 rounded-lg font-medium transition">
// // //             Share With Friends
// // //           </button>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // export default SplitzSuccessful;

// // import { useNavigate, useLocation } from "react-router-dom";
// // import CheckLast from "../../assets/CheckLast.svg";

// // function SplitzSuccessful() {
// //   const navigate = useNavigate();
// //   const location = useLocation();
  
// //   // Get the newly created split data from navigation state
// //   const newSplit = location.state?.split;

// //   const handleViewSplitz = () => {
// //     navigate('/dashboard/mysplitz');
// //   };

// //   const handleShare = () => {
// //     // Implement share functionality
// //     if (navigator.share && newSplit) {
// //       navigator.share({
// //         title: newSplit.title,
// //         text: `Join my Splitz: ${newSplit.title}`,
// //         url: window.location.origin + `/dashboard/splitz-details/${newSplit.id}`
// //       }).catch(err => console.log('Share failed:', err));
// //     } else {
// //       // Fallback: copy link to clipboard
// //       if (newSplit) {
// //         const link = `${window.location.origin}/dashboard/splitz-details/${newSplit.id}`;
// //         navigator.clipboard.writeText(link);
// //         alert('Link copied to clipboard!');
// //       }
// //     }
// //   };

// //   return (
// //     <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 px-4">
// //       <div className="shadow-lg max-w-xl w-full rounded-2xl p-8 bg-white flex flex-col items-center gap-6">
        
// //         {/* Success Image */}
// //         <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
// //           <img src={CheckLast} alt="Payment Successful" className="w-16 h-16" />
// //         </div>

// //         {/* Message */}
// //         <div className="flex flex-col text-center gap-2">
// //           <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
// //             SPLITZ CREATED SUCCESSFULLY!
// //           </h1>
// //           <p className="text-gray-600 text-sm sm:text-base">
// //             Your Splitz has been created and is now live
// //           </p>
          
// //           {newSplit && (
// //             <div className="mt-3 p-4 bg-green-50 rounded-lg">
// //               <p className="text-sm font-semibold text-green-800">{newSplit.title}</p>
// //               <p className="text-xs text-green-600 mt-1">
// //                 {newSplit.max_participants} participants needed
// //               </p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Action Buttons */}
// //         <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
// //           <button 
// //             onClick={handleViewSplitz}
// //             className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200 shadow-md"
// //           >
// //             View My Splitz
// //           </button>
// //           <button 
// //             onClick={handleShare}
// //             className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 rounded-lg font-semibold transition-colors duration-200"
// //           >
// //             Share With Friends
// //           </button>
// //         </div>

// //         {/* Additional Info */}
// //         <div className="mt-4 text-center">
// //           <p className="text-xs text-gray-500">
// //             You can view and manage your Splitz anytime from your dashboard
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default SplitzSuccessful;

// import { useNavigate, useLocation } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { CheckCircle2, Share2, Eye } from "lucide-react";
// import CheckLast from "../../../assets/CheckLast.svg";

// function SplitzSuccessful() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [shareSuccess, setShareSuccess] = useState(false);
  
//   // Get the newly created split data from navigation state
//   const newSplit = location.state?.split;

//   // Redirect if no split data
//   useEffect(() => {
//     if (!newSplit) {
//       console.warn('No split data found, redirecting to my splits');
//       navigate('/dashboard/mysplitz', { replace: true });
//     }
//   }, [newSplit, navigate]);

//   // Format currency
//   const formatCurrency = (amount) => {
//     const numAmount = parseFloat(amount) || 0;
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0
//     }).format(numAmount);
//   };

//   const handleViewSplitz = () => {
//     navigate('/dashboard/mysplitz');
//   };

//   const handleViewDetails = () => {
//     if (newSplit?.id) {
//       navigate(`/dashboard/splitz-details/${newSplit.id}`);
//     } else {
//       navigate('/dashboard/mysplitz');
//     }
//   };

//   const handleShare = async () => {
//     if (!newSplit) return;

//     const shareData = {
//       title: `Join my Splitz: ${newSplit.title}`,
//       text: `I created a new split for ${newSplit.category || 'expenses'}. Join now!`,
//       url: `${window.location.origin}/dashboard/splitz-details/${newSplit.id}`
//     };

//     // Try native share API first (mobile devices)
//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//         setShareSuccess(true);
//         setTimeout(() => setShareSuccess(false), 3000);
//       } catch (err) {
//         if (err.name !== 'AbortError') {
//           console.error('Share failed:', err);
//           fallbackCopy(shareData.url);
//         }
//       }
//     } else {
//       // Fallback: copy link to clipboard
//       fallbackCopy(shareData.url);
//     }
//   };

//   const fallbackCopy = (text) => {
//     if (navigator.clipboard && navigator.clipboard.writeText) {
//       navigator.clipboard.writeText(text)
//         .then(() => {
//           setShareSuccess(true);
//           setTimeout(() => setShareSuccess(false), 3000);
//         })
//         .catch(err => {
//           console.error('Failed to copy:', err);
//           alert('Failed to copy link. Please copy manually: ' + text);
//         });
//     } else {
//       // Older fallback method
//       const textArea = document.createElement('textarea');
//       textArea.value = text;
//       textArea.style.position = 'fixed';
//       textArea.style.opacity = '0';
//       document.body.appendChild(textArea);
//       textArea.focus();
//       textArea.select();
      
//       try {
//         document.execCommand('copy');
//         setShareSuccess(true);
//         setTimeout(() => setShareSuccess(false), 3000);
//       } catch (err) {
//         console.error('Failed to copy:', err);
//         alert('Failed to copy link. Please copy manually: ' + text);
//       }
      
//       document.body.removeChild(textArea);
//     }
//   };

//   if (!newSplit) {
//     return null; // Will redirect via useEffect
//   }

//   return (
//     <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 px-4">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.3 }}
//         className="shadow-xl max-w-2xl w-full rounded-2xl p-8 md:p-10 bg-white"
//       >
//         {/* Success Icon */}
//         <motion.div
//           initial={{ scale: 0 }}
//           animate={{ scale: 1 }}
//           transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//           className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg mb-6"
//         >
//           <CheckCircle2 size={48} className="text-white" />
//         </motion.div>

//         {/* Main Message */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.3 }}
//           className="text-center mb-6"
//         >
//           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
//             Split Created Successfully!
//           </h1>
//           <p className="text-gray-600 text-base sm:text-lg">
//             Your split is now live and ready for participants
//           </p>
//         </motion.div>

//         {/* Split Details Card */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.4 }}
//           className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-100"
//         >
//           <h3 className="text-lg font-bold text-gray-900 mb-3">{newSplit.title}</h3>
          
//           <div className="grid grid-cols-2 gap-4 text-sm">
//             <div>
//               <p className="text-gray-600 mb-1">Total Amount</p>
//               <p className="font-bold text-green-700 text-lg">
//                 {formatCurrency(newSplit.amount)}
//               </p>
//             </div>
            
//             <div>
//               <p className="text-gray-600 mb-1">Per Person</p>
//               <p className="font-bold text-green-700 text-lg">
//                 {formatCurrency(newSplit.amount / (newSplit.max_participants || 1))}
//               </p>
//             </div>
            
//             <div>
//               <p className="text-gray-600 mb-1">Category</p>
//               <span className="inline-block px-3 py-1 bg-green-600 text-white text-xs rounded-full font-medium">
//                 {newSplit.category || 'General'}
//               </span>
//             </div>
            
//             <div>
//               <p className="text-gray-600 mb-1">Participants Needed</p>
//               <p className="font-semibold text-gray-900">
//                 {newSplit.max_participants || 1}
//               </p>
//             </div>
//           </div>

//           {newSplit.location && (
//             <div className="mt-4 pt-4 border-t border-green-200">
//               <p className="text-gray-600 text-xs mb-1">Location</p>
//               <p className="text-gray-900 font-medium text-sm">{newSplit.location}</p>
//             </div>
//           )}
//         </motion.div>

//         {/* Share Success Message */}
//         {shareSuccess && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0 }}
//             className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg mb-4 text-sm text-center"
//           >
//             ✓ Link copied to clipboard!
//           </motion.div>
//         )}

//         {/* Action Buttons */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.5 }}
//           className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"
//         >
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleViewDetails}
//             className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 shadow-md"
//           >
//             <Eye size={18} />
//             View Details
//           </motion.button>

//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleShare}
//             className="flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 hover:bg-green-50 py-3 px-6 rounded-lg font-semibold transition-colors duration-200"
//           >
//             <Share2 size={18} />
//             Share Split
//           </motion.button>
//         </motion.div>

//         {/* Secondary Action */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.6 }}
//           className="text-center"
//         >
//           <button
//             onClick={handleViewSplitz}
//             className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors underline"
//           >
//             Go to My Splits
//           </button>
//         </motion.div>

//         {/* Additional Info */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.7 }}
//           className="mt-6 pt-6 border-t border-gray-200"
//         >
//           <div className="flex items-start gap-3 text-xs text-gray-600">
//             <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
//               <span className="text-blue-600 font-bold">i</span>
//             </div>
//             <p className="leading-relaxed">
//               Your split is now visible to other users within your specified radius. 
//               You'll receive notifications when people join or when the split is ready to proceed.
//             </p>
//           </div>
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }

// export default SplitzSuccessful;