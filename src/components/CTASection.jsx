import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-cta">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white leading-tight">
          Your Projects. Smarter, Faster, Safer.
        </h2>
        
        <p className="text-xl md:text-2xl mb-12 text-white/90 max-w-3xl mx-auto">
          Partner with CO Consultants Today.
        </p>
        
        <Button variant="cta" className="bg-white text-primary hover:bg-white/90">
          Book a Demo
        </Button>
      </div>
    </section>
  );
};

export default CTASection;