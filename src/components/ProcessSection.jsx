import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Quote,
  Linkedin,
  Twitter,
  Instagram,
  Youtube,
  Phone,
  Mail,
} from "lucide-react";

// ✅ SlidingLogoMarquee component
const SlidingLogoMarquee = ({
  items,
  speed = 40,
  pauseOnHover = true,
  height = "160px",
  gap = "3rem",
  className,
}) => {
  const containerRef = useRef(null);

  const cn = (...classes) => classes.filter(Boolean).join(" ");

  return (
    <>
      <style>
        {`
        .sliding-marquee-container {
          --speed: ${speed};
        }
        .sliding-marquee-resizable {
          overflow: hidden;
          width: 100%;
          height: ${height};
          position: relative;
        }
        .sliding-marquee-inner {
          height: 100%;
          display: flex;
          align-items: center;
        }
        .sliding-marquee-list {
          display: flex;
          gap: ${gap};
          animation: scroll ${speed}s linear infinite;
          will-change: transform;
        }
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .sliding-marquee-container:hover .sliding-marquee-list {
          ${pauseOnHover ? "animation-play-state: paused;" : ""}
        }
        `}
      </style>

      <div
        ref={containerRef}
        className={cn("sliding-marquee-container relative", className)}
      >
        <div className="sliding-marquee-resizable">
          <div className="sliding-marquee-inner">
            <ul className="sliding-marquee-list">
              {[...items, ...items].map((item, index) => (
                <li key={index} className="flex items-center justify-center">
                  {item.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

// ✅ Animated Counter Component
const Counter = ({ target, label }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) return;

    let totalMilSecDur = 2000;
    let incrementTime = (totalMilSecDur / end) * 2;

    let timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="text-center">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-primary"
      >
        {count}+
      </motion.h3>
      <p className="text-gray-600 font-medium">{label}</p>
    </div>
  );
};

const ProcessSection = () => {
  // ✅ 6 Social Icons (lucide only)
  const socialItems = [
    {
      content: (
        <Linkedin className="w-16 h-16 text-blue-600 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
    {
      content: (
        <Twitter className="w-16 h-16 text-sky-500 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
    {
      content: (
        <Instagram className="w-16 h-16 text-pink-500 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
    {
      content: (
        <Youtube className="w-16 h-16 text-red-600 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
    {
      content: (
        <Phone className="w-16 h-16 text-green-600 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
    {
      content: (
        <Mail className="w-16 h-16 text-purple-600 bg-gray-100 p-4 rounded-full shadow-lg" />
      ),
    },
  ];

  return (
    <div className="bg-white">
      {/* ✅ 1. Animated Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <Counter target={200} label="Projects Completed" />
          <Counter target={50} label="Clients Served" />
          <Counter target={10} label="Years of Experience" />
        </div>
      </section>

      {/* ✅ 2. Social Icons Slider + Testimonials */}
      <section className="py-20 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Follow Us On Social Media
        </h2>

        {/* ✅ Sliding social icons */}
        {/* <div className="mb-16">
          <SlidingLogoMarquee items={socialItems} speed={25} height="180px" />
        </div> */}

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "John Smith",
              role: "Project Manager, ABC Constructions",
              text: "CO Consultants transformed our reporting system and helped us save 20% in costs.",
            },
            {
              name: "Sarah Johnson",
              role: "CEO, BuildRight Ltd.",
              text: "Their dashboards gave us clarity and control like never before. Highly recommend!",
            },
            {
              name: "David Lee",
              role: "Operations Head, SkyHigh Builders",
              text: "24/7 support and predictive insights have been a game changer for our projects.",
            },
          ].map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="bg-white shadow-lg rounded-2xl p-6 border hover:shadow-xl transition"
            >
              <Quote className="h-8 w-8 text-primary/40 mb-4" />
              <p className="text-gray-700 mb-4 italic">"{t.text}"</p>
              <div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ✅ 3. Strong CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Optimize Your Construction Projects?
        </h2>
        <p className="text-lg mb-8">
          Let us help you harness the power of data-driven insights for success.
        </p>
        <button className="bg-white text-primary font-semibold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition">
          Get Started Today
        </button>
      </section>
    </div>
  );
};

export default ProcessSection;
