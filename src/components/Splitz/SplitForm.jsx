// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { 
//   Camera, 
//   Calendar, 
//   AlertCircle, 
//   Shield,
//   X
// } from 'lucide-react';
// import { SplitFormSchema } from '../../schemas/splitSchemas';
// import { validateImageFile } from '../../formDataUtils';

// const SplitForm = ({ 
//   initialData = {}, 
//   onSubmit, 
//   isLoading = false, 
//   submitButtonText = "Create Splittz",
//   isEditMode = false 
// }) => {
//   const [imageFile, setImageFile] = useState(null);
//   const [imagePreview, setImagePreview] = useState(initialData.image_url || '');
//   const [includeMe, setIncludeMe] = useState(true);
//   const [participantsCount, setParticipantsCount] = useState(initialData.max_participants || 4);
//   const [formError, setFormError] = useState('');

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//     setValue,
//     reset
//   } = useForm({
//     resolver: zodResolver(SplitFormSchema),
//     defaultValues: {
//       title: initialData.title || '',
//       category: initialData.category || '',
//       split_method: initialData.split_method || 'SpecificAmounts',
//       start_date: initialData.start_date || new Date().toISOString().split('T')[0],
//       end_date: initialData.end_date || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
//       location: initialData.location || '',
//       amount: initialData.amount || 0,
//       max_participants: initialData.max_participants || 4,
//       visibility_radius: initialData.visibility_radius || 5,
//       rules: initialData.rules || 'Mandatory Refund Rule: A 5% charge applies if the split is canceled before 70% participation.',
//       description: initialData.description || '',
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
//     { value: 'SpecificAmounts', label: 'Equal Split', description: 'All participants pay the same amount' },
//     { value: 'CustomAmounts', label: 'Custom Split', description: 'Set custom amounts for each participant' },
//     { value: 'Percentage', label: 'Percentage Split', description: 'Split by percentage allocation' },
//   ];

//   const handleFileUpload = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     const validation = validateImageFile(file);
//     if (!validation.isValid) {
//       alert(validation.errors.join(', '));
//       return;
//     }

//     setImageFile(file);
//     const previewUrl = URL.createObjectURL(file);
//     setImagePreview(previewUrl);
//     setFormError('');
//   };

//   const handleRemoveImage = () => {
//     setImageFile(null);
//     setImagePreview('');
//     // If in edit mode and there was a previous image, we might want to mark it for deletion
//     if (initialData.image_url) {
//       setValue('remove_image', true);
//     }
//   };

//   const handleFormSubmit = async (data) => {
//     try {
//       setFormError('');
      
//       // Calculate final participants count
//       const finalParticipants = includeMe 
//         ? Math.max(1, participantsCount - 1)
//         : participantsCount;

//       // Prepare form data
//       const formData = new FormData();
      
//       // Append all form fields
//       formData.append('title', data.title);
//       formData.append('category', data.category);
//       formData.append('split_method', data.split_method);
//       formData.append('start_date', data.start_date);
//       formData.append('end_date', data.end_date);
//       formData.append('location', data.location);
//       formData.append('amount', data.amount.toString());
//       formData.append('max_participants', finalParticipants.toString());
//       formData.append('visibility_radius', data.visibility_radius.toString());
//       formData.append('rules', data.rules || '');
      
//       if (data.description) {
//         formData.append('description', data.description);
//       }
      
//       // Append image if exists
//       if (imageFile) {
//         formData.append('image', imageFile);
//       }
      
//       // If removing image in edit mode
//       if (data.remove_image && isEditMode) {
//         formData.append('remove_image', 'true');
//       }

//       await onSubmit(formData);
      
//     } catch (error) {
//       setFormError(error.message || 'Failed to save split');
//     }
//   };

//   const selectedSplitMethod = watch('split_method');
//   const amount = watch('amount');
//   const visibilityRadius = watch('visibility_radius');

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN',
//       minimumFractionDigits: 0,
//     }).format(value || 0);
//   };

//   return (
//     <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" encType="multipart/form-data">
//       {formError && (
//         <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
//           <div className="flex items-center gap-2">
//             <AlertCircle size={18} className="text-red-500" />
//             <p className="text-red-700 font-medium">{formError}</p>
//           </div>
//         </div>
//       )}

//       {/* Section: What are you splitting */}
//       <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">What are you splitting?</h2>
//           {isEditMode && <p className="text-sm text-gray-500 mt-1">Update your split details</p>}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Split Title <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             placeholder="e.g. Shared Costco Groceries"
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//               errors.title ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//             }`}
//             {...register('title')}
//           />
//           {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Split Type/Category <span className="text-red-500">*</span>
//           </label>
//           <select
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//               errors.category ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//             }`}
//             {...register('category')}
//           >
//             {categories.map((option) => (
//               <option key={option.value} value={option.value}>
//                 {option.label}
//               </option>
//             ))}
//           </select>
//           {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
//           <textarea
//             placeholder="Describe what this split is about..."
//             rows="3"
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//               errors.description ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//             }`}
//             {...register('description')}
//           />
//           <p className="mt-1 text-xs text-gray-500">
//             Max 1000 characters. {(watch('description') || '').length}/1000
//           </p>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Image/Photo (Optional)
//           </label>
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-green-500 transition cursor-pointer">
//             <label className="flex items-center gap-4 cursor-pointer">
//               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
//                 <Camera size={20} className="text-gray-400" />
//               </div>
//               <div className="flex-1">
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileUpload}
//                   className="hidden"
//                 />
//                 <div>
//                   <span className="text-green-600 font-medium">Choose File</span>
//                   <p className="text-sm text-gray-500 mt-1">
//                     PNG, JPG, GIF up to 10MB
//                   </p>
//                 </div>
//               </div>
//             </label>
//           </div>
          
//           {imagePreview && (
//             <div className="mt-3 relative group">
//               <img
//                 src={imagePreview}
//                 alt="Preview"
//                 className="h-48 w-full object-cover rounded-lg"
//               />
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//               >
//                 <X size={16} />
//               </button>
//               <button
//                 type="button"
//                 onClick={handleRemoveImage}
//                 className="mt-2 text-sm text-red-600 hover:text-red-800"
//               >
//                 Remove image
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Section: Cost & Participants */}
//       <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Cost and Participants</h2>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Total Amount (₦) <span className="text-red-500">*</span>
//           </label>
//           <div className="relative">
//             <input
//               type="number"
//               step="0.01"
//               min="100"
//               max="10000000"
//               className={`w-full px-4 py-2 pl-8 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//                 errors.amount ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//               }`}
//               {...register('amount', { valueAsNumber: true })}
//             />
//             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
//           </div>
//           {errors.amount ? (
//             <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
//           ) : (
//             <p className="mt-1 text-sm text-gray-500">
//               Total: {formatCurrency(amount)}
//             </p>
//           )}
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Participants Needed (excluding you)
//           </label>
//           <input
//             type="number"
//             value={participantsCount}
//             onChange={(e) => setParticipantsCount(Math.max(1, parseInt(e.target.value) || 1))}
//             min={1}
//             max={100}
//             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition hover:border-gray-400"
//           />
//           <p className="mt-1 text-sm text-gray-500">
//             Total participants (including you): {includeMe ? participantsCount + 1 : participantsCount}
//           </p>
//         </div>
        
//         <div className="space-y-3">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Split Method <span className="text-red-500">*</span>
//           </label>
//           {splitMethods.map((method) => (
//             <button
//               key={method.value}
//               type="button"
//               onClick={() => setValue('split_method', method.value)}
//               className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
//                 selectedSplitMethod === method.value
//                   ? 'border-green-600 bg-green-50'
//                   : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
//               }`}
//             >
//               <div className="flex items-center gap-2 mb-1">
//                 <div
//                   className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
//                     selectedSplitMethod === method.value
//                       ? 'bg-green-600 border-green-600'
//                       : 'border-gray-400'
//                   }`}
//                 >
//                   {selectedSplitMethod === method.value && (
//                     <div className="w-1.5 h-1.5 bg-white rounded-full" />
//                   )}
//                 </div>
//                 <span className="font-medium text-gray-900 text-sm sm:text-base">
//                   {method.label}
//                 </span>
//               </div>
//               <p className="text-xs text-gray-600 ml-6">{method.description}</p>
//             </button>
//           ))}
//           {errors.split_method && (
//             <p className="text-sm text-red-600">{errors.split_method.message}</p>
//           )}
//         </div>
        
//         <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition">
//           <input
//             type="checkbox"
//             id="includeMe"
//             checked={includeMe}
//             onChange={(e) => setIncludeMe(e.target.checked)}
//             className="w-4 h-4 accent-green-600 rounded cursor-pointer"
//           />
//           <label htmlFor="includeMe" className="text-sm font-medium text-gray-700 cursor-pointer">
//             I want to be part of the split
//           </label>
//         </div>
//       </section>

//       {/* Section: Start & End Period */}
//       <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Start & End Period</h2>
//         </div>
        
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <Calendar size={16} /> Start Date <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="date"
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//                 errors.start_date ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//               }`}
//               {...register('start_date')}
//             />
//             {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
//               <Calendar size={16} /> End Date <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="date"
//               className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//                 errors.end_date ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//               }`}
//               {...register('end_date')}
//             />
//             {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
//           </div>
//         </div>
//       </section>

//       {/* Section: Location & Visibility */}
//       <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Location and Visibility</h2>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Split Location <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="text"
//             placeholder="Computer Village, Ikeja, Lagos"
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//               errors.location ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//             }`}
//             {...register('location')}
//           />
//           {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
//         </div>
        
//         <div>
//           <div className="flex justify-between items-center mb-2">
//             <label className="block text-sm font-medium text-gray-700">
//               Visibility Radius
//             </label>
//             <span className="text-sm font-medium text-green-600">
//               {visibilityRadius} km
//             </span>
//           </div>
//           <input
//             type="range"
//             min="0"
//             max="10"
//             step="0.5"
//             className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600"
//             {...register('visibility_radius', { valueAsNumber: true })}
//           />
//           <div className="flex justify-between text-xs text-gray-500 mt-1">
//             <span>Local (0km)</span>
//             <span>City-wide (10km)</span>
//           </div>
//           {errors.visibility_radius && (
//             <p className="mt-1 text-sm text-red-600">{errors.visibility_radius.message}</p>
//           )}
//         </div>
//       </section>

//       {/* Section: Rules & Safety */}
//       <section className="p-6 rounded-xl shadow-sm bg-white space-y-6">
//         <div className="mb-4">
//           <h2 className="text-lg font-semibold text-gray-900">Rules and Safety</h2>
//         </div>
        
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Split Rules (Optional)
//           </label>
//           <textarea
//             placeholder="Enter any specific rules for this split..."
//             rows="3"
//             className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition ${
//               errors.rules ? 'border-red-500' : 'border-gray-300 hover:border-gray-400'
//             }`}
//             {...register('rules')}
//           />
//           <p className="mt-1 text-xs text-gray-500">
//             Max 500 characters. {(watch('rules') || '').length}/500
//           </p>
//         </div>
        
//         <div className="space-y-4">
//           <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded flex items-start gap-3">
//             <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <h4 className="font-semibold text-red-700 text-sm mb-1">Mandatory Refund Rule</h4>
//               <p className="text-xs text-red-600">
//                 A 5% charge applies if the split is canceled before 70% participation.
//               </p>
//             </div>
//           </div>
          
//           <div className="p-4 border-l-4 border-green-600 bg-green-50 rounded flex items-start gap-3">
//             <Shield size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <h4 className="font-semibold text-green-700 text-sm mb-1">Secure Payment Protection</h4>
//               <p className="text-xs text-green-600">
//                 Always active for verified users. Funds are held securely until split completion.
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Form Actions */}
//       <div className="space-y-4">
//         {isEditMode && (
//           <button
//             type="button"
//             onClick={() => reset()}
//             className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
//           >
//             Reset Changes
//           </button>
//         )}
        
//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           {isLoading ? (
//             <>
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               Processing...
//             </>
//           ) : (
//             submitButtonText
//           )}
//         </button>
        
//         {isEditMode && (
//           <p className="text-center text-sm text-gray-500">
//             Note: Changes may take a few moments to reflect
//           </p>
//         )}
//       </div>
//     </form>
//   );
// };

// export default SplitForm;