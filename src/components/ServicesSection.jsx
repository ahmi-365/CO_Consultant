import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, MapPin, TrendingUp, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: MapPin,
    title: "Real Time Tracking",
    description: "Bluetooth enabled precise location monitoring for manpower & equipment with geofencing capabilities.",
    features: ["Live Monitoring", "HSE Management", "Geofencing"]
  },
  {
    icon: BarChart3,
    title: "Daily Reporting",
    description: "Track progress with comprehensive project insights and real-time dashboards.",
    features: ["Workforce Tracking", "Material Utilization", "Auto Reports"]
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Advanced analytics to optimize project performance with predictive modeling.",
    features: ["Dashboards", "Trend Analysis", "KPI Monitoring"]
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-12 bg-gray-50 relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Header Section - Compact */}
        <div className="text-center mb-8">
          <div className="inline-block p-1.5 bg-blue-400/10 rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">
            All in One Services
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Cutting edge construction management solutions designed to streamline your projects from conception to completion
          </p>
        </div>

        {/* Cards Section - Full Width with More Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white relative overflow-hidden h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-transparent to-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <CardContent className="p-6 text-center relative h-full flex flex-col">
                {/* Icon - Larger */}
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-blue-400/10 to-blue-400/20 group-hover:from-blue-400/20 group-hover:to-blue-400/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <service.icon className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500"></div>
                  </div>
                </div>

                {/* Title - Larger */}
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-400 transition-colors duration-300">
                  {service.title}
                </h3>

                {/* Description - Readable Size */}
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  {service.description}
                </p>

                {/* Features - More Spacing */}
                <div className="space-y-2 mb-2">
                  {service.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center justify-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:bg-yellow-400 transition-colors duration-300"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-0 left-0 right-0 w-full h-1 bg-gradient-to-r from-blue-400 to-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </CardContent>
            </Card>
          ))}
        </div>
         {/* <div className="text-center">
          <p className="text-xs text-gray-600 mb-2">
            Need a custom solution for your specific requirements?
          </p>
          <button
            onClick={() => {
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="inline-block p-0.5 bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full transition-transform duration-300 hover:scale-105 focus:outline-none"
          >
            <div className="bg-white px-5 py-1.5 rounded-full">
              <span className="text-gray-900 font-semibold text-xs">
                Contact us for consultation
              </span>
            </div>
          </button>
        </div> */}
      </div>
    </section>
  );
};

export default ServicesSection;