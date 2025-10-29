import {
  Search,
  BarChart3,
  Brain,
  Folder,
  Handshake,
  Lock,
} from "lucide-react";

const WhyChooseUsSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Because We Don’t Just Track Projects, We Organise Construction.
            <br /> <span className="text-yellow-600 font-semibold">Intelligently.</span>
          </p>
        </div>

        {/* Row 1 - First point + Image */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Point */}
          <InfoBlock
            icon={<Search className="w-6 h-6 text-white" />}
            title="Precision-Powered Tracking"
            description={
              <>
                We integrate <b>Bluetooth RTLS, QR Codes, and RFID systems</b>{" "}
                to enable real-time, site-wide tracking of manpower and
                equipment. <br />
                <span className="text-yellow-600 font-medium">
                  No guesswork, just ground truth.
                </span>
              </>
            }
          />

          {/* Right: Image */}
          <div className="flex justify-center">
            <img
              src="../../Assets/Under construction-cuate.png"
              alt="Construction tracking illustration"
              className="w-full max-w-md rounded-2xl shadow-lg p-4"
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <InfoBlock
            icon={<BarChart3 className="w-6 h-6 text-white" />}
            title="Project-Specific Dashboards"
            description={
              <>
                We do not use one-size-fits-all templates. Every dashboard we
                deliver is:
                <ul className="list-disc ml-6 mt-2 text-gray-600">
                  <li>Tailored to your project needs</li>
                  <li>Powered by AI</li>
                  <li>
                    Built to highlight productivity, progress, and performance
                    metrics that matter
                  </li>
                </ul>
                <p className="mt-2">
                  Whether you’re managing a megaproject or an industrial
                  retrofit, our analytics adapt to your site — not the other way
                  around.
                </p>
              </>
            }
          />

          <InfoBlock
            icon={<Brain className="w-6 h-6 text-white" />}
            title="AI-Supported Productivity Insights"
            description={
              <>
                Our smart backend leverages historical and live project data to:
                <ul className="list-disc ml-6 mt-2 text-gray-600">
                  <li>Automate alerts on inefficiencies</li>
                  <li>Recommend manpower/equipment reallocation</li>
                  <li>Improve future tendering accuracy</li>
                </ul>
                <p className="mt-2">We turn data into decisions.</p>
              </>
            }
          />
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <InfoBlock
            icon={<Folder className="w-6 h-6 text-white" />}
            title="Daily Trackers, Done Right"
            description={
              <>
                We provide plug-and-play daily reporting templates that your
                site teams can use effortlessly. Whether Excel-based or
                IoT-connected, our templates ensure:
                <ul className="list-disc ml-6 mt-2 text-gray-600">
                  <li>Accurate manpower logs</li>
                  <li>Equipment utilization insights</li>
                  <li>Daily progress breakdowns by discipline</li>
                </ul>
              </>
            }
          />

          <InfoBlock
            icon={<Handshake className="w-6 h-6 text-white" />}
            title="Local Experience, Global Standards"
            description={
              <>
                With over a decade of hands-on project management experience
                across:
                <p className="mt-2 font-semibold text-gray-700">
                  🇦🇪 UAE • 🇹🇷 Turkey • 🇶🇦 Qatar • 🇷🇺 Russia • 🇸🇦 Saudi Arabia • 🇮🇶 Iraq • 🇰🇿
                  Kazakhstan • 🇯🇴 Jordan • 🇪🇸 Spain
                </p>
                <p className="mt-2">
                  We understand what clients, contractors, and consultants need — and how to align them around{" "}
                  <b>facts, not friction.</b>
                </p>
              </>
            }
          />
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <InfoBlock
            icon={<Lock className="w-6 h-6 text-white" />}
            title="Secure, Structured, Centralised"
            description={
              <>
                Your data stays in one place. <b>Clean. Organised. Accessible. Secure.</b>
                <p className="mt-2">
                  We offer a single source of truth for your daily reports,
                  claims documents, and delay analysis inputs — ensuring
                  traceability from Day 1 to Final Account.
                </p>
              </>
            }
          />
          {/* Right column empty to keep layout balanced */}
          <div></div>
        </div>
      </div>
    </section>
  );
};

// Reusable InfoBlock
const InfoBlock = ({ icon, title, description }) => (
  <div className="bg-gray-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-gray-700 text-base leading-relaxed">{description}</div>
      </div>
    </div>
  </div>
);

export default WhyChooseUsSection;
