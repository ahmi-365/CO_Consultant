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
    <section id="projects" className="py-20 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Our Featured Projects
          </h2>
          <p className="text-xl text-construction-grey max-w-2xl mx-auto">
            Showcasing excellence in construction management across diverse project types and scales
          </p>
        </div>

        {/* Project Carousel */}
        <div className="relative">
          <Card className="overflow-hidden border-0 shadow-card-hover">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Project Image */}
              <div className="relative group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <Badge 
                    variant={project.status === 'Completed' ? 'default' : 'secondary'}
                    className="text-sm font-semibold"
                  >
                    {project.status}
                  </Badge>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className="bg-white/90 text-primary border-white">
                    {project.category}
                  </Badge>
                </div>
              </div>

              {/* Project Details */}
              <CardContent className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold mb-4 text-primary">
                  {project.title}
                </h3>
                
                <p className="text-construction-grey mb-8 leading-relaxed text-lg">
                  {project.description}
                </p>

                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-sm text-construction-grey">Budget</p>
                      <p className="font-semibold text-primary">{project.details.budget}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-sm text-construction-grey">Duration</p>
                      <p className="font-semibold text-primary">{project.details.duration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-sm text-construction-grey">Team Size</p>
                      <p className="font-semibold text-primary">{project.details.team}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-sm text-construction-grey">Location</p>
                      <p className="font-semibold text-primary">{project.details.location}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-8">
                  <h4 className="font-semibold text-primary mb-3">Key Features:</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevProject}
                      className="hover:bg-secondary hover:text-white"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextProject}
                      className="hover:bg-secondary hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    {projects.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveProject(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          index === activeProject ? 'bg-secondary' : 'bg-construction-grey/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>

        {/* All Projects Grid Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {projects.map((proj, index) => (
            <Card 
              key={proj.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-card-hover hover:-translate-y-2 border-0 shadow-card ${
                index === activeProject ? 'ring-2 ring-secondary' : ''
              }`}
              onClick={() => setActiveProject(index)}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-t-lg">
                <img 
                  src={proj.image} 
                  alt={proj.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
              <CardContent className="p-4">
                <h4 className="font-semibold text-primary mb-2">{proj.title}</h4>
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {proj.category}
                  </Badge>
                  <Badge 
                    variant={proj.status === 'Completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {proj.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;