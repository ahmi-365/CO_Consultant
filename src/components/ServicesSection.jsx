import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, MapPin, Clock, Shield, TrendingUp, Zap } from "lucide-react";

const services = [
  {
    icon: BarChart3,
    title: "Daily Reporting Dashboard",
    description: "Track tasks and milestones every day with comprehensive project insights and real-time updates.",
    features: ["Real-time Progress Tracking", "Automated Report Generation", "Performance Analytics"]
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking System", 
    description: "GPS & IoT-enabled updates for fieldwork with precise location monitoring and progress tracking.",
    features: ["GPS Asset Tracking", "IoT Sensor Integration", "Live Site Monitoring"]
  },
  {
    icon: Clock,
    title: "Productivity Estimation",
    description: "Forecast resources, time, and costs accurately with AI-powered analytics and predictive modeling.",
    features: ["AI-Powered Forecasting", "Resource Optimization", "Cost Prediction Models"]
  },
  {
    icon: Shield,
    title: "Secure Cloud Access",
    description: "Enterprise-grade data protection with encrypted storage and multi-layer security protocols.",
    features: ["256-bit Encryption", "Multi-Factor Authentication", "Compliance Ready"]
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Advanced analytics and insights to optimize project performance and identify improvement opportunities.",
    features: ["Custom Dashboards", "Trend Analysis", "Predictive Insights"]
  },
  {
    icon: Zap,
    title: "Workflow Automation",
    description: "Streamline repetitive tasks and approvals with intelligent automation and workflow management.",
    features: ["Automated Workflows", "Smart Notifications", "Process Optimization"]
  }
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-20 bg-construction-light-grey relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-secondary rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-block p-2 bg-secondary/10 rounded-full mb-4">
            <BarChart3 className="w-8 h-8 text-secondary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            All-in-One Services
          </h2>
          <p className="text-xl text-construction-grey max-w-3xl mx-auto leading-relaxed">
            Cutting-edge construction management solutions designed to streamline your projects from conception to completion
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-card-hover transition-all duration-500 hover:-translate-y-3 border-0 shadow-card bg-white/80 backdrop-blur-sm hover:bg-white relative overflow-hidden"
            >
              {/* Card Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardContent className="p-8 text-center relative">
                {/* Animated Icon Container */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/20 group-hover:from-secondary/20 group-hover:to-secondary/30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                      <service.icon className="w-10 h-10 text-secondary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    {/* Floating dot decoration */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-500 delay-200"></div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-primary group-hover:text-secondary transition-colors duration-300">
                  {service.title}
                </h3>
                
                <p className="text-construction-grey leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Feature List */}
                <div className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <div 
                      key={featureIndex}
                      className="flex items-center justify-center gap-2 text-sm text-construction-grey group-hover:text-primary transition-colors duration-300"
                    >
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full group-hover:bg-accent transition-colors duration-300"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover Effect Lines */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <p className="text-lg text-construction-grey mb-6">
            Need a custom solution for your specific requirements?
          </p>
          <div className="inline-block p-1 bg-gradient-to-r from-secondary to-accent rounded-full">
            <div className="bg-white px-8 py-3 rounded-full">
              <span className="text-primary font-semibold">Contact us for a personalized consultation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;