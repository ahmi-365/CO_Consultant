import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  const servicesItems = [
    { label: "All in One Services", id: "hero" },
    { label: "Real Time Tracking", id: "services" },
    { label: "Productivity Estimation", id: "why-choose-us" },
    { label: "Secure Cloud Access", id: "projects" },
    { label: "Performance Analytics", id: "contact" },
    { label: "Workflow Automation", id: "workflow-automation" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-blue-900 text-white">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-gray-300">
          {/* About Us */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                <img
                  src="/Assets/icon.png"
                  alt="CO Consultants Logo"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-white">About Us</h3>
            </div>
            <p className="leading-relaxed text-gray-300">
              CO Consultants is a construction focused project management and
              analytics consultancy based in Dubai, UAE. With over a decade of
              experience across the GCC, Europe, and Central Asia, we help
              contractors, developers, and consultants turn daily field data into
              strategic project insights. We bridge the gap between on site
              operations and decision making through smart digitization.
            </p>
          </div>

          {/* Our Services */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold mb-6 text-white">Our Services</h3>
            <ul className="space-y-3">
              {servicesItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.id}`}
                    className="hover:text-yellow-400 hover:underline transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-white">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-400 mt-0.5" />
                <span>Dubai, UAE</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-yellow-400" />
                <a
                  href="tel:+15551234567"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  +1 (555) 123-4567
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-yellow-400" />
                <a
                  href="mailto:info@thecoconsultants.com"
                  className="hover:text-yellow-400 transition-colors duration-200"
                >
                  info@thecoconsultants.com
                </a>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
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
          {/* Policy Links */}
<div className="flex flex-wrap items-center justify-center md:justify-end gap-4 mt-4 md:mt-0 text-sm">
  <a
    href="/privacy-policy"
    className="text-gray-300 hover:text-yellow-400 transition-all duration-200 hover:underline underline-offset-4"
  >
    Privacy Policy
  </a>

  <span className="text-gray-500 hidden md:inline">|</span>

  <a
    href="/terms-and-conditions"
    className="text-gray-300 hover:text-yellow-400 transition-all duration-200 hover:underline underline-offset-4"
  >
    Terms & Conditions
  </a>
</div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
