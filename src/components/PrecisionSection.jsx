import { Wrench, Target, Users } from "lucide-react";

const services = [
  {
    number: 1,
    title: "Precision Engineering",
    description:
      "Transforming complex designs into reality with meticulous attention to detail, ensuring every element is crafted with precision and innovation to deliver unmatched engineering excellence.",
    icon: Wrench,
    features: [
      "Advanced CAD design capabilities",
      "Quality control at every stage",
      "Technical expertise and innovation",
      "3D modeling & visualization",
      "Cutting-edge machinery integration",
      "Sustainable & eco-friendly practices",
    ],
  },
  {
    number: 3,
    title: "Strategic Project Management",
    description:
      "Our approachable team ensures timely and budget-friendly delivery of your projects, while maintaining clear communication and proactive strategies to overcome challenges with ease.",
    icon: Target,
    features: [
      "Timeline optimization",
      "Budget management",
      "Risk mitigation strategies",
      "Agile and adaptive planning",
      "Milestone tracking with transparency",
    ],
  },
  {
    number: 2,
    title: "Client-Centric Solutions",
    description:
      "We prioritize your needs to offer a custom approach that elevates your projects.",
    icon: Users,
    features: [
      "Tailored project solutions",
      "Dedicated support team",
      "Transparent communication",
    ],
  },
];

const PrecisionSection = () => {
return (
    <section className="min-h-screen flex items-center bg-white py-4">
      <div className="container mx-auto px-4">
        {/* Title & Description - full width */}
        <div className="text-center max-w-3xl mx-auto mt-12 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold leading-snug">
            <span className="text-gray-900">Build Your Future with</span>{" "}
            <span className="text-yellow-500">Precision</span>
          </h2>
          <p className="text-base md:text-lg text-gray-600 mt-4 leading-relaxed">
            Specializing in tailored solutions for your construction and
            engineering needs, we ensure your projects are executed with
            excellence.
          </p>
        </div>

        {/* Mobile view: All content in sequential order */}
        <div className="block lg:hidden">
          {/* Image */}
          <div className="relative w-full max-w-md mx-auto mb-8">
            <img
              src="../../Assets/truck-cuate.png"
              alt="Construction Crane"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* All services in order */}
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.number} className="space-y-3 mb-10">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {service.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <IconComponent className="w-5 h-5 text-yellow-500" />
                    {service.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-base leading-normal pl-12">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="list-disc list-inside text-base space-y-1 ml-12">
                  {service.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-black hover:text-yellow-500 transition-colors"
                    >
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Desktop view: Original layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Image + 3rd Step */}
          <div className="flex flex-col items-center justify-start h-full">
            <div className="relative w-full max-w-md md:max-w-lg mb-6 -mt-24">
              <img
                src="../../Assets/truck-cuate.png"
                alt="Construction Crane"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* 3rd Step Below Image */}
            <div className="w-full max-w-md relative -top-16">
              {(() => {
                const service = services[2];
                const IconComponent = service.icon;
                return (
                  <div key={service.number} className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {service.number}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-yellow-500" />
                        {service.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-base leading-normal pl-12">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="list-disc list-inside text-base space-y-1 ml-16">
                      {service.features.map((feature, index) => (
                        <li
                          key={index}
                          className="text-black hover:text-yellow-500 transition-colors"
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Right: Step 1 & 2 */}
          <div className="h-full flex flex-col justify-between mt-4">
            {services.slice(0, 2).map((service) => {
              const IconComponent = service.icon;
              return (
                <div key={service.number} className="space-y-3 mb-10">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-900 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                      {service.number}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <IconComponent className="w-5 h-5 text-yellow-500" />
                      {service.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-base leading-normal pl-12">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="list-disc list-inside text-base space-y-1 ml-16">
                    {service.features.map((feature, index) => (
                      <li key={index} className="text-black hover:text-yellow-500 transition-colors">
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrecisionSection;