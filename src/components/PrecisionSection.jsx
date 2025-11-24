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
  {
    icon: BarChart3,
    title: "Make Data-Driven Decisions",
    description:
      "Replace guesswork with concrete data insights for strategic project planning and execution.",
    color: "bg-orange-400",
  },
];

const ConstructionDataMatters = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
            Why Construction Data Matters
          </h2>
          <p className="text-gray-600 text-lg">
            The construction industry loses billions annually due to poor project management.
            <br />
            Here's how real-time data changes everything.
          </p>
        </div>

        {/* SMALL CUTE STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-2xl p-4 text-center shadow-lg border border-gray-700 w-full"
            >
              <div className={`text-3xl font-bold ${stat.color} mb-2`}>
                {stat.percentage}
              </div>
              <p className="text-gray-300 text-xs leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>


        {/* IMPACT + IMAGE SECTION */}
        {/* IMPACT + IMAGE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* LEFT IMPACT LIST */}
          <div className="flex flex-col justify-center h-full">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
              The Real Impact of Smart Construction Management
            </h3>

            <div className="space-y-5">
              {impacts.map((impact, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className={`${impact.color} p-3 rounded-xl flex-shrink-0`}>
                    <impact.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                      {impact.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {impact.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* RIGHT IMAGE BOX */}
<div className="flex items-center justify-center h-full w-full">
  <div className="relative w-full max-w-md h-80">
    {/* IMAGE ONLY */}
    <img
      src="https://images.unsplash.com/photo-1636790920612-ed453c635e6c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8Q29uc3RydWN0aW9uJTIwRGF0YXxlbnwwfHwwfHx8MA%3D%3D"
      alt="Construction Site"
      className="w-full h-full object-cover rounded-2xl"
    />

    {/* TOP BADGE */}
    <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-3 border-2 border-blue-400">
      <div className="text-xl font-bold text-blue-600">98%</div>
      <div className="text-[10px] text-gray-600 text-center">
        Client Satisfaction
      </div>
    </div>

    {/* BOTTOM BADGE */}
    <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-3 border-2 border-cyan-400">
      <div className="text-xl font-bold text-cyan-600">24/7</div>
      <div className="text-[10px] text-gray-600 text-center">
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
