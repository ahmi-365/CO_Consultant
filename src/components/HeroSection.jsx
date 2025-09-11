import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-construction.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Smart Construction Management.{" "}
          <span className="text-accent">Real-Time.</span>{" "}
          <span className="text-secondary">Reliable.</span>{" "}
          <span className="text-accent">Results.</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed text-white/90">
          From daily reporting to productivity estimation — we give you the tools to manage projects efficiently and securely.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button variant="hero" className="min-w-48">
            Get Started
          </Button>
          <Button variant="hero-outline" className="min-w-48">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;