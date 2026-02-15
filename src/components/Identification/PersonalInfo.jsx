import { useState } from "react";
import { User, Mail, Globe, AlertCircle } from "lucide-react";

/* -------------------- Reusable Input Field -------------------- */
const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  placeholder,
  formData,
  errors,
  touched,
  handleChange,
  handleBlur
}) => (
  <div className="flex flex-col gap-1">
    <label className="font-medium text-sm text-gray-700 flex items-center gap-1">
      {label} <span className="text-red-500">*</span>
    </label>

    <div className="relative group">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-green-600 transition-colors">
        <Icon size={18} />
      </div>

      <input
        name={name}
        type={type}
        value={formData[name] || ""}
        onChange={handleChange}
        onBlur={() => handleBlur(name)}
        autoComplete="off"
        className="w-full border border-gray-300 p-3 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 text-sm"
        placeholder={placeholder}
      />
    </div>

    {touched[name] && errors[name] && (
      <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
        <AlertCircle size={12} />
        <span>{errors[name]}</span>
      </div>
    )}
  </div>
);

/* -------------------- Main Component -------------------- */
function PersonalInfoPage({ next }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    nationality: ""
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* -------------------- Handle Change -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Optional: Text only for names + nationality
    if (["firstName", "lastName", "nationality"].includes(name)) {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  /* -------------------- Handle Blur -------------------- */
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  /* -------------------- Validation -------------------- */
  const validateField = (field, value) => {
    let error = "";

    switch (field) {
      case "firstName":
      case "lastName":
      case "nationality":
        if (!value.trim()) {
          error = `${field.replace(/([A-Z])/g, " $1")} is required`;
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Please enter a valid email address";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ["firstName", "lastName", "email", "nationality"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    return isValid;
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      nationality: true
    });

    if (validateForm()) {
      localStorage.setItem("kycPersonalInfo", JSON.stringify(formData));
      next();
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="w-full flex justify-center items-center py-4 px-4 sm:px-6">
      <div className="w-full max-w-4xl flex flex-col">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="text-green-600" size={20} />
            Personal Information
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Please provide your personal details for verification
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <InputField
              label="First Name"
              name="firstName"
              icon={User}
              placeholder="John"
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />

            <InputField
              label="Last Name"
              name="lastName"
              icon={User}
              placeholder="Doe"
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          </div>

          <InputField
            label="Email Address"
            name="email"
            type="email"
            icon={Mail}
            placeholder="john.doe@example.com"
            formData={formData}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
          />

          <InputField
            label="Nationality"
            name="nationality"
            icon={Globe}
            placeholder="United States"
            formData={formData}
            errors={errors}
            touched={touched}
            handleChange={handleChange}
            handleBlur={handleBlur}
          />

          <div className="flex justify-end mt-2 sm:mt-4">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              Continue
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PersonalInfoPage;