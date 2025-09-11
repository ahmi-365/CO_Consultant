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
    <section className="min-h-screen flex items-center bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left: Content */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-snug">
              <span className="text-primary">Build Your Future with</span>{" "}
              <span className="text-accent">Precision</span>
            </h2>

            <p className="text-base md:text-lg text-construction-grey mb-6 leading-relaxed">
              Specializing in tailored solutions for your construction and
              engineering needs, we ensure your projects are executed with
              excellence.
            </p>

            <div className="space-y-5">
              {services.map((service) => {
                const IconComponent = service.icon;
                return (
                  <div
                    key={service.number}
                    className="bg-card rounded-xl p-4 shadow-md border border-border/50 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm group-hover:scale-110 transition-transform duration-300">
                          {service.number}
                        </div>
                      </div>

                      <div className="flex-grow">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-5 h-5 text-accent" />
                          <h3 className="text-lg font-semibold text-foreground">
                            {service.title}
                          </h3>
                        </div>

                        <p className="text-construction-grey mb-2 text-sm leading-snug">
                          {service.description}
                        </p>

                        <ul className="space-y-1">
                          {service.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-xs text-construction-grey"
                            >
                              <div className="w-1.5 h-1.5 bg-accent rounded-full flex-shrink-0" />
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

          {/* Right: Image */}
         <div className="flex justify-center">
  <div className="hidden md:block">
    <img
      src="/lovable-uploads/placeholder.png"
      alt="Uploaded"
      className="w-full h-full object-cover"
    />
  </div>
</div>

        </div>
      </div>
    </section>
  );
};

export default PrecisionSection;