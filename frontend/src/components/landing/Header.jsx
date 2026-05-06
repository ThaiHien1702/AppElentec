import { useState, useEffect } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { FileText, Menu, X } from "lucide-react";
import ProfileDropdown from "../layout/ProfileDropdown";
import Button from "../ui/Button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = false;
  const user = { name: "Hien", email: "hien@gmail.com" };
  const logout = () => {};
  const navigator = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-gray-100 ${isScrolled ? "bg-white/95 backdrop:backdrop-blur-lg" : "bg-white/0"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-400 rounded-md flex items-center justify-center">
              <FileText className="w-4 h-4 text-white"></FileText>
            </div>
            <samp className="text-xl font-bold text-gray-900">ELENTEC</samp>
          </div>
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            <a
              href="#about"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              Giới thiệu
            </a>
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              Tính năng
            </a>
            <a
              href="#recruitment"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              Tuyển dụng
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              Đánh giá
            </a>
            <a
              href="#faq"
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-black after:transition-all hover:after:w-full"
            >
              FAQ
            </a>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <ProfileDropdown
                isOpen={profileDropdownOpen}
                onToggle={(e) => {
                  e.stopPropagation();
                  setProfileDropdownOpen(!profileDropdownOpen);
                }}
                avatar={user?.avatar || ""}
                companyName={user?.name || ""}
                email={user?.email || ""}
                onLogout={logout}
              ></ProfileDropdown>
            ) : (
              <>
                {/* <Link
                  to="/login"
                  className="text-black hover:text-gray-900 font-medium transition-colors duration-200"
                >
                  Login
                </Link> */}
                <Link
                  to="/login"
                  className="bg-linear-to-r from-blue-400 to-blue-500 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </div>
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            >
              {isMenOpen ? (
                <X className="w-6 h-6"></X>
              ) : (
                <Menu className="w-6 h-6"></Menu>
              )}
            </button>
          </div>
        </div>
      </div>
      {isMenOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
          <div className="px-2 t-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#about"
              className="block py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Giới thiệu
            </a>
            <a
              href="#features"
              className="block py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Tính năng
            </a>
            <a
              href="#recruitment"
              className="block py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Tuyển dụng
            </a>
            <a
              href="#testimonia"
              className="block py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              Đánh giá
            </a>
            <a
              href="#faq"
              className="block py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
            >
              FAQ
            </a>
            <div className="border-t border-gray-200 my-2"></div>
            {isAuthenticated ? (
              <div className="p-4">
                <Button
                  onClick={() => navigator("/dashboard")}
                  className="w-full"
                >
                  Đi tới bảng điều khiển
                </Button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/signup"
                  className="bg-linear-to-r from-blue-400 to-blue-500 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
