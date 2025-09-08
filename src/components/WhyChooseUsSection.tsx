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
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl overflow-hidden">
              <img 
                src="/lovable-uploads/6687eb58-ac4f-4cdf-8af2-0546ae5d6743.png" 
                alt="Data Collection and Processing Workflow - From manual entries and IoT devices to interactive dashboards and claims management"
                className="w-full h-full object-contain p-6"
              />
            </div>
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