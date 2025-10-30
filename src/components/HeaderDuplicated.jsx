import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";

const HeaderDuplicated = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
  }, []);

  const handleNavigation = () => {
    if (!user) {
      navigate("/login");
    } else if (user.roles?.includes("admin") || user.roles?.includes("manager")) {
      navigate("/dash");
    } else {
      navigate("/filemanager");
    }
    setIsMobileMenuOpen(false);
  };

  const getButtonText = () => {
    if (!user) return "Login";
    if (user.roles?.includes("admin") || user.roles?.includes("manager")) return "Dashboard";
    return "File Manager";
  };
const menuItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "/services" },
    { label: "Why Choose Us", path: "/why-choose-us" },
    { label: "Projects", path: "/projects" },
    { label: "Contact", path: "/contact" },
  ];
  // ✅ Scroll or Redirect Logic
  const handleMenuClick = (id) => {
    setIsMobileMenuOpen(false);

    if (location.pathname !== "/") {
      // if not on homepage → go to homepage and scroll after load
      navigate("/", { state: { scrollTo: id } });
    } else {
      // if already on homepage → just scroll
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // when redirected from another route, perform scroll after load
    if (location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 shadow-md backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* ✅ Logo with Link */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <img
                src="/Assets/icon.png"
                alt="Building Icon"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white">
              CO Consultants
            </span>
          </Link>

          {/* ✅ Desktop Menu with Smart Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className="text-white hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
            <Button
              variant="hero-outline"
              size="sm"
              className="!border-white !text-white hover:!bg-white hover:!text-gray-900"
              onClick={handleNavigation}
            >
              {getButtonText()}
            </Button>
          </nav>

          {/* ✅ Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ✅ Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-700">
            <nav className="py-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className="block w-full text-left px-4 py-3 text-white hover:text-blue-400 hover:bg-gray-800 transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button
                  variant="hero-outline"
                  size="sm"
                  className="w-full !border-white text-white hover:!bg-white hover:!text-gray-900"
                  onClick={handleNavigation}
                >
                  {getButtonText()}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderDuplicated;
