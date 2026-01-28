import { useState } from "react";
import { Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Overlay1 from "../../assets/Overlay.svg";
import Overlay2 from "../../assets/Overlay1.svg";
import Overlay3 from "../../assets/Overlay2.svg";
import Overlay4 from "../../assets/Overlay3.svg";
import { deals } from "../../Data/Alldata";
import ActiveSplits from "../../components/dashboard/AllSplit";

const categories = [
  { icon: Overlay1, label: "Split Expenses" },
  { icon: Overlay2, label: "Bulk Orders & Riders" },
  { icon: Overlay3, label: "Borrow/Lend" },
  { icon: Overlay4, label: "Crowdfund" },
];

export default function Main({ hidden }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Active");

  const CreateSplitz = () => {
    navigate("/dashboard/create-splitz");
  };

  return (
    <>
      <div className="flex flex-col gap-5 mt-10 md:mt-3 px-4">
        <section className={`transition-all duration-500 ease-in-out overflow-hidden${hidden ? "opacity-0 -translate-y-4 max-h-0 pointer-events-none":"opacity-100 translate-y-0 max-h-[500px]"}`}>         `}>
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Quick Access Categories
          </h2>

          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat, i) => (
              <button
                key={i}
                className="rounded-xl py-3 px-2 transition text-center hover:bg-gray-50"
              >
                <img
                  src={cat.icon}
                  alt={cat.label}
                  className="w-12 h-12 mx-auto mb-1.5"
                />
                <p className="text-[10px] font-medium text-gray-900">
                  {cat.label}
                </p>
              </button>
            ))}
          </div>
        </section>



      </div>

      {/* 💚 CREATE SPLITZ CTA */}
      <section className="flex flex-col md:px-0 px-4 mb-4">
        <div
          className="w-full bg-linear-to-r from-[#096A0F] to-[#1F8225]
          px-5 py-5 mt-5 flex flex-col sm:flex-row
          sm:justify-between sm:items-center gap-4"
        >
          <div className="flex flex-col text-white">
            <h1 className="text-base md:text-lg font-semibold">
              Have something to share?
            </h1>
            <p className="text-sm opacity-90">
              Start a splitz and find partners
            </p>
          </div>

          <button
            onClick={CreateSplitz}
            className="bg-white text-[#096A0F] w-full sm:w-36
            py-2.5 rounded-md text-sm font-medium shadow
            hover:bg-gray-50 transition"
          >
            Create Splitz
          </button>
        </div>
      </section>

      {/* 📊 ACTIVE SPLITS */}
      <div className="p-4">
        <ActiveSplits activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}
