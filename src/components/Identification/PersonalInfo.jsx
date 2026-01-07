import React, { useEffect } from "react";
import { usePersonalInfo } from "../../store/kycStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "./Schema";

function PersonalInfoPage({ next }) {
  const { data, updateField } = usePersonalInfo();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: data,
  });

  // keep RHF in sync with Zustand (Zustand -> RHF)
  useEffect(() => {
    reset(data);
  }, [data, reset]);

  const handleFieldChange = (field, value) => {
    setValue(field, value, { shouldValidate: true });
    updateField(field, value);
  };

  const onSubmit = (values) => {
    // values are already mirrored into Zustand via handleFieldChange
    // proceed to next step
    next();
  };

  return (
    <div className="w-full flex justify-center items-center mt-6">
      <div className="w-full max-w-lg flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:gap-2 gap-6">
          {/* First Name */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              {...register("firstName")}
              onChange={(e) => handleFieldChange("firstName", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              {...register("lastName")}
              onChange={(e) => handleFieldChange("lastName", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              {...register("email")}
              onChange={(e) => handleFieldChange("email", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.email.message}</p>
            )}
          </div>

          {/* Nationality */}
          <div className="flex flex-col">
            <label className="font-medium text-sm">
              Nationality <span className="text-red-600">*</span>
            </label>
            <input
              {...register("nationality")}
              onChange={(e) => handleFieldChange("nationality", e.target.value)}
              className="border p-2 rounded focus:border-green-600 focus:outline-none text-sm"
              placeholder="Enter nationality"
            />
            {errors.nationality && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.nationality.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">


            <button
              type="submit"
              className="flex-1 bg-[#1F8225] text-white py-2 rounded-md"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalInfoPage;
