import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import PrecisionSection from "@/components/PrecisionSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ProcessSection from "@/components/ProcessSection";
import DataAnalyticsSection from "@/components/DataAnalyticsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { HoleBackground } from "../components/backgrounds/Holebackgound";
import SmoothFollower from "@/components/SmoothFollower";
const Index = () => {
  return (
    <div className="min-h-screen">
              <SmoothFollower />
      
      <Header />
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <ServicesSection />
        <section id="data-matters">
          <HoleBackground />
          <PrecisionSection />
        </section>
        <section id="why-choose-us">
          <WhyChooseUsSection />
        </section>
        <section id="workflow">
        <DataAnalyticsSection />
        </section>
        
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
