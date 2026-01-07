import { Facebook, Instagram, Twitter, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.svg";

export default function Footer() {
  return (
    <footer className="w-full flex flex-col bg-[#F7F5F9] mt-10">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        {/* Top Section - Logo, Links & Social */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 mb-4">
          {/* Logo and Tagline */}
          <div className="flex flex-col gap-3">
            <img 
              src={logo} 
              alt="Cosplitz Logo" 
              className="w-36 select-none pointer-events-none"
            />
            <p className=" text-lg font-normal md:text-2xl md:font-semibold text-gray-700 leading-tight">
              Split Smarter, Spend Together
            </p>
          </div>
          
          {/* Navigation Links and Social */}
          <div className="flex flex-col  gap-1">
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-6 text-xl text-[#1A051D] font-semibold">
              <Link to="/home" className="hover:text-green-600 transition-colors duration-200">
                About
              </Link>
              <Link to="/features" className="hover:text-green-600 transition-colors duration-200">
                Features
              </Link>
              <Link to="/faq" className="hover:text-green-600 transition-colors duration-200">
                FAQ
              </Link>
              <Link to="/contact" className="hover:text-green-600 transition-colors duration-200">
                Contact
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex flex-col justify-end items-end gap-2">
              <a 
                href="https://facebook.com" 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-50 transition-all duration-200 group"
              >
                <Facebook className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
              <a 
                href="https://instagram.com" 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-50 transition-all duration-200 group"
              >
                <Instagram className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8 pt-8 ">
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <h3 className="text-xl font-semibold text-gray-900">Subscribe to our Newsletter</h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="px-4 py-3 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-80"
              />
              <button className="bg-[#1F8225] text-white px-6 py-3 rounded-lg sm:rounded-r-lg sm:rounded-l-none hover:bg-green-700 transition-colors duration-200 font-semibold flex items-center justify-center gap-2 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex justify-center items-center text-white bg-[#1F8225] text-sm text-center py-6 px-4">
        © 2025 CoSplitz. Built for communities that share.
      </div>
    </footer>
  );
}