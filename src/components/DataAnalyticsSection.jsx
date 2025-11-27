import React, { useState, useEffect, useMemo } from 'react';
import { 
  Cloud, HardHat, RefreshCw, FolderArchive, 
  Play, Pause, Activity, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConstructionDataFlow = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [hoveredStep, setHoveredStep] = useState(null);
  
  // Simulated "Live Data" counters for file sizes/counts
  const [metrics, setMetrics] = useState({ 1: 120, 2: 4500, 3: 890, 4: 240 });

  // Configuration for steps tailored to Construction + OneDrive
  const steps = useMemo(() => [
    {
      id: 1,
      title: "Site Documentation Upload",
      subtitle: "Field Data Capture",
      desc: "Upload site photos, progress reports, and CAD revisions from mobile devices.",
      metricLabel: "Files Uploaded",
      statusText: "Secure Upload Active",
      icon: HardHat,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      stroke: "#ea580c",
      bg: "bg-orange-50",
      border: "border-orange-500",
      text: "text-orange-600",
      shadow: "shadow-orange-500/30",
      pathProgress: 0.14,
      storageText: "1TB Storage Available"
    },
    {
      id: 2,
      title: "Centralized Cloud Vault",
      subtitle: "OneDrive Secure Storage",
      desc: "Secure storage with AES-256 encryption and automatic version control.",
      metricLabel: "GBs Securely Stored",
      statusText: "Encrypted & Protected",
      icon: Cloud,
      color: "blue",
      gradient: "from-blue-400 to-blue-500",
      stroke: "#0ea5e9",
      bg: "bg-sky-50",
      border: "border-sky-500",
      text: "text-sky-600",
      shadow: "shadow-sky-500/30",
      pathProgress: 0.38,
      storageText: "Auto-Backup Enabled"
    },
    {
      id: 3,
      title: "Team Collaboration Hub",
      subtitle: "Real-time Sync",
      desc: "Seamless file sharing with real-time updates and co-authoring.",
      metricLabel: "Active Sessions",
      statusText: "Real-time Sync Active",
      icon: RefreshCw,
      color: "emerald",
      gradient: "from-emerald-500 to-emerald-600",
      stroke: "#10b981",
      bg: "bg-emerald-50",
      border: "border-emerald-500",
      text: "text-emerald-600",
      shadow: "shadow-emerald-500/30",
      pathProgress: 0.63,
      storageText: "Team Sharing Active"
    },
    {
      id: 4,
      title: "Project Archive & Handover",
      subtitle: "Compliance Ready",
      desc: "Automated organization of as-built drawings and compliance docs.",
      metricLabel: "Records Archived",
      statusText: "10-Year Retention",
      icon: FolderArchive,
      color: "indigo",
      gradient: "from-indigo-800 to-indigo-900",
      stroke: "#312e81",
      bg: "bg-indigo-50",
      border: "border-indigo-900",
      text: "text-indigo-900",
      shadow: "shadow-indigo-900/30",
      pathProgress: 1.0,
      storageText: "Archive Protection Active"
    }
  ], []);

  // Simulate Live Data Counter
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        [activeStep]: prev[activeStep] + Math.floor(Math.random() * 5)
      }));
    }, 200);
    return () => clearInterval(interval);
  }, [activeStep]);

  // Auto-Play Logic
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setActiveStep((prev) => (prev === 4 ? 1 : prev + 1));
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
      
      {/* Top Bar Controls */}
      <div className="w-full px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 pointer-events-none mb-6 sm:mb-8">
        <div className="pointer-events-auto">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
            Construction<span className="text-blue-600">Drive</span> Manager
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm font-medium flex items-center gap-2 mt-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">OneDrive for Construction - Secure Document Management</span>
            <span className="sm:hidden">Secure Document Management</span>
          </p>
        </div>

        <button 
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={`
            pointer-events-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-105 active:scale-95
            ${isAutoPlaying ? 'bg-orange-50 text-orange-600 ring-1 ring-orange-200' : 'bg-gray-900 text-white'}
          `}
        >
          {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
          {isAutoPlaying ? "Pause Demo" : "Demo Workflow"}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-7xl mx-auto w-full px-4 relative">
        
        {/* PIPELINE VISUALIZATION */}
        <div className="relative w-full h-[200px] mb-6 hidden md:block select-none">
          
          {/* FLOATING LIVE METRIC CARD */}
          <motion.div 
            className="absolute z-30 bg-white/95 backdrop-blur-md border border-gray-200 shadow-xl px-4 py-2 rounded-lg flex items-center gap-3 pointer-events-none"
            initial={false}
            animate={{ 
              left: activeStep === 1 ? '14%' : activeStep === 2 ? '38%' : activeStep === 3 ? '66%' : '90%',
              top: activeStep % 2 !== 0 ? '60%' : '15%',
              opacity: 1
            }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          >
            <Activity className={`w-4 h-4 ${steps[activeStep-1].text}`} />
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{steps[activeStep-1].metricLabel}</p>
              <p className="text-base font-mono font-bold leading-none tabular-nums text-gray-800">
                {metrics[activeStep].toLocaleString()}
              </p>
            </div>
          </motion.div>

          {/* SVG LAYER */}
          <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ea580c" />
                <stop offset="35%" stopColor="#0ea5e9" />
                <stop offset="65%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
              
              <filter id="glossyPipe" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
                <feSpecularLighting in="blur" surfaceScale="3" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specOut">
                  <fePointLight x="-5000" y="-10000" z="20000" />
                </feSpecularLighting>
                <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="final" />
              </filter>
            </defs>

            {/* Base Grey Pipe */}
            <path d={pipePath} fill="none" stroke="#f3f4f6" strokeWidth="30" />
            
            {/* The Filling Color Animation */}
            <motion.path 
              d={pipePath} 
              fill="none" 
              stroke="url(#activeGradient)" 
              strokeWidth="30" 
              strokeLinecap="butt"
              filter="url(#glossyPipe)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: steps[activeStep - 1].pathProgress }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />

            {/* Moving Data Particles */}
            <motion.path
              d={pipePath}
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.6"
              initial={{ pathLength: 0, strokeDasharray: "0 1" }}
              animate={{ 
                pathLength: steps[activeStep - 1].pathProgress,
                strokeDasharray: "8 30", 
                strokeDashoffset: -500
              }}
              transition={{ 
                pathLength: { duration: 1, ease: "easeInOut" },
                strokeDashoffset: { duration: 5, repeat: Infinity, ease: "linear" }
              }}
            />

            {/* Pipe Highlights */}
            <path d={pipePath} fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.5" className="pointer-events-none" transform="translate(0, -8)" />

            {/* Joints */}
            {[275, 635, 995].map((x, i) => (
              <g key={i} transform={`translate(${x}, ${i === 1 ? 70 : 80})`}>
                 <rect x="-6" y="0" width="12" height="6" rx="1.5" fill="#d1d5db" stroke="#9ca3af" transform="scale(3 1)" />
                 <rect x="-6" y="40" width="12" height="6" rx="1.5" fill="#d1d5db" stroke="#9ca3af" transform="scale(3 1)" />
                 <rect x="-6" y="80" width="12" height="6" rx="1.5" fill="#d1d5db" stroke="#9ca3af" transform="scale(3 1)" />
              </g>
            ))}
          </svg>

          {/* INTERACTIVE ICON BUTTONS */}
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
                  {/* Connector */}
                  <div className={`w-[2px] h-4 transition-colors duration-500 ${index % 2 !== 0 ? 'order-1 mb-[-1px]' : 'order-2 mt-[-1px]'} ${isActive ? step.bg.replace('50', '500') : 'bg-gray-200'}`}></div>

                  {/* The Button */}
                  <motion.button 
                    onClick={() => handleStepClick(step.id)}
                    onMouseEnter={() => setHoveredStep(step.id)}
                    onMouseLeave={() => setHoveredStep(null)}
                    className={`
                      relative w-14 h-14 rounded-full border-3 flex items-center justify-center 
                      transition-all duration-300 outline-none
                      ${index % 2 !== 0 ? 'order-2' : 'order-1'}
                      ${isActive ? `bg-white ${step.border} ${step.shadow}` : 'bg-gray-100 border-gray-200'}
                    `}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    animate={{ scale: isCurrent ? 1.05 : 1 }}
                  >
                    {isCurrent && (
                      <motion.div 
                        className={`absolute inset-0 rounded-full border-1.5 border-dashed ${step.border} opacity-50`}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                    )}
                    
                    <step.icon className={`w-6 h-6 transition-colors duration-300 ${isActive ? step.text : 'text-gray-400'}`} />
                  </motion.button>
               </div>
             );
          })}
        </div>

        {/* DETAILED CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative z-10 w-full">
          {steps.map((step) => {
            const isCurrent = activeStep === step.id;
            const isActive = activeStep >= step.id;

            return (
              <motion.div 
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                className={`
                  relative flex flex-col items-center p-4 sm:p-5 rounded-xl cursor-pointer transition-all duration-500
                  ${isCurrent ? 'bg-white ring-1 ring-gray-200 shadow-xl md:scale-105 z-10' : 'bg-transparent hover:bg-gray-50'}
                  ${!isActive && 'grayscale opacity-70'}
                `}
                animate={{ scale: isCurrent ? 1.03 : 1 }}
              >
                 {/* Mobile Icon */}
                 <div className={`md:hidden w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center border-2 ${isActive ? `bg-white ${step.border} ${step.text}` : 'bg-gray-100 text-gray-400'}`}>
                   <step.icon size={18} />
                 </div>

                 {/* Step Number */}
                 <div className={`text-4xl sm:text-5xl font-black mb-2 select-none tracking-tighter opacity-10 ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                   0{step.id}
                 </div>
                 
                 {/* Content */}
                 <div className="text-center w-full">
                   <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">{step.subtitle}</p>
                   <h3 className={`text-base sm:text-lg font-bold mb-2 ${isActive ? step.text : 'text-gray-500'}`}>
                     {step.title}
                   </h3>
                   <p className="text-gray-600 text-xs sm:text-sm leading-relaxed opacity-90 mb-3 sm:mb-4 min-h-[40px]">
                     {step.desc}
                   </p>
                 </div>

                 {/* CONSTRUCTION-ORIENTED STORAGE STATUS */}
                 <div className={`
                    w-full mt-auto py-2 px-2 sm:px-3 rounded-lg flex flex-col items-center justify-center gap-1
                    border ${isCurrent ? step.border : 'border-gray-100'} 
                    ${isCurrent ? step.bg : 'bg-gray-50'}
                 `}>
                    <div className="flex items-center justify-center gap-2 w-full">
                      <CheckCircle2 size={12} className={isCurrent ? step.text : "text-gray-300"} />
                      <span className={`text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wide ${isCurrent ? step.text : "text-gray-500"}`}>
                          {step.statusText}
                      </span>
                    </div>
                    <div className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${isCurrent ? step.text : "text-gray-400"} opacity-80 mt-1`}>
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

export default ConstructionDataFlow;