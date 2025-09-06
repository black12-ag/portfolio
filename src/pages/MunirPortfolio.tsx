import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/portfolio/ProjectCard';
import { munirProjects, getFeaturedProjects, getProjectsByCategory, projectStats } from '@/data/munirProjects';
import { 
  Briefcase, 
  Code, 
  Smartphone, 
  Globe, 
  Star,
  TrendingUp,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';

export default function MunirPortfolio() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showStats, setShowStats] = useState(true);

  const categories = [
    { id: 'all', label: 'All Projects', icon: Briefcase },
    { id: 'mobile', label: 'Mobile Apps', icon: Smartphone },
    { id: 'web', label: 'Web Apps', icon: Globe },
    { id: 'fullstack', label: 'Full Stack', icon: Code },
  ];

  const filteredProjects = getProjectsByCategory(selectedCategory);
  const featuredProjects = getFeaturedProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg px-4 py-2">
              Full-Stack Developer
            </Badge>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Munir's Portfolio
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Specializing in secure messaging applications, cross-platform development, and AI integration. 
            Building the future of private communication with MunirChat.
          </p>
          
          {/* Tech Stack */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {['Swift', 'Kotlin', 'Python', 'React', 'TypeScript', 'Node.js'].map(tech => (
              <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm">
                {tech}
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              onClick={() => window.open('https://github.com/munir', '_blank')}
            >
              View GitHub
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => window.open('mailto:munir@munirchat.org', '_blank')}
            >
              Contact Me
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {showStats && (
        <section className="py-12 px-4 bg-white dark:bg-gray-800 border-y dark:border-gray-700">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectStats.completedProjects}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Completed Projects
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectStats.featuredProjects}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Featured Projects
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectStats.totalIcons}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Custom Icons
                </div>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Code className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {projectStats.technologies}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Technologies
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Projects */}
      {featuredProjects.length > 0 && selectedCategory === 'all' && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                Featured Projects
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                My flagship applications in the MunirChat ecosystem
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  showFullDetails
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {categories.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant={selectedCategory === id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(id)}
                className={selectedCategory === id 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                  : ''
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
                <Badge variant="secondary" className="ml-2">
                  {id === 'all' ? munirProjects.length : munirProjects.filter(p => p.category === id).length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* All Projects */}
      <section className="py-8 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {selectedCategory !== 'all' && (
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white capitalize">
                {selectedCategory} Projects
              </h2>
            </div>
          )}
          
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                No projects found in this category.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-500 to-emerald-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Build Something Amazing?
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Let's discuss your next project or explore collaboration opportunities
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.open('mailto:munir@munirchat.org', '_blank')}
            >
              Get In Touch
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white hover:text-green-600"
              onClick={() => window.open('https://linkedin.com/in/munir', '_blank')}
            >
              Connect on LinkedIn
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
