import { Users2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Overlay1 from "../../assets/Overlay.svg";
import Overlay2 from "../../assets/Overlay1.svg";
import Overlay3 from "../../assets/Overlay2.svg";
import Overlay4 from "../../assets/Overlay3.svg";

const categories = [
  { icon: Overlay1, label: "Split Expenses" },
  { icon: Overlay2, label: "Bulk Orders & Riders" },
  { icon: Overlay3, label: "Borrow/Lend" },
  { icon: Overlay4, label: "Crowdfund" },
];

export default function Main(){
  const navigate = useNavigate();

  const CreateSplitz = () => {
    navigate("/dashboard/create-splitz");
  };
    return(
    <div className="flex flex-col gap-5 mt-3">
      {/* 🟩 Quick Access Categories */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold text-gray-900">
          Quick Access Categories
        </h2>

        <div className="flex gap-1 px-2 overflow-x-auto scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={i}
              className="rounded-xl py-3 px-2 transition text-center "
            >
              <img
                src={cat.icon}
                alt={cat.label}
                className="w-12 h-12 mx-auto mb-1.5"
              />
              <p className="text-[10px] font-medium text-gray-900 leading-tight">
                {cat.label}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* 🟨 Special Deals */}


      {/* 🟦 Create Splitz Banner */}
      <section className="flex flex-col">
        <div
          className="w-full bg-linear-to-r from-[#096A0F] to-[#1F8225]
          px-5 py-5 rounded-lg flex flex-col sm:flex-row
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
    </div>
    )
}