import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Wifi, 
  BarChart3, 
  Brain,
  ClipboardCheck,
  Users,
  PieChart,
  Cpu,
  Filter,
  CircuitBoard,
  Play,
  Activity,
  CheckCircle2,
  Pause
} from 'lucide-react';
import { motion } from 'framer-motion';

const DataAnalyticsFlow = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);

  const [metrics, setMetrics] = useState({ 1: 450, 2: 2100, 3: 780, 4: 320 });

  // UPDATED ORDER HERE
  const steps = useMemo(() => [
    // --------------------------
    // 01 – DATA COLLECTION
    // --------------------------
    {
      id: 1,
      title: "Data Collection",
      subtitle: "Information Gathering",
      desc: "Comprehensive data gathering from manual entries and IoT blueprint devices for real-time employee tracking.",
      metricLabel: "Data Points Collected",
      statusText: "Collection Active",
      icon: Wifi,
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
      stroke: "#10b981",
      bg: "bg-emerald-50",
      border: "border-emerald-500",
      text: "text-emerald-600",
      shadow: "shadow-emerald-500/30",
      pathProgress: 0.14,
      storageText: "Real-Time Sync"
    },

    // --------------------------
    // 02 – DATA PROCESSING
    // --------------------------
    {
      id: 2,
      title: "Data Processing",
      subtitle: "Advanced Analytics",
      desc: "Advanced algorithmic framework, data cleaning, transformation, and mining for actionable insights.",
      metricLabel: "Records Processed",
      statusText: "Processing Active",
      icon: Brain,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      stroke: "#8b5cf6",
      bg: "bg-purple-50",
      border: "border-purple-500",
      text: "text-purple-600",
      shadow: "shadow-purple-500/30",
      pathProgress: 0.38,
      storageText: "AI-Powered Analysis"
    },

    // --------------------------
    // 03 – INTERACTIVE DASHBOARDS
    // --------------------------
    {
      id: 3,
      title: "Interactive Dashboards",
      subtitle: "Visual Analytics",
      desc: "Real-time dashboards for displaying insights, workforce trends and emerging patterns with key performance indicators.",
      metricLabel: "Active Visualizations",
      statusText: "Dashboard Live",
      icon: BarChart3,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      stroke: "#3b82f6",
      bg: "bg-blue-50",
      border: "border-blue-500",
      text: "text-blue-600",
      shadow: "shadow-blue-500/30",
      pathProgress: 0.63,
      storageText: "Live Updates"
    },

    // --------------------------
    // 04 – CLAIMS & TENDERING
    // --------------------------
    {
      id: 4,
      title: "Claims & Tendering",
      subtitle: "Financial Planning",
      desc: "Structured record keeping for potential claims, arbitration, and future project tendering optimization.",
      metricLabel: "Claims Processed",
      statusText: "Tracking Active",
      icon: FileText,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      stroke: "#ea580c",
      bg: "bg-orange-50",
      border: "border-orange-500",
      text: "text-orange-600",
      shadow: "shadow-orange-500/30",
      pathProgress: 1.0,
      storageText: "Secure Documentation"
    }
  ], []);

  // Live Counter
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        [activeStep]: prev[activeStep] + Math.floor(Math.random() * 5)
      }));
    }, 200);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Auto Play
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveStep(prev => (prev === 4 ? 1 : prev + 1));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleStepClick = (id) => {
    setIsAutoPlaying(false);
    setActiveStep(id);
  };

  const pipePath = "M 0,180 L 240,180 Q 280,180 280,140 L 280,80 Q 280,40 320,40 L 600,40 Q 640,40 640,80 L 640,140 Q 640,180 680,180 L 960,180 Q 1000,180 1000,140 L 1000,80 Q 1000,40 1040,40 L 1200,40";

  return (
    <section className="relative w-full min-h-[600px] bg-white text-gray-900 flex flex-col overflow-hidden font-sans selection:bg-blue-100 py-6 sm:py-8">

      {/* TOP BAR */}
      <div className="w-full px-4 sm:px-6 flex justify-center items-center mb-6 sm:mb-8 relative">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Data Analytics Workflow
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-medium flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>From collection to claims our workflow turns data into actionable insights.</span>
          </p>
        </div>

        {/* DEMO BUTTON */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`
            pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95
            ${isAutoPlaying ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' : 'bg-gray-900 text-white'}
            absolute right-4
          `}
        >
          {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isAutoPlaying ? "Pause Demo" : "Demo Workflow"}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 relative">

        {/* PIPE VISUALIZATION */}
        <div className="relative w-full h-[200px] mb-6 hidden md:block select-none">

          {/* FLOATING METRIC */}
          <motion.div
            className="absolute z-30 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-none"
            initial={false}
            animate={{
              left: activeStep === 1 ? '14%' :
                     activeStep === 2 ? '38%' :
                     activeStep === 3 ? '66%' : '90%',
              top: activeStep % 2 !== 0 ? '60%' : '15%',
              opacity: 1
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Activity className={`w-4 h-4 ${steps[activeStep - 1].text}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{steps[activeStep - 1].metricLabel}</p>
              <p className="text-base font-mono font-bold text-gray-800">
                {metrics[activeStep].toLocaleString()}
              </p>
            </div>
          </motion.div>

          {/* SVG PIPE */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 220">

            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="35%" stopColor="#8b5cf6" />
                <stop offset="65%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>

              <filter id="glossyPipe">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting in="blur" surfaceScale="3" specularExponent="20" lightingColor="#fff" result="specOut">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k2="1" k3="1" />
              </filter>
            </defs>

            <path d={pipePath} fill="none" stroke="#f3f4f6" strokeWidth="30" />

            <motion.path
              d={pipePath}
              fill="none"
              stroke="url(#activeGradient)"
              strokeWidth="30"
              strokeLinecap="butt"
              filter="url(#glossyPipe)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: steps[activeStep - 1].pathProgress }}
              transition={{ duration: 1 }}
            />

            <motion.path
              d={pipePath}
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeDasharray="8 30"
              strokeDashoffset="-500"
              initial={{ pathLength: 0 }}
              animate={{
                pathLength: steps[activeStep - 1].pathProgress,
              }}
              transition={{
                pathLength: { duration: 1 },
                strokeDashoffset: { duration: 5, repeat: Infinity, ease: "linear" }
              }}
            />

          </svg>

          {/* STEP DOTS */}
          {steps.map((step, index) => {
            const isActive = activeStep >= step.id;
            const isCurrent = activeStep === step.id;

            const positions = [
              { left: '8%', top: '150px' },
              { left: '33%', top: '20px' },
              { left: '61%', top: '150px' },
              { left: '85%', top: '20px' }
            ];

            return (
              <div 
                key={step.id}
                className="absolute z-20 flex flex-col items-center"
                style={positions[index]}
              >
                <div className={`w-[2px] h-4 ${index % 2 ? 'order-1 mb-[-1px]' : 'order-2 mt-[-1px]'} ${isActive ? step.bg.replace('50', '500') : 'bg-gray-200'}`}></div>

                <motion.button
                  onClick={() => handleStepClick(step.id)}
                  className={`
                    w-14 h-14 rounded-full border-3 flex items-center justify-center transition-all
                    ${isActive ? `bg-white ${step.border} ${step.shadow}` : 'bg-gray-100 border-gray-200'}
                  `}
                  whileHover={{ scale: 1.1 }}
                  animate={{ scale: isCurrent ? 1.05 : 1 }}
                >
                  {isCurrent && (
                    <motion.div
                      className={`absolute inset-0 rounded-full border-1.5 border-dashed ${step.border} opacity-50`}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    />
                  )}

                  <step.icon className={`w-6 h-6 ${isActive ? step.text : 'text-gray-400'}`} />
                </motion.button>
              </div>
            );
          })}

        </div>

        {/* CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {steps.map(step => {
            const isActive = activeStep >= step.id;
            const isCurrent = activeStep === step.id;

            return (
              <motion.div
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`
                  relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all
                  ${isCurrent ? 'bg-white ring-1 ring-gray-200 shadow-xl md:scale-105' : 'bg-transparent hover:bg-gray-50'}
                  ${!isActive && 'grayscale opacity-70'}
                `}
              >
                <div className="md:hidden w-10 h-10 mb-3 rounded-full flex items-center justify-center border-2">
                  <step.icon size={18} />
                </div>

                <div className="text-4xl font-black mb-2 opacity-10">{String(step.id).padStart(2, "0")}</div>

                <div className="text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{step.subtitle}</p>
                  <h3 className={`text-lg font-bold mb-2 ${step.text}`}>{step.title}</h3>
                  <p className="text-gray-600 text-xs mb-4">{step.desc}</p>
                </div>

                <div className={`
                  w-full mt-auto py-2 px-3 rounded-lg flex flex-col items-center gap-1 border 
                  ${isCurrent ? step.border : 'border-gray-100'}
                `}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={12} className={isCurrent ? step.text : "text-gray-300"} />
                    <span className={`text-[9px] font-mono font-semibold uppercase ${isCurrent ? step.text : "text-gray-500"}`}>
                      {step.statusText}
                    </span>
                  </div>

                  <div className={`text-[8px] font-bold uppercase ${isCurrent ? step.text : "text-gray-400"}`}>
                    {step.storageText}
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default DataAnalyticsFlow;
