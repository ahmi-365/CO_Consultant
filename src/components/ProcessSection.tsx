import { 
  Database, 
  Settings, 
  BarChart3, 
  Share2, 
  TrendingUp, 
  Lightbulb, 
  Archive, 
  DollarSign,
  Tablet,
  Bluetooth,
  Users,
  FileText
} from "lucide-react";

const processSteps = [
  {
    number: 1,
    title: "Data Collection",
    description: "Data gathered via manual entries (foremen/timekeepers) and IoT Bluetooth devices.",
    icon: Database,
    color: "bg-primary"
  },
  {
    number: 2,
    title: "Data Processing", 
    description: "Remove duplicates, standardize formats, and analyze data using digital tools.",
    icon: Settings,
    color: "bg-secondary"
  },
  {
    number: 3,
    title: "Dashboard Development",
    description: "Generate interactive dashboards with man-hours, quantities, unit rates, and % progress linked to BOQ",
    icon: BarChart3,
    color: "bg-accent"
  },
  {
    number: 4,
    title: "Data Distribution",
    description: "Share dashboards daily via platforms like Microsoft Teams for manager-level access",
    icon: Share2,
    color: "bg-primary"
  },
  {
    number: 5,
    title: "Productivity Monitoring",
    description: "Identify low-productivity areas and disruption events using dashboard insights",
    icon: TrendingUp,
    color: "bg-secondary"
  },
  {
    number: 6,
    title: "Mitigation",
    description: "Enable daily decision-making and resource reallocation to resolve productivity issues",
    icon: Lightbulb,
    color: "bg-accent"
  },
  {
    number: 7,
    title: "Record Keeping",
    description: "Archive structured data for use in claims, arbitration, and formal reporting",
    icon: Archive,
    color: "bg-primary"
  },
  {
    number: 8,
    title: "Future Tendering and Estimating",
    description: "Use historical data to inform competitive, data-driven bids for similar future projects",
    icon: DollarSign,
    color: "bg-secondary"
  }
];

const dataFlowItems = [
  {
    title: "Manual Entries",
    description: "Foreman or timekeeper records manpower and production data",
    icon: Users
  },
  {
    title: "IoT Devices", 
    description: "Bluetooth devices capture manpower data",
    icon: Bluetooth
  },
  {
    title: "Interactive Dashboards",
    description: "Dashboards show manhours, quantities, progress, etc.",
    icon: Tablet
  },
  {
    title: "Record Keeping",
    description: "Records retained for potential claims, arbitration",
    icon: FileText
  }
];

const ProcessSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Our Comprehensive Process
          </h2>
          <p className="text-xl text-construction-grey max-w-3xl mx-auto">
            From data collection to future project estimation - our 8-step methodology ensures complete project visibility and control
          </p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {processSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div 
                key={step.number}
                className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20"
              >
                {/* Step Number */}
                <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
                
                {/* Icon */}
                <div className="mb-4">
                  <IconComponent className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-construction-grey leading-relaxed">
                  {step.description}
                </p>

                {/* Connecting Arrow (except for last item in row) */}
                {index < processSteps.length - 1 && (index + 1) % 4 !== 0 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-primary/30">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Data Flow Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Construction Consultancy Workflow Image */}
          <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
            <h3 className="text-3xl font-bold text-center mb-8 text-primary">
              Construction Consultancy Workflow
            </h3>
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl overflow-hidden h-80">
              <img 
                src="/lovable-uploads/e16bd476-d588-4b30-bdc4-057f398c3ad6.png" 
                alt="Construction Consultancy Workflow - From site data collection through Bluetooth devices and manual entries to structured data management, dashboards, and claims arbitration"
                className="w-full h-full object-contain p-6"
              />
            </div>
          </div>
          
          {/* Right: Data Flow Items */}
          <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
            <h3 className="text-3xl font-bold text-center mb-8 text-primary">
              Data Collection & Processing Flow
            </h3>
            
            <div className="space-y-6">
              {dataFlowItems.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-start gap-4 group">
                    <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-foreground mb-1">
                        {item.title}
                      </h4>
                      <p className="text-construction-grey text-sm">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Flow Arrow */}
                    {index < dataFlowItems.length - 1 && (
                      <div className="text-xl text-primary/40 mt-2 ml-auto">
                        ↓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4 text-primary">
              Ready to Transform Your Construction Management?
            </h3>
            <p className="text-construction-grey mb-6 max-w-2xl mx-auto">
              Experience the power of data-driven construction management with our proven 8-step methodology
            </p>
            <button className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors duration-300">
              Get Started Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;