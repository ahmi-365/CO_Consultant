import React, { useEffect, useRef, useState } from 'react';
import { 
  Database, 
  Settings, 
  BarChart3, 
  Share2, 
  TrendingUp, 
  Lightbulb, 
  Archive, 
  DollarSign,
  Bluetooth,
  Users,
  FileText,
  Building,
  Clock,
  Monitor,
  Scale,
  CheckCircle
} from "lucide-react";

// Reusable component for the flow chart cards
const FlowCard = React.forwardRef(({ title, description, icon: Icon, color, isCentral, ...props }, ref) => {
  const sizeClass = isCentral ? "min-w-[240px] p-8" : "min-w-[200px] p-6";
  const iconSizeClass = isCentral ? "w-8 h-8" : "w-6 h-6";
  const titleSizeClass = isCentral ? "text-xl" : "text-lg";
  const cardBorderClass = isCentral ? "border-2 border-primary/30 hover:border-primary/50" : "border border-border/50 hover:border-primary/20";
  const cardShadowClass = isCentral ? "shadow-xl hover:shadow-2xl" : "shadow-lg hover:shadow-xl";

  return (
    <div 
      ref={ref}
      className={`group relative bg-card rounded-2xl ${sizeClass} ${cardShadowClass} transition-all duration-300 ${cardBorderClass} flex flex-col items-center text-center`}
      {...props}
    >
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={iconSizeClass} />
      </div>
      <h4 className={`${titleSizeClass} font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300`}>
        {title}
      </h4>
      <p className="text-construction-grey text-sm">
        {description}
      </p>
    </div>
  );
});

// New component for dynamic SVG connection lines with arrowheads
const ConnectionLine = ({ startRef, endRef }) => {
    const [pathData, setPathData] = useState('');
    const svgRef = useRef(null);

    useEffect(() => {
        const updatePath = () => {
            if (!startRef.current || !endRef.current || !svgRef.current) return;

            const startRect = startRef.current.getBoundingClientRect();
            const endRect = endRef.current.getBoundingClientRect();
            const svgRect = svgRef.current.getBoundingClientRect();

            const startX = startRect.left + startRect.width / 2 - svgRect.left;
            const startY = startRect.top + startRect.height - svgRect.top;
            const endX = endRect.left + endRect.width / 2 - svgRect.left;
            const endY = endRect.top - svgRect.top;

            let path;
            const horizontalDistance = endX - startX;
            const verticalDistance = endY - startY;

            if (Math.abs(horizontalDistance) < Math.abs(verticalDistance)) {
                // Vertical priority for a vertical flow (like from top to bottom)
                const midY = startY + verticalDistance / 2;
                path = `M ${startX} ${startY} V ${midY} H ${endX} V ${endY}`;
            } else {
                // Horizontal priority for a horizontal flow
                const midX = startX + horizontalDistance / 2;
                path = `M ${startX} ${startY} H ${midX} V ${endY} H ${endX}`;
            }
            setPathData(path);
        };

        updatePath();
        window.addEventListener('resize', updatePath);
        return () => window.removeEventListener('resize', updatePath);
    }, [startRef, endRef]);

    if (!pathData) return null;

    return (
        <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#E2E8F0" />
                </marker>
            </defs>
            <path d={pathData} fill="none" stroke="#E2E8F0" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </svg>
    );
};

const ProcessSection = () => {
  const processSteps = [
    { number: 1, title: "Data Collection", description: "Data gathered via manual entries (foremen/timekeepers) and IoT Bluetooth devices.", icon: Database, color: "bg-primary" },
    { number: 2, title: "Data Processing", description: "Remove duplicates, standardize formats, and analyze data using digital tools.", icon: Settings, color: "bg-secondary" },
    { number: 3, title: "Dashboard Development", description: "Generate interactive dashboards with man-hours, quantities, unit rates, and % progress linked to BOQ", icon: BarChart3, color: "bg-accent" },
    { number: 4, title: "Data Distribution", description: "Share dashboards daily via platforms like Microsoft Teams for manager-level access", icon: Share2, color: "bg-primary" },
    { number: 5, title: "Productivity Monitoring", description: "Identify low-productivity areas and disruption events using dashboard insights", icon: TrendingUp, color: "bg-secondary" },
    { number: 6, title: "Mitigation", description: "Enable daily decision-making and resource reallocation to resolve productivity issues", icon: Lightbulb, color: "bg-accent" },
    { number: 7, title: "Record Keeping", description: "Archive structured data for use in claims, arbitration, and formal reporting", icon: Archive, color: "bg-primary" },
    { number: 8, title: "Future Tendering and Estimating", description: "Use historical data to inform competitive, data-driven bids for similar future projects", icon: DollarSign, color: "bg-secondary" }
  ];

  // Use refs to get a handle on each card DOM element
  const siteRef = useRef(null);
  const bluetoothRef = useRef(null);
  const manualRef = useRef(null);
  const consultancyRef = useRef(null);
  const structuredRef = useRef(null);
  const dashboardsRef = useRef(null);
  const projectManagementRef = useRef(null);
  const recordsRef = useRef(null);
  const claimsRef = useRef(null);
  const tenderingRef = useRef(null);

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
                <div className={`w-12 h-12 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {step.number}
                </div>
                <div className="mb-4">
                  <IconComponent className="w-8 h-8 text-primary group-hover:text-accent transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-construction-grey leading-relaxed">
                  {step.description}
                </p>
                {index < processSteps.length - 1 && (index + 1) % 4 !== 0 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-primary/30">
                    →
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <hr className="my-16 border-t border-gray-200" />
        {/* Construction Workflow Flow Chart */}
        <div className="bg-card rounded-3xl p-8 shadow-lg border border-border/50 mb-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-primary">
            Construction Consultancy Workflow
          </h3>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="relative w-full">
              {/* Top Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
                <div className="flex justify-center">
                  <FlowCard ref={siteRef} title="SITE" description="Construction site operations" icon={Building} color="bg-slate-700" />
                </div>
                <div className="flex justify-center">
                  {/* Empty for spacing and central alignment */}
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={bluetoothRef} title="BLUETOOTH DEVICES" description="IoT data collection" icon={Bluetooth} color="bg-blue-600" />
                </div>
              </div>
              
              {/* Middle Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
                <div className="flex justify-center">
                  <FlowCard ref={manualRef} title="MANUAL ENTRIES" description="Foreman data input" icon={Users} color="bg-green-600" />
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={consultancyRef} title="CONSTRUCTION CONSULTANCY" description="Central processing hub" icon={Building} color="bg-orange-600" isCentral />
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={structuredRef} title="STRUCTURED DATA" description="Organized information" icon={Clock} color="bg-purple-600" />
                </div>
              </div>
              
              {/* Bottom Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 relative z-10">
                <div className="flex justify-center">
                  <FlowCard ref={dashboardsRef} title="DASHBOARDS" description="Data visualization" icon={BarChart3} color="bg-cyan-600" />
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={projectManagementRef} title="PROJECT MANAGEMENT" description="Monitoring & control" icon={Monitor} color="bg-indigo-600" />
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={recordsRef} title="RECORDS" description="Data archiving" icon={FileText} color="bg-teal-600" />
                </div>
              </div>

              {/* Bottom-most Row (Claims & Arbitration and Tendering) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="flex justify-center">
                  <FlowCard ref={claimsRef} title="CLAIMS & ARBITRATION" description="Legal processes" icon={Scale} color="bg-red-600" />
                </div>
                <div className="flex justify-center">
                  <FlowCard ref={tenderingRef} title="TENDERING" description="Future project bids" icon={CheckCircle} color="bg-emerald-600" />
                </div>
              </div>
              
              {/* Connection Lines rendered over the cards */}
              <ConnectionLine startRef={siteRef} endRef={consultancyRef} />
              <ConnectionLine startRef={bluetoothRef} endRef={consultancyRef} />
              <ConnectionLine startRef={manualRef} endRef={consultancyRef} />
              <ConnectionLine startRef={consultancyRef} endRef={structuredRef} />
              <ConnectionLine startRef={structuredRef} endRef={dashboardsRef} />
              <ConnectionLine startRef={structuredRef} endRef={projectManagementRef} />
              <ConnectionLine startRef={structuredRef} endRef={recordsRef} />
              <ConnectionLine startRef={recordsRef} endRef={claimsRef} />
              <ConnectionLine startRef={claimsRef} endRef={tenderingRef} />

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;