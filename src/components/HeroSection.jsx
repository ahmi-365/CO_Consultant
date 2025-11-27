import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-construction.jpg";
import { GravityStarsBackground } from "./GravityStarsBackground";
import { LayoutTextFlip } from "./layout-text-flip";

const HeroSection = () => {
  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="
        relative min-h-[100vh] 
        flex items-center justify-center 
        overflow-hidden 
        bg-gray-50 dark:bg-gray-900
      "
      onMouseMove={(e) => {
        const starsBg = document.querySelector('[data-slot="gravity-stars-background"]');
        if (starsBg) starsBg.dispatchEvent(new MouseEvent("mousemove", e));
      }}
      onTouchMove={(e) => {
        const starsBg = document.querySelector('[data-slot="gravity-stars-background"]');
        if (starsBg) starsBg.dispatchEvent(new TouchEvent("touchmove", e));
      }}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-blue-900/70 dark:from-blue-950/90 dark:to-blue-900/70" />

      {/* Stars Background */}
      <GravityStarsBackground
        starsCount={150}
        starsSize={2}
        starsOpacity={0.8}
        glowIntensity={20}
        movementSpeed={0.2}
        mouseInfluence={170}
        mouseGravity="attract"
        gravityStrength={170}
        className="absolute inset-0 z-0"
      />

      {/* Content */}
      <div
        className="
          relative z-10 container mx-auto px-4 sm:px-6 text-center text-white 
          animate-fade-in flex flex-col items-center justify-center
          py-20 sm:py-24 md:py-32
        "
      >
        {/* Responsive Heading */}
        <h1
          className="
            text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl 
            font-bold mb-4 sm:mb-6 leading-tight
            px-2 sm:px-4
          "
        >
          <span className="inline md:inline">Smart Construction </span>
          <span className="block md:inline">
            <LayoutTextFlip
              text=""
              words={["Management", "Solutions", "Innovation", "Excellence"]}
              className="text-white inline"
            />
          </span>
          <br className="hidden md:inline" />
          <span className="text-yellow-400">Real Time.</span>{" "}
          <span className="text-blue-400">Reliable</span>{" "}
          <span className="text-yellow-400">Results.</span>
        </h1>

        {/* Responsive Paragraph */}
        <p
          className="
            text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl 
            mb-8 sm:mb-12 md:mb-16 
            max-w-xs xs:max-w-md sm:max-w-lg md:max-w-2xl mx-auto 
            leading-relaxed text-gray-200 dark:text-gray-300
            px-4 sm:px-6
          "
        >
          From daily reporting to productivity estimation we give you the
          tools to manage projects efficiently and securely.
        </p>

        {/* Responsive Button */}
        <div className="flex justify-center items-center w-full px-4">
          <Button
            onClick={scrollToContact}
            className="
              relative inline-flex items-center justify-center 
              w-full xs:w-auto
              max-w-xs xs:max-w-none
              min-w-[160px] xs:min-w-[180px] sm:min-w-[200px]
              px-6 xs:px-7 sm:px-8 
              py-3 xs:py-3.5 sm:py-4 
              text-sm xs:text-base sm:text-lg 
              font-semibold 
              text-white bg-blue-600 hover:bg-blue-700 
              rounded-lg shadow-md hover:shadow-lg
              transition-all duration-300 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
              active:scale-95
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