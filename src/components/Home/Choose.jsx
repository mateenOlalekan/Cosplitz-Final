import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import work1 from "../../assets/why01.jpg";
import work2 from "../../assets/why02.jpg";
import work3 from "../../assets/why03.png";
import work4 from "../../assets/why04.png";

const whydata = [
  {
    title: "Community-first",
    desc: "Built around trust and shared goals.",
    img: work1,
  },
  {
    title: "Flexible roles",
    desc: "Be a seller, buyer, or someone who simply wants to split costs.",
    img: work2,
  },
  {
    title: "Secure Payment",
    desc: "Your money is held safely until every split is complete.",
    img: work3,
  },
  {
    title: "Smart Management",
    desc: "Easily track and manage your shared expenses effortlessly.",
    img: work4,
  },
];

export default function Choose() {
  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      easing: "ease-in-out",
      offset: 80,
    });
  }, []);

  return (
    <section
      id="features"
      className="relative flex justify-center items-center w-full bg-white py-12 md:py-16 px-4 sm:px-8 lg:px-12 font-['Raleway'] overflow-hidden"
    >
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
        {/* ===== Section Header ===== */}
        <div
          className="text-center mb-10"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
            Why Choose CoSplitz
          </h1>
          <div className="w-16 h-1 bg-[#1F8225] mx-auto rounded-full"></div>
        </div>

        {/* ===== Carousel ===== */}
        <div
          className="carousel carousel-end rounded-box gap-4 w-full overflow-x-auto pb-4"
          data-aos="fade-up"
        >
          {whydata.map((data, index) => (
            <div
              key={index}
              className="
                carousel-item 
                w-64 sm:w-72 md:w-80 lg:w-96 
                flex-shrink-0 
              "
            >
              <div className="flex flex-col bg-[#E8F7E3] rounded-2xl p-2 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 h-full">
                
                {/* Image */}
                <div className="w-full h-60 rounded-xl overflow-hidden mb-4">
                  <img
                    src={data.img}
                    alt={data.title}
                    className="w-full h-full object-cover"
                    draggable="false"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-1 text-center px-2">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">
                    {data.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {data.desc}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
