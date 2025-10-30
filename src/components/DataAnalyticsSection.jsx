import { BarChart3, TrendingUp, Database, Target } from "lucide-react";

const analyticsFeatures = [
  {
    title: "Data Collection",
    description:
      "Comprehensive data gathering from manual entries and IoT Bluetooth devices for real-time manpower tracking.",
    icon: Database,
  },
  {
    title: "Data Processing",
    description:
      "Advanced duplicate removal, data structuring, and analysis tools to ensure clean, actionable insights.",
    icon: BarChart3,
  },
  {
    title: "Interactive Dashboards",
    description:
      "Real-time dashboards displaying manhours, quantities, progress metrics, and key performance indicators.",
    icon: TrendingUp,
  },
  {
    title: "Claims & Tendering",
    description:
      "Structured record keeping for potential claims, arbitration, and future project tendering optimization.",
    icon: Target,
  },
];

const DataAnalyticsSection = () => {
  return (
    <section className="py-0 bg-white">
      <div className="container mx-auto px-3">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center min-h-[90vh]">
          {/* Left: Content */}
          <div className="flex flex-col justify-center px-4">
            <h2 className="text-5xl md:text-4xl font-bold text-gray-900 mb-2">
              Complete Data Analytics Workflow
            </h2>

            <p className="text-base md:text-lg text-gray-600 mb-4 leading-snug max-w-2xl">
              From collection to claims – our workflow turns data into actionable insights.
            </p>

            <div className="space-y-3">
              {analyticsFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 group">
                    <div className="bg-blue-900/10 rounded-lg p-2 group-hover:bg-blue-900/20 transition-colors duration-300 flex-shrink-0">
                      <IconComponent className="w-5 h-5 text-blue-900" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-black mb-0.5">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600 text-sm leading-snug">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Image */}
          <div className="bg-white rounded-2xl p-4 shadow border border-gray-200">
            <h3 className="text-2xl font-bold text-center mb-3 text-gray-900">
              Data Analytics Workflow
            </h3>
            <div className="bg-gradient-to-br from-blue-400/10 to-blue-900/10 rounded-xl overflow-hidden h-80">
              <img
                src="/lovable-uploads/bgremoved2.png"
                alt="Data Analytics Workflow - Complete process from data collection through processing to interactive dashboards and claims management"
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DataAnalyticsSection;
