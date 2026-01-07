import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Hand from "../../assets/Group.svg";
import Arrow from "../../assets/arrowdown.svg";
import Work1 from "../../assets/work1.svg";
import Work2 from "../../assets/work2.svg";
import Work3 from "../../assets/work3.svg";

export default function Work() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
      offset: 100,
    });
  }, []);

  return (
    <section
      id="works"
      className="relative w-full bg-[#F7F5F9] py-10 sm:py-12 md:py-10 px-4 sm:px-6 lg:px-12 font-['Raleway'] overflow-hidden"
    >
      {/* ===== Header ===== */}
      <div
        className="text-center mb-8"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          How It Works
        </h2>
        <div className="w-24 h-1 bg-[#1F8225] mx-auto rounded-full"></div>
      </div>

      {/* ===== Main Content ===== */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-14 md:gap-20">

        {/* ===== Left Illustration ===== */}
        <div
          className="w-full md:w-1/2 flex justify-center"
          data-aos="fade-right"
        >
          <img
            src={Hand}
            alt="Helping Hand"
            className="
              w-[70%]
              sm:w-[60%]
              md:w-[80%]
              lg:w-[75%]
              xl:w-[80%]
              max-w-[550px]
              h-auto object-contain drop-shadow-md
            "
            draggable="false"
          />
        </div>

        {/* ===== Steps Section ===== */}
        <div
          className="w-full md:w-1/2 flex flex-col gap-4"
          data-aos="fade-left"
        >
          {/* STEP TEMPLATE COMPONENT */}
          {[
            {
              id: 1,
              icon: Work1,
              title: "Create a Splitz",
              description:
                "Start a shared payment as an organizer or join one to split costs easily.",
            },
            {
              id: 2,
              icon: Work2,
              title: "Invite & Connect",
              description:
                "Invite friends or connect with others who want to share the same expense.",
            },
            {
              id: 3,
              icon: Work3,
              title: "Pay & Track Together",
              description:
                "CoSplitz holds contributions securely until everyone’s in — no chasing payments.",
            },
          ].map((step, index) => (
            <div key={step.id} className="flex items-start gap-6">
              {/* Step Number + Arrow */}
              <div className="flex flex-col items-center">
                <p className="text-lg md:text-xl font-semibold text-gray-700">
                  {step.id}
                </p>
                {index < 3 && (
                  <img
                    src={Arrow}
                    alt="Arrow Down"
                    className="h-16 md:h-20"
                  />
                )}
              </div>

              {/* Step Card */}
              <div className="flex flex-col bg-white rounded-xl p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 w-full">
                <div className="flex items-center gap-3 mb-3">
                  <img src={step.icon} alt={step.title} className="w-10 h-10" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}
