import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {  UtensilsCrossed,  Users,  DollarSign,
  Zap,  Clock,  TrendingUp,  BookOpen,  Globe,  Briefcase,  MapPin,  Lock,  Eye,  Check, Plane,  Wrench,  Lightbulb,  FileInput,  Package,
  Headphones,  Hotel,  Truck,} from "lucide-react";
import { lazy} from "react";

const Loading = lazy(() => import("../Public/LoadingScreen"));

const steps = [
  {
    title: "What are you most interested in splitting?",
    description:
      "Select all the categories that apply to help us find you relevant splits nearby.",
    type: "multiple",
    options: [
      { id: "groceries", label: "Groceries", icon: UtensilsCrossed },
      { id: "rosca", label: "ROSCA (Esusu)", icon: Briefcase },
      { id: "car", label: "Car/Transport", icon: Truck },
      { id: "accommodation", label: "Accommodation", icon: Hotel },
      { id: "study", label: "Study Materials", icon: BookOpen },
      { id: "bills", label: "Utility Bills", icon: FileInput },
      { id: "bulk", label: "Bulk Purchase", icon: Package },
      { id: "subscriptions", label: "Subscriptions", icon: Headphones },
    ],
    input: "Other Interests",
    placeholder: "e.g. Pet supplies, Gym memberships",
  },
  {
    title: "What is your current situation?",
    description: "This helps us match you with relevant hyperlocal opportunities.",
    type: "single",
    options: [
      { id: "student", label: "Student", icon: BookOpen },
      { id: "immigrant", label: "New Immigrant", icon: Globe },
      { id: "traveler", label: "Traveler/Nomad", icon: Plane },
      { id: "professional", label: "Working Professional", icon: Briefcase },
      { id: "micro", label: "Micro Business", icon: Lightbulb },
      { id: "handymen", label: "Handyman", icon: Wrench },
      { id: "events", label: "Event Planner", icon: Zap },
      { id: "religious", label: "Religious Group", icon: Users },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Freelancer, Retiree",
  },
  {
    title: "What is most important to you when splitting costs?",
    description: "Choose your top 2 priorities.",
    type: "multiple-limited",
    limit: 2,
    options: [
      { id: "saving", label: "Saving Money", icon: DollarSign },
      { id: "convenience", label: "Convenience", icon: Clock },
      { id: "trust", label: "Trust / Reliability", icon: Check },
      { id: "location", label: "Nearby Location", icon: MapPin },
      { id: "flexibility", label: "Flexibility", icon: Zap },
      { id: "security", label: "Security", icon: Lock },
      { id: "transparency", label: "Transparency", icon: Eye },
      { id: "selection", label: "Flexible Selection", icon: TrendingUp },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Speed, Fairness",
  },
  {
    title: "What is your top goal for using Co-splitz?",
    description: "We'll customize your dashboard based on this motivation.",
    type: "single",
    options: [
      { id: "save", label: "Save Money", icon: DollarSign },
      { id: "meet", label: "Meet People", icon: Users },
      { id: "simplify", label: "Simplify Payments", icon: TrendingUp },
      { id: "share", label: "Share Resources", icon: Zap },
      { id: "crowdfunding", label: "Crowdfunding", icon: Lightbulb },
      { id: "time", label: "Time Saving", icon: Clock },
    ],
    input: "Other (if none apply):",
    placeholder: "e.g. Collaboration",
  },
];

const IconComponent = ({ IconType }) => (
  <IconType className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
);

export default function CoSplitzOnboarding() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [selections, setSelections] = useState(
    steps.map(() => ({ selected: [], other: "" }))
  );

  const step = steps[currentStep];
  const { selected, other } = selections[currentStep];

  const toggleSelection = (id) => {
    const newSelections = [...selections];
    let newSelected = [...selected];

    if (step.type === "single") {
      newSelected = [id];
    } else if (step.type === "multiple-limited") {
      if (newSelected.includes(id))
        newSelected = newSelected.filter((s) => s !== id);
      else if (newSelected.length < step.limit)
        newSelected.push(id);
    } else {
      if (newSelected.includes(id))
        newSelected = newSelected.filter((s) => s !== id);
      else newSelected.push(id);
    }

    newSelections[currentStep].selected = newSelected;
    setSelections(newSelections);
  };

  const handleOtherChange = (e) => {
    const newSelections = [...selections];
    newSelections[currentStep].other = e.target.value;
    setSelections(newSelections);
  };

  const isStepComplete = () => {
    if (step.type === "single") return selected.length === 1;
    if (step.type === "multiple-limited") return selected.length === step.limit;
    return selected.length > 0 || other.trim() !== "";
  };

  const handleContinue = () => {
    if (!isStepComplete()) return;

    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // COMPLETE → SHOW LOADING → NAVIGATE
      setIsLoading(true);
      setTimeout(() => navigate("/kyc-flow"), 1500);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // =======================
  //   LOADING SCREEN
  // =======================
  if (isLoading) {
    return (
     <>
     <Loading/>
     </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900">
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-xl mx-auto flex flex-col h-full">

          {/* Header */}
          <div className="mb-4">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="text-green-600 mb-2 flex items-center text-sm hover:text-green-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </button>
            )}

            <p className="text-green-600 text-xs font-medium mb-1">
              Step {currentStep + 1} of {steps.length}
            </p>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold mb-1">{step.title}</h1>
            <p className="text-gray-500 text-xs sm:text-sm mb-3">
              {step.description}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
              {step.options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleSelection(option.id)}
                    className={`p-3 rounded-lg border flex flex-col items-center transition ${
                      isSelected
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent IconType={option.icon} />
                    <span
                      className={`mt-1 text-xs sm:text-sm font-medium ${
                        isSelected ? "text-green-600" : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Input */}
            <div className="mb-2">
              <label className="text-xs sm:text-sm text-gray-700 mb-1 block">
                {step.input}
              </label>

              <input
                type="text"
                value={other}
                onChange={handleOtherChange}
                placeholder={step.placeholder}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-green-400 outline-none"
              />
            </div>
          </div>

          {/* Continue Button */}
          <div className="sticky bottom-0 bg-white pt-1">
            <button
              onClick={handleContinue}
              disabled={!isStepComplete()}
              className={`w-full py-3 rounded-lg font-medium text-sm transition ${
                isStepComplete()
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              {currentStep === steps.length - 1
                ? "Complete Setup"
                : `Continue${
                    selected.length > 0 ? ` (${selected.length})` : ""
                  }`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
