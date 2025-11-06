import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-construction.jpg";

const HeroSection = () => {
  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroImage})`,
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70 dark:from-blue-950/90 dark:to-blue-900/70" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white animate-fade-in flex flex-col items-center pt-24 md:pt-32">
        {/* Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Smart Construction Management.{" "}
          <span className="text-yellow-400">Real Time.</span>{" "}
          <span className="text-blue-400">Reliable</span>{" "}
          <span className="text-yellow-400">Results.</span>
        </h1>

        {/* Paragraph */}
        <p className="text-xl md:text-2xl mb-16 max-w-3xl mx-auto leading-relaxed text-gray-200 dark:text-gray-300">
          From daily reporting to productivity estimation we give you the
          tools to manage projects efficiently and securely.
        </p>

        {/* Buttons */}
        <div className="flex justify-center items-center">
          <Button
            onClick={() => {
              const contactSection = document.getElementById("contact");
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="
                      relative inline-flex items-center justify-center 
                      min-w-48 px-8 py-4 text-lg font-semibold 
                      text-white bg-blue-600 hover:bg-blue-700 
                      rounded-lg shadow-md hover:shadow-lg
                      transition-all duration-300 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
  "
          >
            Contact Us
          </Button>

        </div>

      </div>
    </section>
  );
};

export default HeroSection;
