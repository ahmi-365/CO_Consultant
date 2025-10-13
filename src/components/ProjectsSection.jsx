import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import project3 from "@/assets/project-3.jpg";

const projects = [
  {
    id: 1,
    title: "Metropolitan Office Complex",
    image: project1,
    category: "Commercial",
    status: "Completed",
    description: "A state-of-the-art 25-story office complex featuring sustainable design and smart building technology.",
    details: {
      budget: "$45M",
      duration: "24 months",
      team: "85 specialists",
      location: "Downtown NYC"
    },
    features: ["LEED Platinum Certified", "Smart Building Systems", "Earthquake Resistant Design"]
  },
  {
    id: 2,
    title: "Riverside Housing Development", 
    image: project2,
    category: "Residential",
    status: "In Progress",
    description: "Modern residential community with 200 units, featuring eco-friendly design and community amenities.",
    details: {
      budget: "$32M",
      duration: "18 months",
      team: "62 specialists",
      location: "Brooklyn, NY"
    },
    features: ["Solar Panel Integration", "Community Gardens", "Energy Efficient Design"]
  },
  {
    id: 3,
    title: "Harbor Bridge Infrastructure",
    image: project3,
    category: "Infrastructure", 
    status: "Completed",
    description: "Major bridge construction project connecting two districts with advanced engineering solutions.",
    details: {
      budget: "$78M",
      duration: "36 months",
      team: "120 specialists",
      location: "Queens, NY"
    },
    features: ["Seismic Safety Features", "Weather Resistant Materials", "Smart Traffic Systems"]
  }
];

const ProjectsSection = () => {
  const [activeProject, setActiveProject] = useState(0);

  const nextProject = () => {
    setActiveProject((prev) => (prev + 1) % projects.length);
  };

  const prevProject = () => {
    setActiveProject((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const project = projects[activeProject];

return (
    <section id="projects" className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Our Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Showcasing excellence in construction management across diverse project types and scales
          </p>
        </div>

        {/* Project Carousel - Reduced Height */}
        <div className="relative mb-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Project Image - Reduced height */}
              <div className="relative group">
                <div className="aspect-[5/4] overflow-hidden"> {/* Changed from aspect-[4/3] */}
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Enhanced Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-transparent" />
                
                {/* Status & Category Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    project.status === 'Completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {project.status}
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-semibold bg-white/90 text-gray-900">
                    {project.category}
                  </div>
                </div>
              </div>

              {/* Project Details - Reduced padding */}
              <div className="p-6 lg:p-8 flex flex-col justify-center"> {/* Reduced from p-8 lg:p-12 */}
                <h3 className="text-2xl font-bold mb-3 text-gray-900"> {/* Reduced text size */}
                  {project.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed"> {/* Reduced margin */}
                  {project.description}
                </p>

                {/* Project Stats - Compact layout */}
                <div className="grid grid-cols-2 gap-4 mb-6"> {/* Reduced gap and margin */}
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50"> {/* Reduced padding */}
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center"> {/* Smaller icon */}
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Budget</p> {/* Smaller text */}
                      <p className="font-semibold text-gray-900 text-sm">{project.details.budget}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="font-semibold text-gray-900 text-sm">{project.details.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Team Size</p>
                      <p className="font-semibold text-gray-900 text-sm">{project.details.team}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="font-semibold text-gray-900 text-sm">{project.details.location}</p>
                    </div>
                  </div>
                </div>

                {/* Features - Compact */}
                <div className="mb-6"> {/* Reduced margin */}
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Key Features:</h4> {/* Smaller text */}
                  <div className="flex flex-wrap gap-1"> {/* Reduced gap */}
                    {project.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium" /* Smaller badges */
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation - Same layout but compact */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm" 
                      onClick={prevProject}
                      className="hover:bg-blue-500 hover:text-white border-gray-300"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextProject}
                      className="hover:bg-blue-500 hover:text-white border-gray-300"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveProject(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === activeProject ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Projects Grid Preview - Same size cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((proj, index) => (
            <div 
              key={proj.id}
              className={`cursor-pointer bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 ${
                index === activeProject ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setActiveProject(index)}
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img 
                  src={proj.image} 
                  alt={proj.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{proj.title}</h4>
                <div className="flex justify-between items-center">
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {proj.category}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ${
                    proj.status === 'Completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-500 text-white'
                  }`}>
                    {proj.status}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;