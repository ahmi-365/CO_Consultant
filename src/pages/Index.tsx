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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section id="hero">
          <HeroSection />
        </section>
        <ServicesSection />
        <PrecisionSection />
        <section id="why-choose-us">
          <WhyChooseUsSection />
        </section>
        <ProcessSection />
        <DataAnalyticsSection />
        {/* <ProjectsSection /> */}
        <ContactSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
