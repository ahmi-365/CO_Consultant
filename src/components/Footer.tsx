import { Building2, Phone, Mail, MapPin, Clock, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    "Daily Reporting Dashboard",
    "Real-Time Tracking",
    "Productivity Estimation", 
    "Secure Cloud Access",
    "Performance Analytics",
    "Workflow Automation"
  ];

  const quickLinks = [
    "About Us",
    "Services", 
    "Projects",
    "Contact",
    "Blog",
    "Careers"
  ];

  const legalLinks = [
    "Privacy Policy",
    "Terms of Service",
    "Cookie Policy",
    "Safety Guidelines"
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <span className="text-2xl font-bold">CO Consultants</span>
            </div>
            
            <p className="text-primary-foreground/80 mb-6 leading-relaxed">
              Leading construction management solutions provider, delivering smart, reliable, and results-driven project management since 2010.
            </p>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-accent hover:text-primary transition-all duration-300">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-6">Our Services</h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <a href="#services" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 hover:underline">
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 hover:underline">
                    {link}
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
                  <p className="text-primary-foreground/80">123 Construction Avenue</p>
                  <p className="text-primary-foreground/80">New York, NY 10001</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="tel:+15551234567" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                  +1 (555) 123-4567
                </a>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent flex-shrink-0" />
                <a href="mailto:info@coconsultants.com" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200">
                  info@coconsultants.com
                </a>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-primary-foreground/80">Mon-Fri: 8AM-6PM</p>
                  <p className="text-primary-foreground/80">Sat: 9AM-4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-primary-foreground/20 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-primary-foreground/80 mb-6">
              Get the latest construction industry insights and project updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-primary-foreground/10 rounded-lg text-primary-foreground placeholder:text-primary-foreground/60 border border-primary-foreground/20 focus:outline-none focus:border-accent"
              />
              <button className="px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-primary-foreground/70 text-center md:text-left">
              © {currentYear} CO Consultants. All rights reserved. | Licensed & Insured Construction Management
            </p>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link, index) => (
                <a key={index} href="#" className="text-primary-foreground/70 hover:text-accent transition-colors duration-200 text-sm">
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;