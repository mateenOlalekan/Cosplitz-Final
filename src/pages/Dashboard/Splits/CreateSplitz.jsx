// import { useState, useEffect } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ChevronLeft, Camera, Calendar, AlertCircle, Shield } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// import useSplitStore from '../../../store/splitStore';
// import useAuthStore from '../../../store/authStore';
// import { SplitFormSchema } from '../../../schemas/splitSchemas';

// const CreateSplitzPage = () => {
//   const navigate = useNavigate();

//   // ✅ Zustand actions
//   const createSplit = useSplitStore((state) => state.createSplit);
//   const isLoading = useSplitStore((state) => state.isLoading);

//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState('');
//   const [includeMe, setIncludeMe] = useState(true);
//   const [participantsCount, setParticipantsCount] = useState(1);

//   const {register,handleSubmit,formState: { errors, isSubmitting }, watch,setValue, reset,} = useForm({
//     resolver: zodResolver(SplitFormSchema),
//     defaultValues: {
//       title: '',
//       category: '',
//       split_method: 'SpecificAmounts',
//       start_date: new Date().toISOString().split('T')[0],
//       end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
//         .toISOString()
//         .split('T')[0],
//       location: '',
//       amount: 1000,
//       max_participants: 1,
//       visibility_radius: 5,
//       rules:
//         'Mandatory Refund Rule: A 5% charge applies if the split is canceled before 70% participation.',
//       description: '',
//     },
//   });

//   const categories = [
//     { value: '', label: 'Select Category' },
//     { value: 'Housing', label: 'Housing' },
//     { value: 'Food & Groceries', label: 'Food & Groceries' },
//     { value: 'Transportation', label: 'Transportation' },
//     { value: 'Events & Tickets', label: 'Events & Tickets' },
//     { value: 'Utilities', label: 'Utilities' },
//     { value: 'Entertainment', label: 'Entertainment' },
//     { value: 'Other', label: 'Other' },
//   ];

//   const splitMethods = [
//     {
//       value: 'SpecificAmounts',
//       label: 'Equal Split',
//       description: 'All participants pay the same amount',
//     },
//     {
//       value: 'CustomAmounts',
//       label: 'Custom Split',
//       description: 'Set custom amounts for each participant',
//     },
//     {
//       value: 'Percentage',
//       label: 'Percentage Split',
//       description: 'Split by percentage allocation',
//     },
//   ];

//   const handleFileUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setImageFile(file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   // ✅ UPDATED SUBMIT - Navigate to success page with split data
//   const onSubmit = async (data) => {
//     try {
//       const totalParticipants = includeMe
//         ? participantsCount + 1
//         : participantsCount;

//       const formData = new FormData();

//       Object.entries({
//         title: data.title,
//         category: data.category,
//         split_method: data.split_method,
//         start_date: data.start_date,
//         end_date: data.end_date,
//         location: data.location,
//         amount: data.amount,
//         max_participants: totalParticipants,
//         visibility_radius: data.visibility_radius,
//         rules: data.rules,
//         description: data.description,
//       }).forEach(([key, value]) => {
//         if (value !== undefined && value !== null) {
//           formData.append(key, value.toString());
//         }
//       });

//       if (imageFile) {
//         formData.append('image', imageFile);
//       }

//       // Create the split and get the result
//       const newSplit = await createSplit(formData);

//       // Reset form
//       reset();
//       setImageFile(null);
//       setImagePreview('');
//       setParticipantsCount(1);

//       // Navigate to success page with split data
//       navigate('/dashboard/splitz-success', { 
//         state: { split: newSplit },
//         replace: true 
//       });
//     } catch (err) {
//       alert(err.message || 'Failed to create split');
//     }
//   };

//   const gotoAllTasks = () => {
//     navigate('/dashboard/allsplits');
//   };

//   const selectedSplitMethod = watch('split_method');

//   useEffect(() => {
//     return () => {
//       if (imagePreview) {
//         URL.revokeObjectURL(imagePreview);
//       }
//     };
//   }, [imagePreview]);

//   return (
//     <div className="min-h-screen bg-gray-50 px-3 sm:px-6 lg:px-8 py-6">
//       <main className="max-w-3xl mx-auto space-y-6">
//         <div className="flex justify-between items-center mb-6">
//           <button
//             onClick={gotoAllTasks}
//             className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-sm sm:text-base"
//           >
//             <ChevronLeft size={18} /> <span>Back to Splits</span>
//           </button>
//           <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center flex-1">
//             Create New Split
//           </h1>
//           <div className="w-6 sm:w-8 md:w-10" />
//         </div>

//         {/* 🔒 UI BELOW IS 100% UNCHANGED */}
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//           {/* Section: What are you splitting */}
//           <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">What are you splitting?</h2>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Split Title *</label>
//               <input
//                 type="text"
//                 placeholder="e.g. Shared Costco Groceries"
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//                   errors.title ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 {...register('title')}
//               />
//               {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Split Type/Category *</label>
//               <select
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
//                   errors.category ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 {...register('category')}
//               >
//                 {categories.map((option) => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>
//               {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
//               <textarea
//                 placeholder="Describe what this split is about..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                 rows="3"
//                 {...register('description')}
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Image/Photo (Optional)
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-500 transition cursor-pointer">
//                 <label className="flex flex-col items-center gap-4 cursor-pointer">
//                   <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
//                     <Camera size={24} className="text-gray-400" />
//                   </div>
//                   <div className="text-center">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       onChange={handleFileUpload}
//                       className="hidden"
//                     />
//                     <div>
//                       <span className="text-green-600 font-medium">Choose File</span>
//                       <p className="text-sm text-gray-500 mt-1">
//                         PNG, JPG, GIF up to 10MB
//                       </p>
//                     </div>
//                   </div>
//                 </label>
//               </div>
//               {imagePreview && (
//                 <div className="mt-3">
//                   <img
//                     src={imagePreview}
//                     alt="Preview"
//                     className="h-48 w-full object-cover rounded-lg"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setImageFile(null);
//                       setImagePreview('');
//                     }}
//                     className="mt-2 text-sm text-red-600 hover:text-red-800"
//                   >
//                     Remove image
//                   </button>
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* Section: Cost & Participants */}
//           <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Cost and Participants</h2>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (₦) *</label>
//               <input
//                 type="number"
//                 min="1"
//                 step="0.01"
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
//                   errors.amount ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 {...register('amount', { valueAsNumber: true })}
//               />
//               {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Participants Needed (excluding you)
//               </label>
//               <input
//                 type="number"
//                 value={participantsCount}
//                 onChange={(e) => setParticipantsCount(Math.max(0, parseInt(e.target.value) || 0))}
//                 min="0"
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//               />
//               <p className="mt-1 text-sm text-gray-500">
//                 Total participants: {includeMe ? participantsCount + 1 : participantsCount}
//               </p>
//             </div>
            
//             <div className="space-y-3">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Split Method *</label>
//               {splitMethods.map((method) => (
//                 <button
//                   key={method.value}
//                   type="button"
//                   onClick={() => setValue('split_method', method.value)}
//                   className={`w-full p-4 border-2 rounded-lg text-left transition ${
//                     selectedSplitMethod === method.value
//                       ? 'border-green-600 bg-green-50'
//                       : 'border-gray-300 hover:border-gray-400'
//                   }`}
//                 >
//                   <div className="flex items-center gap-3 mb-1">
//                     <div
//                       className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
//                         selectedSplitMethod === method.value
//                           ? 'bg-green-600 border-green-600'
//                           : 'border-gray-400'
//                       }`}
//                     >
//                       {selectedSplitMethod === method.value && (
//                         <div className="w-2 h-2 bg-white rounded-full"></div>
//                       )}
//                     </div>
//                     <span className="font-medium text-gray-900 text-sm sm:text-base">
//                       {method.label}
//                     </span>
//                   </div>
//                   <p className="text-xs text-gray-600 ml-8">{method.description}</p>
//                 </button>
//               ))}
//             </div>
            
//             <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
//               <input
//                 type="checkbox"
//                 checked={includeMe}
//                 onChange={(e) => setIncludeMe(e.target.checked)}
//                 className="w-5 h-5 accent-green-600 rounded cursor-pointer"
//                 id="include-me"
//               />
//               <label htmlFor="include-me" className="text-sm font-medium text-gray-700 cursor-pointer">
//                 I want to be part of the split
//               </label>
//             </div>
//           </section>

//           {/* Section: Start & End Period */}
//           <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                 <Calendar size={20} /> Start & End Period
//               </h2>
//             </div>
            
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
//                 <input
//                   type="date"
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
//                     errors.start_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   {...register('start_date')}
//                 />
//                 {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
//               </div>
              
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
//                 <input
//                   type="date"
//                   className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
//                     errors.end_date ? 'border-red-500' : 'border-gray-300'
//                   }`}
//                   {...register('end_date')}
//                 />
//                 {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
//               </div>
//             </div>
//           </section>

//           {/* Section: Location & Visibility */}
//           <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Location and Visibility</h2>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Split Location *</label>
//               <input
//                 type="text"
//                 placeholder="e.g., Computer Village, Ikeja, Lagos"
//                 className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
//                   errors.location ? 'border-red-500' : 'border-gray-300'
//                 }`}
//                 {...register('location')}
//               />
//               {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Visibility Radius: {watch('visibility_radius')} km
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="10"
//                 step="1"
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
//                 {...register('visibility_radius', { valueAsNumber: true })}
//               />
//               <div className="flex justify-between text-xs text-gray-500 mt-1">
//                 <span>0 km</span>
//                 <span>10 km</span>
//               </div>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Rules (Optional)</label>
//               <textarea
//                 placeholder="Set any rules or conditions for this split..."
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
//                 rows="3"
//                 {...register('rules')}
//               />
//             </div>
//           </section>

//           {/* Section: Rules & Safety */}
//           <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//             <div className="mb-4">
//               <h2 className="text-lg font-semibold text-gray-900">Safety Information</h2>
//             </div>
            
//             <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded flex items-start gap-3">
//               <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
//               <div>
//                 <h4 className="font-semibold text-red-700 text-sm mb-1">Mandatory Refund Rule</h4>
//                 <p className="text-xs text-red-600">A 5% charge applies if the split is canceled before 70% participation.</p>
//               </div>
//             </div>
            
//             <div className="p-4 border-l-4 border-green-600 bg-green-50 rounded flex items-start gap-3">
//               <Shield size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
//               <div>
//                 <h4 className="font-semibold text-green-700 text-sm mb-1">Secure Payment Protection</h4>
//                 <p className="text-xs text-green-600">All payments are protected and released only when conditions are met.</p>
//               </div>
//             </div>
//           </section>
          
//             <button
//               type="submit"
//               disabled={isSubmitting || isLoading}
//               className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
//             >
//               {isSubmitting || isLoading ? 'Creating Split...' : 'Create Split'}
//             </button>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default CreateSplitzPage;