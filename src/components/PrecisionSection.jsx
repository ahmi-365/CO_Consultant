import { Clock, DollarSign, Users, BarChart3 } from "lucide-react";

const stats = [
  {
    percentage: "77%",
    description: "of construction projects exceed their original timeline",
    color: "text-cyan-400",
  },
  {
    percentage: "$1.6T",
    description: "lost annually due to construction delays and inefficiencies",
    color: "text-yellow-400",
  },
  {
    percentage: "20%",
    description: "improvement in productivity with real-time tracking",
    color: "text-orange-400",
  },
  {
    percentage: "35%",
    description: "reduction in project overruns with data-driven management",
    color: "text-red-400",
  },
];

const impacts = [
  {
    icon: Clock,
    title: "Reduce Project Delays",
    description:
      "Real-time monitoring helps identify bottlenecks early, preventing costly delays and keeping projects on schedule.",
    color: "bg-cyan-400",
  },
  {
    icon: DollarSign,
    title: "Control Budget Overruns",
    description:
      "Track resource utilization and costs in real-time to prevent budget overruns and optimize spending.",
    color: "bg-yellow-400",
  },
  {
    icon: Users,
    title: "Optimize Workforce",
    description:
      "Understand productivity patterns and allocate human resources more effectively across projects.",
    color: "bg-lime-400",
  },
];

const ConstructionDataMatters = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Why Construction Data Matters
          </h2>
        </div>

        {/* SMALL STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl p-3 text-center shadow border border-gray-700 w-full"
            >
              <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                {stat.percentage}
              </div>
              <p className="text-gray-300 text-xs leading-tight">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* IMPACT + IMAGE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT IMPACT LIST */}
          <div className="flex flex-col justify-center h-full">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              The Real Impact of Smart Construction Management
            </h3>

            <div className="space-y-4">
              {impacts.map((impact, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className={`${impact.color} p-2 rounded-lg flex-shrink-0`}>
                    <impact.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-800 mb-1">
                      {impact.title}
                    </h4>
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {impact.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT IMAGE BOX */}
          <div className="flex items-center justify-center h-full w-full">
            <div className="relative w-full max-w-sm h-64">
              {/* IMAGE ONLY */}
              <img
                src="https://images.unsplash.com/photo-1636790920612-ed453c635e6c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Q29uc3RydWN0aW9uJTIwRGF0YXxlbnwwfHwwfHx8MA%3D%3D"
                alt="Construction Site"
                className="w-full h-full object-cover rounded-xl"
              />

              {/* TOP BADGE */}
              <div className="absolute -top-3 -right-3 bg-white rounded-lg shadow p-2 border border-blue-400">
                <div className="text-lg font-bold text-blue-600">98%</div>
                <div className="text-[9px] text-gray-600 text-center">
                  Client Satisfaction
                </div>
              </div>

              {/* BOTTOM BADGE */}
              <div className="absolute -bottom-3 -left-3 bg-white rounded-lg shadow p-2 border border-cyan-400">
                <div className="text-lg font-bold text-cyan-600">24/7</div>
                <div className="text-[9px] text-gray-600 text-center">
                  Monitoring
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ConstructionDataMatters;