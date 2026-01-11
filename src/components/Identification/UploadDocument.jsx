// import React, { useEffect, useState } from "react";
// import { ChevronRight, Upload } from "lucide-react";
// import { useDocumentStore } from "../../store/kycStore";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { uploadDocumentSchema } from "./Schema";

// function UploadDocument({ next, prev }) {
//   const { files, updateFile } = useDocumentStore();
//   const [openDropdown, setOpenDropdown] = useState(null);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: zodResolver(uploadDocumentSchema),
//     defaultValues: {
//       driversId: files.driversId ?? null,
//       passport: files.passport ?? null,
//       nationalId: files.nationalId ?? null,
//     },
//   });

//   // Sync Zustand -> RHF
//   useEffect(() => {
//     reset({
//       driversId: files.driversId ?? null,
//       passport: files.passport ?? null,
//       nationalId: files.nationalId ?? null,
//     });
//   }, [files, reset]);

//   const watchedDrivers = watch("driversId");
//   const watchedPassport = watch("passport");
//   const watchedNational = watch("nationalId");

//   const onFileChange = (key, e) => {
//     const file = e.target.files && e.target.files[0] ? e.target.files[0] : null;
//     setValue(key, file, { shouldValidate: true });
//     updateFile(key, file);
//   };

//   const onSubmit = () => {
//     next();
//   };

//   const items = [
//     { label: "Driver's License", key: "driversId", file: watchedDrivers },
//     { label: "International Passport", key: "passport", file: watchedPassport },
//     { label: "National ID Card", key: "nationalId", file: watchedNational },
//   ];

//   return (
//     <div className="w-full flex justify-center items-center bg-white px-4 py-6">
//       <div className="w-full max-w-xl flex flex-col gap-6">
//         <h1 className="text-lg font-bold">Select a document type below to confirm your identity</h1>

//         <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
//           {items.map((item) => (
//             <div key={item.key} className="rounded-xl border">
//               {/* Header */}
//               <button
//                 type="button"
//                 onClick={() => setOpenDropdown(openDropdown === item.key ? null : item.key)}
//                 className="w-full flex items-center justify-between px-4 py-3"
//               >
//                 <span className="text-base font-semibold text-gray-800">{item.label}</span>
//                 <ChevronRight
//                   className={`transition-transform duration-300 ${openDropdown === item.key ? "rotate-90" : ""}`}
//                 />
//               </button>

//               {/* Dropdown / Upload area */}
//               {openDropdown === item.key && (
//                 <div className="px-4 pb-3 flex flex-col gap-2">
//                   <label className="flex flex-col w-60 items-center gap-3 border-2 border-gray-300 rounded-lg p-4 cursor-pointer hover:border-green-500 transition-colors">
//                     <input
//                       id={`input-${item.key}`}
//                       type="file"
//                       className="hidden"
//                       accept=".png,.jpg,.jpeg,.pdf"
//                       onChange={(e) => onFileChange(item.key, e)}
//                     />
//                     <div className="w-full flex justify-center items-center">
                       
//                     </div>
//                     <div
//                       className="w-12 h-12 rounded-full bg-green-100 flex justify-center items-center cursor-pointer"
//                       onClick={() => document.getElementById(`input-${item.key}`).click()}
//                     >
//                       <Upload className="text-green-700" />
//                     </div>
//                     <span className="text-sm text-gray-600">Click the icon to upload {item.label}</span>
//                   </label>

//                   {item.file && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       Uploaded: <span className="font-medium text-gray-700">{item.file.name}</span>
//                     </p>
//                   )}

//                   {errors[item.key] && (
//                     <p className="text-red-500 text-xs">{errors[item.key]?.message}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           ))}

//           {/* Buttons */}
//           <div className="flex justify-between mt-4 gap-3">
//             <button
//               type="button"
//               onClick={prev}
//               className="flex-1 bg-white py-2 rounded-md text-[#1F8225] border border-[#1F8225]"
//             >
//               Previous
//             </button>

//             <button type="submit" className="flex-1 bg-[#1F8225] text-white py-2 rounded-md">
//               Next
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default UploadDocument;
