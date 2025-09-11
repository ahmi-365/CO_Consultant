import { BarChart3, TrendingUp, Database, Target } from "lucide-react";

const analyticsFeatures = [
  {
    title: "Data Collection",
    description: "Comprehensive data gathering from manual entries and IoT Bluetooth devices for real-time manpower tracking.",
    icon: Database
  },
  {
    title: "Data Processing", 
    description: "Advanced duplicate removal, data structuring, and analysis tools to ensure clean, actionable insights.",
    icon: BarChart3
  },
  {
    title: "Interactive Dashboards",
    description: "Real-time dashboards displaying manhours, quantities, progress metrics, and key performance indicators.",
    icon: TrendingUp
  },
  {
    title: "Claims & Tendering",
    description: "Structured record keeping for potential claims, arbitration, and future project tendering optimization.",
    icon: Target
  }
];

const DataAnalyticsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left: Content */}
         <div className="h-screen flex flex-col justify-center px-6">
  <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
    Complete Data Analytics Workflow
  </h2>

 <p className="text-lg md:text-xl text-construction-grey mb-8 leading-relaxed max-w-3xl">
  From collection to claims – our workflow turns data into actionable insights.
</p>

  <div className="space-y-5">
    {analyticsFeatures.map((feature, index) => {
      const IconComponent = feature.icon;
      return (
        <div key={index} className="flex items-start gap-4 group">
          <div className="bg-primary/10 rounded-xl p-3 group-hover:bg-primary/20 transition-colors duration-300 flex-shrink-0">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-foreground mb-1">
              {feature.title}
            </h4>
            <p className="text-construction-grey text-sm md:text-base leading-relaxed">
              {feature.description}
            </p>
          </div>
        </div>
      );
    })}
  </div>
</div>

          
          {/* Right: Data Analytics Workflow Image */}
          <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50">
            <h3 className="text-3xl font-bold text-center mb-8 text-primary">
              Data Analytics Workflow
            </h3>
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl overflow-hidden h-96">
              <img 
                src="/lovable-uploads/bgremoved2.png" 
                alt="Data Analytics Workflow - Complete process from data collection through processing to interactive dashboards and claims management"
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataAnalyticsSection;