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
FileText,
Building,
Clock,
Monitor,
Scale,
CheckCircle
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

const flowItems = [
{
title: "SITE",
description: "Construction site with crane and building",
icon: Building,
color: "bg-slate-700",
position: "top-left"
},
{
title: "BLUETOOTH DEVICES",
description: "IoT devices for data collection",
icon: Bluetooth,
color: "bg-blue-600",
position: "top-right"
},
{
title: "MANUAL ENTRIES",
description: "Foreman manual data entry",
icon: Users,
color: "bg-green-600",
position: "middle-left"
},
{
title: "CONSTRUCTION CONSULTANCY",
description: "Central processing hub",
icon: Building,
color: "bg-orange-600",
position: "center"
},
{
title: "STRUCTURED DATA",
description: "Processed and organized data",
icon: Clock,
color: "bg-purple-600",
position: "middle-right"
},
{
title: "PROJECT MANAGEMENT",
description: "Management and monitoring",
icon: Monitor,
color: "bg-indigo-600",
position: "bottom-right"
},
{
title: "DASHBOARDS",
description: "Interactive data visualization",
icon: BarChart3,
color: "bg-cyan-600",
position: "bottom-left"
},
{
title: "RECORDS",
description: "Data archiving and storage",
icon: FileText,
color: "bg-teal-600",
position: "bottom-center-left"
},
{
title: "CLAIMS & ARBITRATION",
description: "Legal and dispute resolution",
icon: Scale,
color: "bg-red-600",
position: "bottom-center-right"
},
{
title: "TENDERING",
description: "Future project bidding",
icon: CheckCircle,
color: "bg-emerald-600",
position: "bottom"
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

    {/* Construction Workflow Flow Chart */}
    <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 mb-16">
      <h3 className="text-3xl font-bold text-center mb-12 text-primary">
        Construction Consultancy Workflow
      </h3>
      
      {/* Flow Chart Grid */}
      <div className="relative max-w-6xl mx-auto">
        {/* Top Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Site */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">SITE</h4>
              <p className="text-construction-grey text-sm">Construction site operations</p>
            </div>
          </div>
          
          {/* Arrow Down */}
          <div className="flex justify-center items-center">
            <div className="text-3xl text-primary/40 transform rotate-90 md:rotate-0">→</div>
          </div>
          
          {/* Bluetooth Devices */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Bluetooth className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">BLUETOOTH DEVICES</h4>
              <p className="text-construction-grey text-sm">IoT data collection</p>
            </div>
          </div>
        </div>

        {/* Middle Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Manual Entries */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">MANUAL ENTRIES</h4>
              <p className="text-construction-grey text-sm">Foreman data input</p>
            </div>
          </div>
          
          {/* Construction Consultancy (Center) */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-primary/30 hover:border-primary/50 min-w-[240px]">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                <Building className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">CONSTRUCTION CONSULTANCY</h4>
              <p className="text-construction-grey text-sm">Central processing hub</p>
            </div>
          </div>
          
          {/* Structured Data */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">STRUCTURED DATA</h4>
              <p className="text-construction-grey text-sm">Organized information</p>
            </div>
          </div>
        </div>

        {/* Bottom Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Dashboards */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">DASHBOARDS</h4>
              <p className="text-construction-grey text-sm">Data visualization</p>
            </div>
          </div>
          
          {/* Project Management */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Monitor className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">PROJECT MANAGEMENT</h4>
              <p className="text-construction-grey text-sm">Monitoring & control</p>
            </div>
          </div>
        </div>

        {/* Bottom Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Records */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">RECORDS</h4>
              <p className="text-construction-grey text-sm">Data archiving</p>
            </div>
          </div>
          
          {/* Claims & Arbitration */}
          <div className="flex justify-center">
            <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">CLAIMS & ARBITRATION</h4>
              <p className="text-construction-grey text-sm">Legal processes</p>
            </div>
          </div>
          
          {/* Arrow pointing to Tendering */}
          <div className="flex justify-center items-center">
            <div className="text-3xl text-primary/40 transform rotate-90 md:rotate-0">→</div>
          </div>
        </div>

        {/* Final Bottom - Tendering */}
        <div className="flex justify-center">
          <div className="group relative bg-card rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-border/50 hover:border-primary/20 min-w-[200px]">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">TENDERING</h4>
            <p className="text-construction-grey text-sm">Future project bids</p>
          </div>
        </div>

        {/* Connecting Arrows/Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Vertical connecting lines - hidden on mobile for clarity */}
          <div className="hidden md:block">
            {/* Top to middle connection */}
            <div className="absolute top-24 left-1/2 w-0.5 h-16 bg-primary/20 transform -translate-x-0.5"></div>
            
            {/* Middle to bottom connections */}
            <div className="absolute top-80 left-1/4 w-0.5 h-16 bg-primary/20 transform -translate-x-0.5"></div>
            <div className="absolute top-80 right-1/4 w-0.5 h-16 bg-primary/20 transform translate-x-0.5"></div>
            
            {/* Bottom section connections */}
            <div className="absolute bottom-32 left-1/3 w-0.5 h-16 bg-primary/20 transform -translate-x-0.5"></div>
            <div className="absolute bottom-16 left-1/2 w-0.5 h-16 bg-primary/20 transform -translate-x-0.5"></div>
          </div>
        </div>
      </div>
    </div>

    {/* CTA */}
    <div className="text-center">
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