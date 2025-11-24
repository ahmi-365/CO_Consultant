import { useState, useRef } from "react";
import {
  Search,
  BarChart3,
  Brain,
  Folder,
  Handshake,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const WhyChooseUsSection = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const stepCounterRef = useRef(null);

  const steps = [
    {
      icon: <Search className="w-6 h-6 text-white" />,
      title: "Precision Powered Tracking",
      description: (
        <>
          We integrate <b>Bluetooth RTLS, QR Codes, and RFID systems</b> to
          enable real time, site wide tracking of manpower and equipment.
          <br />
          <span className="text-yellow-600 font-medium mt-2 block">
            No guesswork, just ground truth.
          </span>
        </>
      ),
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: "Project-Specific Dashboards",
      description: (
        <>
          We do not use one size fits all templates. Every dashboard we deliver
          is:
          <ul className="list-disc ml-6 mt-2 text-gray-600 space-y-1">
            <li>Tailored to your project needs</li>
            <li>Powered by AI</li>
            <li>
              Built to highlight productivity, progress, and performance metrics
              that matter
            </li>
          </ul>
          <p className="mt-2">
            Whether you're managing a megaproject or an industrial retrofit, our
            analytics adapt to your site — not the other way around.
          </p>
        </>
      ),
    },
    {
      icon: <Brain className="w-6 h-6 text-white" />,
      title: "AI-Supported Productivity Insights",
      description: (
        <>
          Our smart backend leverages historical and live project data to:
          <ul className="list-disc ml-6 mt-2 text-gray-600 space-y-1">
            <li>Automate alerts on inefficiencies</li>
            <li>Recommend manpower/equipment reallocation</li>
            <li>Improve future tendering accuracy</li>
          </ul>
          <p className="mt-2 text-yellow-600 font-medium">
            We turn data into decisions.
          </p>
        </>
      ),
    },
    {
      icon: <Folder className="w-6 h-6 text-white" />,
      title: "Daily Trackers, Done Right",
      description: (
        <>
          We provide plug and play daily reporting templates that your site
          teams can use effortlessly. Whether Excel based or IoT connected, our
          templates ensure:
          <ul className="list-disc ml-6 mt-2 text-gray-600 space-y-1">
            <li>Accurate manpower logs</li>
            <li>Equipment utilization insights</li>
            <li>Daily progress breakdowns by discipline</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Handshake className="w-6 h-6 text-white" />,
      title: "Local Experience, Global Standards",
      description: (
        <>
          With over a decade of hands on project management experience across:
          <p className="mt-2 font-semibold text-gray-700">
            🇦🇪 UAE • 🇹🇷 Turkey • 🇶🇦 Qatar • 🇷🇺 Russia • 🇸🇦 Saudi Arabia • 🇮🇶
            Iraq • 🇰🇿 Kazakhstan • 🇯🇴 Jordan • 🇪🇸 Spain
          </p>
          <p className="mt-2">
            We understand what clients, contractors, and consultants need — and
            how to align them around <b>facts, not fiction.</b>
          </p>
        </>
      ),
    },
    {
      icon: <Lock className="w-6 h-6 text-white" />,
      title: "Secure, Structured, Centralised",
      description: (
        <>
          Your data stays in one place.{" "}
          <b>Clean. Organised. Accessible. Secure.</b>
          <p className="mt-2">
            We offer a single source of truth for your daily reports, claims
            documents, and delay analysis inputs — ensuring traceability from
            Day 1 to Final Account.
          </p>
        </>
      ),
    },
  ];

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    setTimeout(() => {
      stepCounterRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 100);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepChange(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      handleStepChange(currentStep - 1);
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <section className="py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        {/* Section heading */}
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Why Choose Us?
          </h2>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Because We Don't Just Track Projects, We Organise Construction 
            <span className="text-yellow-600 font-semibold text-base ml-1">
               Intelligently.
            </span>
          </p>
        </div>

        {/* Progress dots - clickable navigation */}
       

        {/* Step counter - scroll target */}
        {/* <div ref={stepCounterRef} className="text-center mb-3">
          <span className="text-xs font-semibold text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div> */}

        {/* Main content card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-4 min-h-[280px] border border-gray-100">
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg mb-4">
              {currentStepData.icon}
            </div>

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <div className="text-gray-700 text-sm md:text-base leading-relaxed max-w-2xl">
              {currentStepData.description}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

           <div className="flex justify-center items-center gap-2 mb-4">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepChange(index)}
              className={`rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentStep
                  ? "w-8 h-2 bg-yellow-500"
                  : index < currentStep
                  ? "w-2 h-2 bg-yellow-300"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              currentStep === steps.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Optional: Summary link at the end */}
        {currentStep === steps.length - 1 && (
          <div className="text-center mt-4">
            <button
              onClick={() => handleStepChange(0)}
              className="text-yellow-600 text-sm font-semibold hover:text-yellow-700 underline"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhyChooseUsSection;