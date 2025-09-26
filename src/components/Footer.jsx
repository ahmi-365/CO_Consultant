import { Building2, MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  // Header menu items reuse
  const menuItems = [
    { label: "Home", id: "hero" },
    { label: "Services", id: "services" },
    { label: "Why Choose Us", id: "why-choose-us" },
    { label: "Projects", id: "projects" },
    { label: "Contact", id: "contact" },
  ];

  // Services items for footer
  const servicesItems = [
    { label: "All-in-One Services", id: "hero" },
    { label: "Real-Time Tracking", id: "services" },
    { label: "Productivity Estimation", id: "why-choose-us" },
    { label: "Secure Cloud Access", id: "projects" },
    { label: "Performance Analytics", id: "contact" },
    { label: "Workflow Automation", id: "workflow-automation" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <img 
                src="/Assets/icon.png"
                alt="Building Icon" 
                className="w-6 h-6 object-contain"
              />
            </div>
              <span className="text-2xl font-bold">CO Consultants</span>
            </div>
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Leading construction management solutions provider, delivering
              smart, reliable, and results-driven project management since 2010.
            </p>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {servicesItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.id}`}
                    className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={`#${item.id}`}
                    className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="#map"
                    className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                  >
                    123 Construction Avenue, New York, NY 10001
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a
                  href="tel:+15551234567"
                  className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                >
                  +1 (555) 123-4567
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a
                  href="mailto:info@coconsultants.com"
                  className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                >
                  info@coconsultants.com
                </a>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <a
                    href="#timings"
                    className="text-primary-foreground/80 hover:text-accent hover:underline transition-colors duration-200"
                  >
                    Mon-Fri: 8AM-6PM <br /> Sat: 9AM-4PM
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-center md:text-left">
              © {currentYear} CO Consultants. All rights reserved. | Licensed &
              Insured Construction Management
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
