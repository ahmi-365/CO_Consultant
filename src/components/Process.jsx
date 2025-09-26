import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check } from "lucide-react";

const processes = [
  {
    id: 1,
    title: "Data Collection & Setup",
    description: "We integrate with your existing Excel systems, deploy RTLS tracking devices, implement QR-code access systems, and ensure all data is validated and cleaned.",
    steps: [
      "Integrate with Excel, RTLS, QR systems",
      "Deploy tracking devices",
      "Validate & clean data",
      "System integration testing"
    ]
  },
  {
    id: 2,
    title: "Dashboards & KPIs",
    description: "We create visual reporting via Power BI with custom KPIs tailored to your construction operations and implement predictive insights for project forecasting.",
    steps: [
      "Visual reporting via Power BI",
      "Custom KPIs development",
      "Predictive insights implementation",
      "Dashboard customization"
    ]
  },
  {
    id: 3,
    title: "Ongoing Support",
    description: "We provide comprehensive staff training, 24/7 technical support, and continuous refinement to ensure your construction data systems deliver maximum value.",
    steps: [
      "Staff training programs",
      "24/7 technical support",
      "Continuous system refinement",
      "Performance optimization"
    ]
  }
];

const Process = () => {
  const [activeProcess, setActiveProcess] = useState(1);
  const processRef = useRef(null);
  const processSectionsRef = useRef([]);

  useEffect(() => {
    processSectionsRef.current = processes.map((_, i) => processSectionsRef.current[i] || null);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          entries[0].target.classList.add('animate-fade-in');
          entries[0].target.style.opacity = '1';
          observer.unobserve(entries[0].target);
        }
      },
      {
        threshold: 0.1
      }
    );

    if (processRef.current) {
      observer.observe(processRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;

      let closestSection = null;
      let closestDistance = Infinity;

      processSectionsRef.current.forEach((section, index) => {
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = index;
        }
      });

      if (closestSection !== null) {
        setActiveProcess(closestSection + 1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="process" className="bg-white py-16 font-sans">
      <div className="container mx-auto px-4" ref={processRef}>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How We Work</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Our structured approach ensures your construction projects benefit from real-time data insights, predictive analytics, and continuous optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Process Navigation */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="sticky top-24 space-y-2 z-10">
              {processes.map((process) => (
                <button
                  key={process.id}
                  onClick={() => {
                    setActiveProcess(process.id);
                    const el = document.getElementById(`process-${process.id}`);
                    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-lg transition-all duration-300 transform hover:scale-105",
                    activeProcess === process.id
                      ? "bg-primary/10 shadow-lg border border-primary/20"
                      : "hover:bg-primary/5 hover:shadow-md"
                  )}
                >
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center mr-3 transition-all duration-300",
                        activeProcess === process.id
                          ? "bg-primary text-primary-foreground shadow-lg scale-110"
                          : "bg-gray-100 text-gray-500 hover:bg-primary/20"
                      )}
                    >
                      {activeProcess > process.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <span>{process.id}</span>
                      )}
                    </div>
                    <span
                      className={cn(
                        "font-medium transition-colors",
                        activeProcess === process.id
                          ? "text-primary font-semibold"
                          : "text-gray-600"
                      )}
                    >
                      {process.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Process Details */}
          <div className="md:col-span-8 lg:col-span-9">
            <div className="space-y-16">
              {processes.map((process) => (
                <div
                  id={`process-${process.id}`}
                  key={process.id}
                  className="scroll-mt-24 transition-all duration-500"
                  ref={(el) => (processSectionsRef.current[process.id - 1] = el)}
                >
                  <h3 className="text-2xl font-bold mb-4">{process.title}</h3>
                  <p className="text-gray-700 mb-6 ">{process.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {process.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20 hover:shadow-md transition-all duration-300 hover:scale-105"
                      >
                        <div className="flex items-center">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 text-sm font-semibold shadow-sm">
                            {idx + 1}
                          </div>
                          <span className="text-gray-700 font-medium">{step}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
