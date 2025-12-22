import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "react-router-dom";
const Footer = () => {
  const servicesItems = [
    { label: "Real Time Tracking System", id: "services" },
    { label: "Daily Reports", id: "services" },
    { label: "Performance Analytics", id: "services" },
  ];

  const quickLinks = [
    // { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Why Data Matters", id: "data-matters" },
    { label: "Why Choose Us", id: "why-choose-us" },
    { label: "Contact", id: "contact" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-gray-300">
          {/* Column 1: Logo Square */}
          <div className="flex items-start">
            <div className="w-56 h-56 flex-shrink-0">
              <img
                src="/assets/icon.png"
                alt="CO Consultants Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Column 2: Short Paragraph */}
          <div>
            <p className="leading-relaxed text-gray-300 text-sm">
              CO Consultants is a construction focused project management and
              analytics consultancy based in Dubai, UAE. With over a decade of
              experience across the GCC, Europe and Central Asia, we help
              contractors, developers and consultants turn daily field data into
              strategic project insights. We bridge the gap between on site
              operations and decision making through smart digitization.
            </p>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`#${link.id}`}
                    className="hover:text-yellow-400 hover:underline transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-6 text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <span>Dubai, UAE</span>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:admin@thecoconsultants.com"
                  className="hover:text-yellow-400 transition-colors duration-200 break-all"
                >
                  admin@thecoconsultants.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <span>
                  Mon–Fri: 8AM–6PM <br /> Sat: 9AM–4PM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p className="text-center md:text-left">
            © {currentYear} CO Consultants. All rights reserved. | Licensed &
            Insured Construction Management
          </p>

          {/* Policy Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 mt-4 md:mt-0 text-sm">
            <Link
              to="/privacy-policy"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-200 hover:underline underline-offset-4"
            >
              Privacy Policy
            </Link>

            <span className="text-gray-500 hidden md:inline">|</span>

            <Link
              to="/terms-and-conditions"
              className="text-gray-300 hover:text-yellow-400 transition-all duration-200 hover:underline underline-offset-4"
            >
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
