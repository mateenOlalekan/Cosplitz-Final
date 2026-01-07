import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import onboard1 from "../../assets/onboard1.png";
import onboard2 from "../../assets/onboard2.png";
import onboard3 from "../../assets/onboard3.jpg";

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const pages = [
    {
      id: 1,
      image: onboard1,
      title: "Split Bills Easily",
      description:
        "Tired of awkward math at the table? Cosplitz makes it simple to divide expenses with friends.",
    },
    {
      id: 2,
      image: onboard2,
      title: "Fair for Everyone",
      description:
        "Everyone pays their fair share. Transparent and simple expense management.",
    },
    {
      id: 3,
      image: onboard3,
      title: "Start Your Journey",
      description:
        "Track balances, settle up, and stay organized — all in one place.",
    },
  ];

  const handleNext = () => {
    if (step < pages.length) setStep(step + 1);
    else navigate("/register");
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSkip = () => navigate("/register");

  const current = pages.find((p) => p.id === step);

  return (
    <div className="relative flex flex-col xl:flex-row h-screen w-full overflow-hidden  p-4 rounded-2xl">

      {/* Header */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-center p-10 z-20">
        {step > 1 ? (
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-700 hover:text-green-600 bg-white px-3 py-2 rounded-xl shadow-sm transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        ) : (
          <div />
        )}

        {step < pages.length ? (
          <button
            onClick={handleSkip}
            className="text-green-700 font-semibold hover:underline transition m-2"
          >
            Skip
          </button>
        ) : (
          <button
            onClick={() => navigate("/register")}
            className="text-green-700 font-semibold hover:underline transition m-2"
          >
            Sign Up
          </button>
        )}
      </div>

      {/* LEFT SECTION (Image) → visible ONLY on xl and above */}
      <div className="hidden xl:block w-1/2 h-full">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover rounded-xl transition-all duration-1000 ease-in-out hover:scale-105"
        />
      </div>

      {/* RIGHT SECTION */}
      <div className="flex-1 flex justify-center items-center px-4 lg:px-10 w-full h-screen bg-white">
        <div className=" w-full  max-w-lg p-8 md:p-1 rounded-2xl  text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {current.title}
          </h1>

          <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
            {current.description}
          </p>

          <button
            onClick={handleNext}
            className="bg-green-600 text-white w-full text-lg px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all"
          >
            {step === pages.length ? "Sign Up" : "Next"}
          </button>

          {/* Progress Dots */}
          <div className="flex gap-2 mt-6 justify-center">
            {pages.map((p) => (
              <div
                key={p.id}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  step === p.id ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
