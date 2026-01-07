import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useNavigate } from "react-router-dom";
import Hero from "../../assets/object.svg"; // adjust path if needed

const HomePage = () => {
  const navigate = useNavigate();

  const getStarted = () => {
    navigate("/pre-onboard");
  };

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: "ease-in-out",
    });
  }, []);

  return (
    <>
      <div className="bg-white px-4 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl pt-20 md:pt-28   md:pb-14 lg:pt-32 lg:pb-20 sm:pb-10">
          <section className="flex max-md:flex-col items-center justify-between gap-2">
            
            {/* LEFT CONTENT */}
            <div
              className="flex flex-col justify-center w-full lg:w-1/2 text-left"
              data-aos="fade-right"
            >
              <h1 className="text-3xl sm:text-4xl md:text-4xl lg:text-4xl xl:text-6xl font-bold text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6">
                Split Smarter,
                <br />
                Spend Together
              </h1>

              <p className="text-sm sm:text-lg md:text-xl lg:text-lg xl:text-xl text-gray-600 leading-relaxed tracking-wide mb-6 sm:mb-8 md:mb-10 max-w-full md:max-w-md lg:max-w-lg">
                CoSplitz helps you share expenses, organize group payments, and buy
                things together — whether you're a seller or just need people to
                split costs with.
              </p>

              {/* DESKTOP BUTTONS */}
              <div
                className="hidden md:flex flex-col sm:flex-row gap-3 lg:gap-4 w-full max-w-md"
                data-aos="zoom-in"
                data-aos-delay="200"
              >
                <button
                  onClick={getStarted}
                  className="px-6 sm:px-8 md:px-10 lg:px-12 py-3 bg-[#1F8225] text-white text-base sm:text-lg lg:text-xl font-semibold rounded-lg shadow-lg hover:bg-[#17661C] hover:shadow-xl active:scale-95 transition-all duration-300"
                >
                  Get Started
                </button>

                <button className="px-6 sm:px-8 md:px-10 lg:px-12 py-3 border-2 border-[#1F8225] text-[#1F8225] text-base sm:text-lg lg:text-xl font-semibold rounded-lg hover:bg-[#f0f9f0] hover:border-[#17661C] active:scale-95 transition-all duration-300">
                  Learn More
                </button>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div
              className="w-full lg:w-1/2 flex justify-center items-end"
              data-aos="fade-left"
              data-aos-delay="150"
            >
              <div className="relative w-full flex justify-between max-w-sm py-2 lg:max-w-xl">
                <img
                  src={Hero}
                  alt="App illustration"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  draggable="false"
                />
              </div>
            </div>

          </section>
        </div>

        {/* MOBILE BUTTONS */}
        <div className="md:hidden mt-4" data-aos="fade-up">
          <div className="flex flex-col gap-3 sm:gap-4 w-full mx-auto">
            <button
              onClick={getStarted}
              className="px-6 py-3.5 bg-[#1F8225] text-white text-lg sm:text-xl font-semibold rounded-lg shadow-lg hover:bg-[#17661C] hover:shadow-xl active:scale-95 transition-all duration-300 w-full"
            >
              Get Started
            </button>

            <button className="px-6 py-3.5 border-2 border-[#1F8225] text-[#1F8225] text-lg sm:text-xl font-semibold rounded-lg hover:bg-[#f0f9f0] hover:border-[#17661C] active:scale-95 transition-all duration-300 w-full">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
