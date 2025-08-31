import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectCard, { Project } from '@/components/portfolio/ProjectCard';
import VideoShowcase, { VideoProject } from '@/components/portfolio/VideoShowcase';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Palette, 
  Users,
  Star,
  Award,
  ChevronRight,
  Mail,
  Github,
  Linkedin,
  ExternalLink,
  Monitor,
  Cog,
  Database,
  Video
} from 'lucide-react';

const BASE_URL = import.meta.env.BASE_URL || '/';

// Video Project Data - Your Hotel Booking Website
const videoProjects: VideoProject[] = [
  {
    id: 'hotel-booking-demo',
    title: 'Hotel Booking Website - Complete Demo',
    description: 'Full walkthrough of my latest hotel booking website project. Features user registration, hotel search and filtering, booking management, payment integration, and admin dashboard. Built with modern technologies and responsive design.',
    videoUrl: `${BASE_URL}videos/portfolio-video.mov`,
    thumbnailUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    category: 'Full Stack Project',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe', 'JWT', 'Express', 'Tailwind CSS'],
    duration: '—',
    fileSize: '≈362MB (source MOV)',
    completedDate: 'Dec 2024',
    featured: true,
    githubUrl: 'https://github.com/munir-ayub/hotel-booking-website',
    liveUrl: 'https://hotel-booking-demo.netlify.app'
  }
];

// Sample project data (replace with your actual projects)
const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, and admin dashboard.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    category: 'fullstack',
    // liveUrl: 'https://your-actual-demo-url.com', // Add your real demo URL here
    githubUrl: 'https://github.com/yourusername/ecommerce-platform', // Update with your real GitHub URL
    featured: true,
    completedDate: '2024-08',
    client: 'Local Business Owner',
    status: 'completed',
    testimonial: {
      text: 'Amazing work! The platform exceeded our expectations and increased our sales by 40%.',
      author: 'Sarah Johnson, CEO',
      rating: 5
    },
    keyFeatures: [
      'User authentication and authorization',
      'Shopping cart and checkout process',
      'Payment integration with Stripe',
      'Admin dashboard for inventory management',
      'Responsive design for all devices'
    ]
  },
  {
    id: '2',
    title: 'Mobile Fitness App',
    description: 'React Native fitness tracking app with workout plans, progress tracking, and social features.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Redux'],
    category: 'mobile',
    githubUrl: 'https://github.com/yourusername/fitness-app',
    featured: true,
    completedDate: '2024-07',
    status: 'completed',
    keyFeatures: [
      'Workout tracking and planning',
      'Progress visualization',
      'Social sharing features',
      'Offline data synchronization'
    ]
  },
  {
    id: '3',
    title: 'Portfolio Website Design',
    description: 'Modern portfolio website design for a creative agency with animations and responsive layout.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
    technologies: ['Figma', 'HTML', 'CSS', 'JavaScript', 'GSAP'],
    category: 'design',
    // liveUrl: 'https://your-portfolio-demo.com', // Add your real demo URL here
    completedDate: '2024-06',
    client: 'Creative Agency',
    status: 'completed',
    testimonial: {
      text: 'The design perfectly captured our brand identity. We\'ve received numerous compliments!',
      author: 'Mike Chen, Creative Director',
      rating: 5
    }
  },
  {
    id: '4',
    title: 'Task Management Dashboard',
    description: 'Web-based task management system with team collaboration features and real-time updates.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    technologies: ['Vue.js', 'Node.js', 'Socket.io', 'MongoDB'],
    category: 'web',
    // liveUrl: 'https://your-task-manager-demo.com', // Add your real demo URL here
    githubUrl: 'https://github.com/yourusername/task-manager',
    completedDate: '2024-05',
    status: 'completed'
  },
  {
    id: '5',
    title: 'AI-Powered Chat Application',
    description: 'Modern chat application with AI integration, real-time messaging, and file sharing capabilities.',
    image: 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'OpenAI API', 'Socket.io', 'AWS'],
    category: 'fullstack',
    githubUrl: 'https://github.com/yourusername/ai-chat-app',
    completedDate: '2024-09',
    status: 'in-progress'
  },
  {
    id: '6',
    title: 'Restaurant Booking System',
    description: 'Complete restaurant management system with online reservations, menu management, and POS integration.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    category: 'fullstack',
    completedDate: '2024-12',
    status: 'coming-soon'
  }
];

// Services data - Expanded to include more comprehensive offerings
const services = [
  {
    icon: Globe,
    title: 'Web Applications',
    description: 'Modern, responsive web applications with complex business logic and real-time features.',
    technologies: ['React', 'Vue.js', 'TypeScript', 'Next.js'],
    color: 'bg-blue-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'Cross-platform and native mobile applications for iOS and Android platforms.',
    technologies: ['React Native', 'Flutter', 'iOS', 'Android'],
    color: 'bg-green-500'
  },
  {
    icon: Database,
    title: 'Backend & APIs',
    description: 'Robust server architecture, RESTful APIs, database design, and cloud deployment.',
    technologies: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
    color: 'bg-purple-500'
  },
  {
    icon: Monitor,
    title: 'Desktop Applications',
    description: 'Cross-platform desktop applications using Electron and modern web technologies.',
    technologies: ['Electron', 'React', 'TypeScript', 'Node.js'],
    color: 'bg-orange-500'
  },
  {
    icon: Cog,
    title: 'Process Automation',
    description: 'Custom automation tools, scripts, and workflow optimization solutions.',
    technologies: ['Python', 'Node.js', 'Automation', 'Scripting'],
    color: 'bg-red-500'
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'User-centered design with modern interfaces and seamless user experiences.',
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
    color: 'bg-pink-500'
  }
];

// Skills data
const skills = [
  { name: 'React/Next.js', level: 95, category: 'frontend' },
  { name: 'TypeScript', level: 90, category: 'language' },
  { name: 'Node.js', level: 85, category: 'backend' },
  { name: 'React Native', level: 80, category: 'mobile' },
  { name: 'Python', level: 75, category: 'language' },
  { name: 'UI/UX Design', level: 70, category: 'design' },
  { name: 'AWS/Cloud', level: 75, category: 'devops' },
  { name: 'PostgreSQL', level: 80, category: 'database' }
];

export default function Portfolio() {
  const navigate = useNavigate();
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // In a real app, you'd fetch this from an API
    setFeaturedProjects(sampleProjects.filter(p => p.featured));
    setAllProjects(sampleProjects);
  }, []);

  const filteredProjects = selectedCategory === 'all' 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Projects', count: allProjects.length },
    { id: 'web', name: 'Web Apps', count: allProjects.filter(p => p.category === 'web').length },
    { id: 'mobile', name: 'Mobile Apps', count: allProjects.filter(p => p.category === 'mobile').length },
    { id: 'fullstack', name: 'Full Stack', count: allProjects.filter(p => p.category === 'fullstack').length },
    { id: 'design', name: 'Design', count: allProjects.filter(p => p.category === 'design').length }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <PortfolioHero />

      {/* Video Showcase Section - Hotel Booking Website */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Video className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Project Showcase</h2>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Watch a detailed walkthrough of my latest hotel booking website project.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {videoProjects.map((project) => (
              <VideoShowcase key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">About Me</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              I'm a passionate full-stack developer with over 3 years of experience creating 
              comprehensive digital solutions. From booking systems to e-commerce platforms, 
              I specialize in building scalable applications that solve real-world problems.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-700 dark:text-gray-300">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">25+</div>
                <div className="text-gray-700 dark:text-gray-300">Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">3+</div>
                <div className="text-gray-700 dark:text-gray-300">Years</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-gray-700 dark:text-gray-300">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I offer a comprehensive range of development services to bring your ideas to life.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 rounded-full ${service.color} text-white mb-4`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {service.technologies.map((tech, techIndex) => (
                      <Badge key={techIndex} variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Skills & Technologies</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Technologies I work with to create amazing digital experiences.
            </p>
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Featured Projects</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A selection of my best work showcasing different technologies and approaches.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/projects')}>
              View All Projects
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's work together to bring your ideas to life. I'm available for freelance projects and consulting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all duration-300" onClick={() => navigate('/contact')}>
              <Mail className="w-5 h-5 mr-2" />
              Get In Touch
            </Button>
            <Button size="lg" className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all duration-300" onClick={() => window.open(`${import.meta.env.BASE_URL}resume.pdf`, '_blank')}>
              <ExternalLink className="w-5 h-5 mr-2" />
              Download Resume
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
