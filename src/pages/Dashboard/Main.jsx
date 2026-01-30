// src/pages/Dashboard/Main.jsx
import { useState } from "react";
import { useOutletContext } from "react-router-dom";  // ✅ Import this
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

export default function Main() {
  const { isSearchFocused } = useOutletContext();  // ✅ Get from context
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Active");

  const CreateSplitz = () => {
    navigate("/dashboard/create-splitz");
  };

  return (
    <>
      <div className="flex flex-col gap-5 mt-10 md:mt-3 px-4">
        {/* Quick Access Categories - Hidden when search focused */}
        {!isSearchFocused && (
          <section className="flex flex-col gap-3 transition-all duration-300">
            <h2 className="text-base font-semibold text-gray-900">
              Quick Access Categories
            </h2>
            <div className="">
              {categories.map((cat, i) => (
                <button
                  key={i}
                  className="rounded-xl py-3 px-2 transition text-center"
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
        )}

        {/* Special Deals - Hidden when search focused */}
        {!isSearchFocused && (
          <section className="flex flex-col gap-4 transition-all duration-300">
            <h2 className="text-lg font-bold text-gray-900">#SpecialForYou</h2>

            <div className="carousel carousel-end rounded-box gap-3 overflow-x-auto">
              {deals.map((deal, idx) => (
                <div
                  key={idx}
                  className="carousel-item relative flex bg-[#1F8225] flex-col justify-between
                  rounded-2xl overflow-hidden text-white shadow-lg hover:shadow-xl
                  transition-all duration-300 h-fit min-w-[260px]"
                >
                  <div className="absolute inset-0 opacity-90" />

                  <div className="relative z-10 p-4 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-center mb-3">
                      <div className="bg-[#F8F8F8CC] rounded-xl py-1 px-2 text-xs text-[#1A051D]">
                        {deal.badge}
                      </div>

                      {deal.discount && (
                        <span className="bg-[#DEF8D1] text-emerald-900 text-xs font-semibold px-3 py-1 rounded-full">
                          {deal.discount}
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="text-base font-semibold mb-1">{deal.title}</h3>
                      <p className="text-emerald-100 text-sm leading-snug">
                        {deal.description}
                      </p>
                      <p className="text-emerald-100 text-xs mt-1">
                        {deal.details}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-4 text-xs text-white">
                        <span className="flex items-center gap-1">
                          ⏱ {deal.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users2 className="w-4 h-4" />
                          {deal.participants}
                        </span>
                      </div>

                      <button className="px-4 py-2 text-xs bg-[#FFF4D6] text-[#A37800] font-semibold rounded-lg transition">
                        Join Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Create Splitz Banner - Hidden when search focused */}
        {!isSearchFocused && (
          <section className="flex flex-col md:px-0  mb-4 transition-all duration-300">
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
        )}
      </div>

      {/* ActiveSplits - Always visible */}
      <div className="p-4">
        <ActiveSplits activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </>
  );
}