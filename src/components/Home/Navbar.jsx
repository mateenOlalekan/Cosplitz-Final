import { useState, useEffect } from "react"; 
import { Link, useLocation, useNavigate } from "react-router-dom";
import NavbarLogo from "../../assets/logo.svg";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [menu, setMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { title: "Home", to: "home" },
    { title: "How It Works", to: "works" },
    { title: "Features", to: "features" },
    { title: "Community", to: "community" },
  ];

  const toggleMenu = () => setMenu((prev) => !prev);

  // Close menu with ESC key
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Navbar shadow on scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Disable background scrolling when menu opens
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [menu]);

  // Smooth scroll behavior
  const handleNavClick = (id) => {
    setMenu(false);

    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }

    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleSignupClick = () => {
    setMenu(false);
    navigate("/register");
  };

  const handleLoginClick = () => {
    setMenu(false);
    navigate("/login");
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-[9999] bg-white md:bg-[#F7F5F9] transition-all duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-4 py-3">
          {/* Logo */}
          <Link
            to="/"
            aria-label="CoSplitz home"
            className="flex items-center flex-shrink-0"
            onClick={() => setMenu(false)}
          >
            <img
              src={NavbarLogo}
              alt="CoSplitz logo"
              className="w-28 lg:w-36 select-none pointer-events-none"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8 lg:gap-12">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleNavClick(item.to)}
                className="text-gray-700 hover:text-[#1f8225] transition-colors text-[16px] font-medium whitespace-nowrap"
              >
                {item.title}
              </button>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-4 text-[16px]">
            <button
              onClick={handleSignupClick}
              className="px-5 py-2.5 rounded-sm border-2 border-green-600 bg-white text-green-600 hover:bg-green-50 transition-colors font-medium"
            >
              SIGN UP
            </button>

            <button
              onClick={handleLoginClick}
              className="px-5 py-2.5 rounded-sm bg-green-600 hover:bg-green-700 text-white transition-colors font-medium"
            >
              LOG IN
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={toggleMenu}
            aria-label={menu ? "Close menu" : "Open menu"}
            className="lg:hidden p-2 font-extrabold text-black rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {menu ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-500 md:hidden ${
            menu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMenu(false)}
        />

        {/* Mobile Drawer */}
        <div
          className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-[10000] md:hidden ${
            menu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <img src={NavbarLogo} alt="CoSplitz" className="h-8" />
            <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-gray-100">
              <X size={24} />
            </button>
          </div>

          <nav className="flex flex-col px-6 py-6 space-y-5">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => handleNavClick(item.to)}
                className="text-sm md:text-lg font-medium text-gray-700 hover:text-green-600 transition-colors text-left py-2"
              >
                {item.title}
              </button>
            ))}
          </nav>

          <div className="mt-8 px-6 flex flex-col gap-4">
            <button
              onClick={handleSignupClick}
              className="w-full text-center px-5 py-3 rounded-sm border-2 border-green-600 bg-white text-green-600 hover:bg-green-50 font-medium"
            >
              SIGN UP
            </button>

            <button
              onClick={handleLoginClick}
              className="w-full text-center px-5 py-3 rounded-sm bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              LOG IN
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
