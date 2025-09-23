import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Building2, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavigation = () => {
    if (!user) {
      // User not logged in - show login
      navigate("/login");
    } else if (user.roles && user.roles.includes("admin")) {
      // User is admin - show dashboard
      navigate("/dash");
    } else if (user.roles && user.roles.includes("manager")) {
      // User is manager - show dashboard
      navigate("/dash");
    } else {
      // Regular user - show file manager
      navigate("/filemanager");
    }
    setIsMobileMenuOpen(false);
  };

  const getButtonText = () => {
    if (!user) {
      return "Login";
    } else if (user.roles && (user.roles.includes("admin") || user.roles.includes("manager"))) {
      return "Dashboard";
    } else {
      return "File Manager";
    }
  };

  const menuItems = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Why Choose Us", id: "why-choose-us" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? "bg-primary/95 backdrop-blur-md shadow-card"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="/Assets/icon.png"
                alt="Building Icon" 
                className="w-6 h-6 object-contain"
              />
            </div>
            {/* Show company name only when scrolled or on mobile */}
            <span
              className={`text-2xl font-bold text-white transition-opacity duration-300 md:opacity-100 ${
                isScrolled || isMobileMenuOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              CO Consultants
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-white hover:text-accent transition-colors duration-200 font-medium"
              >
                {item.label}
              </button>
            ))}
            <Button variant="hero-outline" size="sm" onClick={handleNavigation}>
              {getButtonText()}
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-primary/95 backdrop-blur-md border-t border-white/10">
            <nav className="py-4 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left px-4 py-3 text-white hover:text-accent hover:bg-white/10 transition-colors duration-200"
                >
                  {item.label}
                </button>
              ))}
              <div className="px-4 pt-2">
                <Button
                  variant="hero-outline"
                  size="sm"
                  className="w-full"
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

export default Header;