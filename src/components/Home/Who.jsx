import React, { useEffect } from "react";
import {useNavigate} from "react-router-dom"
import AOS from "aos";
import "aos/dist/aos.css";
import image1 from "../../assets/Frame 37.svg";
import image2 from "../../assets/Frame 36.svg";
import image3 from "../../assets/Frame 35.svg";
import image4 from "../../assets/Frame 34.svg";

export default function WhoSection() {
  const navigate = useNavigate();
  const getOnboard=()=>{
    navigate("/onboard")
  }
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
      id="community"
      className="w-full flex flex-col justify-center items-center bg-white overflow-hidden font-['Raleway']"
    >
      {/* ===== Main Content Section ===== */}
      <div className="max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16 py-20 md:py-24 px-4 sm:px-8 md:px-12 lg:px-16">
        {/* ===== Left Section ===== */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center text-center md:text-left"
          data-aos="fade-right"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 underline underline-offset-8 decoration-[#1F8225]">
            Who Can Use CoSplitz?
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
            From students and travelers to families and small business owners,{" "}
            <span className="font-semibold text-[#1F8225]">CoSplitz</span> makes
            sharing easier for everyone. Whether you’re splitting a trip, a meal,
            or a deal — you belong here.
          </p>
        </div>

        {/* ===== Right Section (Grid of Icons/Images) ===== */}
        <div
          className="w-full md:w-1/2 grid grid-cols-2 gap-4 sm:gap-6"
          data-aos="fade-left"
          data-aos-delay="150"
        >
          {[image1, image2, image3, image4].map((img, i) => (
            <div
              key={i}
              className="flex justify-center items-center  p-4 rounded-2xl  hover:shadow-lg transition-all duration-300"
            >
              <img
                src={img}
                alt={`Who-section-icon-${i + 1}`}
                className="w-full h-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA Section ===== */}
      <div
        className="w-full bg-[#DEF8D1] py-16 md:py-20 flex justify-center items-center px-4 sm:px-8 md:px-12"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="max-w-7xl text-center flex flex-col items-center gap-6">
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 underline underline-offset-8 decoration-[#1F8225]">
            Ready to Split Smarter?
          </h3>

          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed">
            Join the{" "}
            <span className="font-semibold text-[#1F8225]">CoSplitz</span>{" "}
            community today and make shared payments effortless.
          </p>
          

          <button onClick={getOnboard} className="bg-[#1F8225] text-white font-semibold text-sm md:text-base px-10 py-4 rounded-full shadow-md hover:bg-[#176b1d] transition-all duration-300">
            JOIN NOW
          </button>
        </div>
      </div>
    </section>
  );
}
