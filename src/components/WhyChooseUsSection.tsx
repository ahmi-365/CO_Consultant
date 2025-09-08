import { Check } from "lucide-react";

const benefits = [
  "Trusted by top contractors nationwide",
  "Seamless team collaboration tools", 
  "Scalable for projects of all sizes",
  "Transparent reporting and analytics"
];

const WhyChooseUsSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Data Collection Workflow Image */}
  <div className="relative h-[500px] w-[600px] flex items-center justify-center overflow-hidden mx-auto">
  <img
    src="/lovable-uploads/placeholder2.jpg"
    alt="Data Collection and Processing Workflow - From manual entries and IoT devices to interactive dashboards and claims management"
    className="max-h-full max-w-full object-contain p-6 rounded-2xl shadow-lg"
  />
</div>



          
          {/* Right: Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-primary">
              Why Choose CO Consultants?
            </h2>
            
            <p className="text-xl text-construction-grey mb-10 leading-relaxed">
              We combine industry expertise with cutting-edge technology to deliver construction management solutions that drive real results.
            </p>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <span className="text-lg text-foreground font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;