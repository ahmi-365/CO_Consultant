import { Wrench, Target, Users } from "lucide-react";

const services = [
  {
    number: 1,
    title: "Precision Engineering",
    description: "Transforming complex designs into reality with meticulous attention to detail.",
    icon: Wrench,
    features: [
      "Advanced CAD design capabilities",
      "Quality control at every stage",
      "Technical expertise and innovation"
    ]
  },
  {
    number: 2,
    title: "Strategic Project Management", 
    description: "Our approachable team ensures timely and budget-friendly delivery of your projects.",
    icon: Target,
    features: [
      "Timeline optimization",
      "Budget management",
      "Risk mitigation strategies"
    ]
  },
  {
    number: 3,
    title: "Client-Centric Solutions",
    description: "We prioritize your needs to offer a custom approach that elevates your projects.",
    icon: Users,
    features: [
      "Tailored project solutions",
      "Dedicated support team",
      "Transparent communication"
    ]
  }
];

const PrecisionSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="text-primary">Build Your Future with</span>{" "}
              <span className="text-accent">Precision</span>
            </h2>
            
            <p className="text-xl text-construction-grey mb-12 leading-relaxed">
              Specializing in tailored solutions for your construction and engineering needs, 
              we ensure your projects are executed with excellence.
            </p>
            
            <div className="space-y-8">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div 
                    key={service.number}
                    className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                          {service.number}
                        </div>
                      </div>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className="w-6 h-6 text-accent" />
                          <h3 className="text-xl font-bold text-foreground">
                            {service.title}
                          </h3>
                        </div>
                        
                        <p className="text-construction-grey mb-4 leading-relaxed">
                          {service.description}
                        </p>
                        
                        <ul className="space-y-2">
                          {service.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-construction-grey">
                              <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Right: Image Placeholder */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-3xl flex items-center justify-center p-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-muted/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">Image Placeholder</span>
                </div>
                <p className="text-muted-foreground text-sm">Your image will go here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrecisionSection;