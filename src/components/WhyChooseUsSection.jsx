import { Check } from "lucide-react";

const benefits = [
  "Trusted by top contractors nationwide",
  "Seamless team collaboration tools",
  "Scalable for projects of all sizes",
  "Transparent reporting and analytics"
];

const WhyChooseUsSection = () => {
return (
    <section className="py-0 bg-white">
      <div className="container mx-auto px-4">
        {/* Mobile view: Title, Description, Image, Benefits */}
        <div className="block lg:hidden">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 text-center lg:text-left">
            Why Choose CO Consultants?
          </h2>

          <p className="text-xl text-gray-600 mb-10 leading-relaxed text-center lg:text-left">
            We combine industry expertise with cutting-edge technology to deliver construction management solutions that drive real results.
          </p>

          {/* Image */}
          <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center overflow-hidden mb-10">
            <img
              src="../../Assets/Under construction-cuate.png"
              alt="Data Collection and Processing Workflow - From manual entries and IoT devices to interactive dashboards and claims management"
              className="w-full h-auto object-contain p-6 rounded-2xl shadow-lg"
            />
          </div>

          <div className="space-y-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
                <span className="text-lg text-black font-medium hover:text-yellow-500 transition-colors">
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop view: Original layout */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="ml-6 lg:ml-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
              Why Choose CO Consultants?
            </h2>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              We combine industry expertise with cutting-edge technology to deliver construction management solutions that drive real results.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <span className="text-lg text-black font-medium hover:text-yellow-500 transition-colors">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative w-full max-w-3xl mx-auto flex items-center justify-center overflow-hidden">
            <img
              src="../../Assets/Under construction-cuate.png"
              alt="Data Collection and Processing Workflow - From manual entries and IoT devices to interactive dashboards and claims management"
              className="w-full h-auto object-contain p-6 rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;