import { useState, useRef, useEffect } from "react";
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
      icon: <Search className="w-8 h-8 text-white" />,
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
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      title: "Project-Specific Dashboards",
      description: (
        <>
          We do not use one size fits all templates. Every dashboard we deliver
          is:
          <ul className="list-disc ml-6 mt-3 text-gray-600 space-y-1">
            <li>Tailored to your project needs</li>
            <li>Powered by AI</li>
            <li>
              Built to highlight productivity, progress, and performance metrics
              that matter
            </li>
          </ul>
          <p className="mt-3">
            Whether you're managing a megaproject or an industrial retrofit, our
            analytics adapt to your site — not the other way around.
          </p>
        </>
      ),
    },
    {
      icon: <Brain className="w-8 h-8 text-white" />,
      title: "AI-Supported Productivity Insights",
      description: (
        <>
          Our smart backend leverages historical and live project data to:
          <ul className="list-disc ml-6 mt-3 text-gray-600 space-y-1">
            <li>Automate alerts on inefficiencies</li>
            <li>Recommend manpower/equipment reallocation</li>
            <li>Improve future tendering accuracy</li>
          </ul>
          <p className="mt-3 text-yellow-600 font-medium">
            We turn data into decisions.
          </p>
        </>
      ),
    },
    {
      icon: <Folder className="w-8 h-8 text-white" />,
      title: "Daily Trackers, Done Right",
      description: (
        <>
          We provide plug and play daily reporting templates that your site
          teams can use effortlessly. Whether Excel based or IoT connected, our
          templates ensure:
          <ul className="list-disc ml-6 mt-3 text-gray-600 space-y-1">
            <li>Accurate manpower logs</li>
            <li>Equipment utilization insights</li>
            <li>Daily progress breakdowns by discipline</li>
          </ul>
        </>
      ),
    },
    {
      icon: <Handshake className="w-8 h-8 text-white" />,
      title: "Local Experience, Global Standards",
      description: (
        <>
          With over a decade of hands on project management experience across:
          <p className="mt-3 font-semibold text-gray-700 text-lg">
            🇦🇪 UAE • 🇹🇷 Turkey • 🇶🇦 Qatar • 🇷🇺 Russia • 🇸🇦 Saudi Arabia • 🇮🇶
            Iraq • 🇰🇿 Kazakhstan • 🇯🇴 Jordan • 🇪🇸 Spain
          </p>
          <p className="mt-3">
            We understand what clients, contractors, and consultants need — and
            how to align them around <b>facts, not friction.</b>
          </p>
        </>
      ),
    },
    {
      icon: <Lock className="w-8 h-8 text-white" />,
      title: "Secure, Structured, Centralised",
      description: (
        <>
          Your data stays in one place.{" "}
          <b>Clean. Organised. Accessible. Secure.</b>
          <p className="mt-3">
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
    // Scroll to step counter smoothly
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
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Because We Don't Just Track Projects, We Organise Construction 
            <span className="text-yellow-600 font-semibold text-xl ml-2">
               Intelligently.
            </span>
          </p>
        </div>

        {/* Progress dots - clickable navigation */}
        <div className="flex justify-center items-center gap-3 mb-8">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepChange(index)}
              className={`rounded-full transition-all duration-300 hover:scale-110 ${
                index === currentStep
                  ? "w-12 h-3 bg-yellow-500"
                  : index < currentStep
                  ? "w-3 h-3 bg-yellow-300"
                  : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Step counter - scroll target */}
        <div ref={stepCounterRef} className="text-center mb-6">
          <span className="text-sm font-semibold text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Main content card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8 min-h-[400px] border border-gray-100">
          <div className="flex flex-col items-center">
            {/* Icon */}
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg mb-6">
              {currentStepData.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              {currentStepData.title}
            </h3>

            {/* Description */}
            <div className="text-gray-700 text-base md:text-lg leading-relaxed max-w-3xl">
              {currentStepData.description}
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              currentStep === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gray-800 text-white hover:bg-gray-700 hover:shadow-lg"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepChange(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-yellow-500 scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
              currentStep === steps.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-yellow-500 text-white hover:bg-yellow-600 hover:shadow-lg"
            }`}
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Optional: Summary link at the end */}
        {currentStep === steps.length - 1 && (
          <div className="text-center mt-8">
            <button
              onClick={() => handleStepChange(0)}
              className="text-yellow-600 font-semibold hover:text-yellow-700 underline"
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