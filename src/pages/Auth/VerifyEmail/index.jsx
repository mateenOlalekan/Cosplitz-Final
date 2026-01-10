import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import logo from "../../../assets/newlogo.svg";
import LeftPanel from "../../../components/Home/LeftPanel";

// === ZOD VALIDATION SCHEMA ===
const schema = z.object({
  code: z
    .string()
    .min(6, "Code must be 6 digits")
    .max(6, "Code must be 6 digits")
    .regex(/^[0-9]+$/, "Only numbers are allowed"),
});

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // === REACT-HOOK-FORM SETUP ===
  const {
    handleSubmit,
    formState: { isSubmitting },
    setValue,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { code: "" },
  });

  // === HANDLERS ===
  const handleChange = (e, index) => {
    const value = e.target.value.slice(-1);
    if (!/^[0-9]?$/.test(value)) return;

    const updatedCode = [...code];
    updatedCode[index] = value;
    setCode(updatedCode);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    setValue("code", updatedCode.join(""));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const onSubmit = (data) => {
    // TODO: Implement email verification API call
    alert("Verification Successful!");
  };

  const handleResend = () => {
    alert("Verification code resent to your email!");
  };

  return (
    <div className="flex bg-[#F7F5F9] w-full h-screen justify-center overflow-hidden md:px-6 md:py-4 rounded-2xl">
      <div className="flex max-w-screen-2xl w-full h-full rounded-xl overflow-hidden">
      {/* === LEFT SIDE === */}
      <LeftPanel/>
      {/* === RIGHT SIDE === */}
      <div className="flex w-full lg:w-1/2 flex-col justify-start lg:justify-center items-center bg-white overflow-y-auto px-4 sm:px-8 md:px-14 lg:px-20 py-8 relative">

        {/* Logo */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8">
          <img src={logo} alt="Logo" className="w-20 sm:w-24 md:w-28" />
        </div>

        {/* Header */}
        <div className="w-full max-w-md text-center mt-24 sm:mt-28 md:mt-32 mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            Verify your email
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mt-2 leading-relaxed">
            Please enter the 6-digit verification code sent to your email.
            <span className="block font-semibold text-gray-700 mt-1 break-all">
              (ayomideakorede0@gmail.com)
            </span>
          </p>
        </div>

        {/* === FORM === */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md space-y-8"
          noValidate
        >
          {/* 6-DIGIT INPUT */}
          <div className="grid grid-cols-6 gap-2 sm:gap-3 md:gap-4 px-4 sm:px-0">
            {code.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                maxLength="1"
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="
                  w-full aspect-square min-w-[44px]
                  text-center border border-gray-300 rounded-lg 
                  text-lg sm:text-xl font-semibold 
                  focus:outline-none focus:ring-2 focus:ring-[#1F8225]
                "
              />
            ))}
          </div>

          {/* TIMER + RESEND */}
          <div className="text-center space-y-2 px-2">
            <p className="text-gray-600 text-sm sm:text-base">
              Resend available in{" "}
              <span className="text-[#1F8225] font-medium">60s</span>
            </p>
            <button
              type="button"
              onClick={handleResend}
              className="text-[#1F8225] font-semibold hover:underline text-sm sm:text-base"
            >
              Didn’t receive code? Resend
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isSubmitting || code.join("").length < 6}
            className="
              w-full rounded-xl bg-[#1F8225] text-white py-3 
              font-medium hover:bg-[#1F8225]/10 transition duration-300 
              disabled:opacity-70 text-sm sm:text-base
            "
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>

          <div className="flex justify-center items-center px-4">
            <p className="text-center text-sm sm:text-base">
              Note that this code is valid for{" "}
              <span className="text-[#E60000] font-semibold">5 minutes</span>
            </p>
          </div>
        </form>

      </div>
      </div>
    </div>
  );
}
