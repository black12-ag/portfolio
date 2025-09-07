import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectCard, { Project } from '@/components/portfolio/ProjectCard';
import VideoShowcase, { VideoProject } from '@/components/portfolio/VideoShowcase';
import InteractivePortfolio from '@/components/portfolio/InteractivePortfolio';
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

// Sample project data - Diverse and impressive portfolio
const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Hotel Booking Platform',
    description: 'Complete hotel booking system with real-time availability, payment processing, admin dashboard, and multi-language support.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe', 'JWT', 'Express'],
    category: 'fullstack',
    liveUrl: 'https://hotel-booking-demo.netlify.app',
    githubUrl: 'https://github.com/munir-ayub/hotel-booking-website',
    featured: true,
    completedDate: '2024-12',
    client: 'Hotel Chain',
    status: 'completed',
    testimonial: {
      text: 'Outstanding work! The platform handles thousands of bookings daily with zero downtime.',
      author: 'Sarah Johnson, Hotel Manager',
      rating: 5
    },
    keyFeatures: [
      'Real-time room availability and booking',
      'Secure payment processing with Stripe',
      'Multi-language support (5+ languages)',
      'Advanced search and filtering',
      'Comprehensive admin dashboard'
    ]
  },
  {
    id: '2',
    title: 'AI Trading Bot Assistant',
    description: 'Intelligent Telegram bot for cryptocurrency trading analysis, market alerts, and portfolio management with real-time data integration.',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop',
    technologies: ['Python', 'Telegram API', 'TensorFlow', 'CoinGecko API', 'PostgreSQL', 'Docker'],
    category: 'bot',
    liveUrl: 'https://t.me/YourTradingBot',
    githubUrl: 'https://github.com/munir-ayub/ai-trading-bot',
    featured: true,
    completedDate: '2024-11',
    status: 'completed',
    keyFeatures: [
      'Real-time crypto price alerts',
      'AI-powered market analysis',
      'Portfolio tracking and management',
      'Technical indicator calculations',
      'Risk assessment and recommendations'
    ],
    telegramAccess: {
      botUsername: 'YourTradingBot',
      startCommand: '/start',
      demoPrompts: ['/price BTC', '/portfolio', '/alerts', '/analysis ETH'],
      liveDemoAvailable: true,
      requiresAuthentication: false,
      responseTime: '< 2 seconds',
      availablePlugins: ['Price Tracker', 'Portfolio Manager', 'News Alerts']
    }
  },
  {
    id: '3',
    title: 'Smart Automation Dashboard',
    description: 'Comprehensive automation platform for managing IoT devices, workflows, and business processes with AI-powered insights.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'Python', 'Redis', 'WebSocket', 'Docker'],
    category: 'automation',
    liveUrl: 'https://automation-demo.netlify.app',
    githubUrl: 'https://github.com/munir-ayub/smart-automation',
    featured: true,
    completedDate: '2024-10',
    status: 'completed',
    client: 'Tech Startup',
    testimonial: {
      text: 'This automation platform saved us 15 hours per week and reduced manual errors by 90%!',
      author: 'David Kim, CTO',
      rating: 5
    },
    keyFeatures: [
      'Visual workflow builder',
      'Real-time monitoring dashboard',
      'AI-powered process optimization',
      'Integration with 50+ services',
      'Custom scripting engine'
    ]
  },
  {
    id: '4',
    title: 'AI Content Generator',
    description: 'Powerful AI-driven content creation tool using GPT models for generating blogs, social media posts, and marketing copy.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
    technologies: ['Next.js', 'TypeScript', 'OpenAI API', 'Prisma', 'Stripe', 'Tailwind CSS'],
    category: 'ai',
    liveUrl: 'https://ai-content-creator.vercel.app',
    githubUrl: 'https://github.com/munir-ayub/ai-content-generator',
    featured: true,
    completedDate: '2024-09',
    status: 'completed',
    keyFeatures: [
      'Multi-format content generation',
      'Brand voice customization',
      'SEO optimization suggestions',
      'Bulk content creation',
      'Export to multiple formats'
    ]
  },
  {
    id: '5',
    title: 'Trading Analytics Platform',
    description: 'Professional trading dashboard with real-time market data, advanced charts, portfolio tracking, and algorithmic trading capabilities.',
    image: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'D3.js', 'WebSocket', 'Python', 'FastAPI', 'PostgreSQL'],
    category: 'trading',
    liveUrl: 'https://trading-analytics.vercel.app',
    githubUrl: 'https://github.com/munir-ayub/trading-platform',
    featured: true,
    completedDate: '2024-08',
    status: 'completed',
    client: 'Investment Firm',
    testimonial: {
      text: 'This platform revolutionized our trading operations. The analytics are incredibly detailed and accurate.',
      author: 'Jennifer Lopez, Fund Manager',
      rating: 5
    },
    keyFeatures: [
      'Real-time market data streaming',
      'Advanced technical analysis charts',
      'Algorithmic trading strategies',
      'Risk management tools',
      'Multi-asset portfolio tracking'
    ]
  },
  {
    id: '6',
    title: 'Mobile Fitness Tracker',
    description: 'React Native fitness tracking app with workout plans, progress tracking, social features, and health analytics.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    technologies: ['React Native', 'TypeScript', 'Firebase', 'Redux', 'Expo', 'HealthKit'],
    category: 'mobile',
    liveUrl: 'https://expo.dev/@yourusername/fitness-tracker',
    githubUrl: 'https://github.com/munir-ayub/fitness-tracker-app',
    featured: true,
    completedDate: '2024-07',
    status: 'completed',
    client: 'Fitness Startup',
    testimonial: {
      text: 'The app has over 10,000 active users and a 4.8-star rating. Users love the intuitive design!',
      author: 'Mark Rodriguez, Founder',
      rating: 5
    },
    keyFeatures: [
      'Workout tracking and planning',
      'Progress visualization and analytics',
      'Social challenges and sharing',
      'Offline workout synchronization',
      'Apple Health & Google Fit integration'
    ]
  },
  {
    id: '7',
    title: 'E-Commerce Platform',
    description: 'Modern e-commerce solution with advanced features like AI recommendations, inventory management, and multi-vendor support.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Redis', 'AWS S3'],
    category: 'fullstack',
    liveUrl: 'https://ecommerce-demo.vercel.app',
    githubUrl: 'https://github.com/munir-ayub/ecommerce-platform',
    featured: false,
    completedDate: '2024-06',
    status: 'completed',
    keyFeatures: [
      'AI-powered product recommendations',
      'Multi-vendor marketplace',
      'Advanced inventory management',
      'Real-time order tracking',
      'Comprehensive admin dashboard'
    ]
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

  // Load projects from localStorage (managed by admin)
  const loadProjects = () => {
    const storedProjects = localStorage.getItem('portfolio_projects');
    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      setAllProjects(projects);
      setFeaturedProjects(projects.filter((p: any) => p.featured));
    } else {
      // Use sample projects as fallback
      setFeaturedProjects(sampleProjects.filter(p => p.featured));
      setAllProjects(sampleProjects);
    }
  };

  useEffect(() => {
    loadProjects();

    // Listen for project updates from admin panel
    const handleProjectsUpdate = () => {
      loadProjects();
    };

    window.addEventListener('projectsUpdated', handleProjectsUpdate);
    return () => {
      window.removeEventListener('projectsUpdated', handleProjectsUpdate);
    };
  }, []);

  const filteredProjects = selectedCategory === 'all' 
    ? allProjects 
    : allProjects.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All Projects', count: allProjects.length },
    { id: 'fullstack', name: 'Full Stack', count: allProjects.filter(p => p.category === 'fullstack').length },
    { id: 'bot', name: 'Telegram Bots', count: allProjects.filter(p => p.category === 'bot').length },
    { id: 'ai', name: 'AI Tools', count: allProjects.filter(p => p.category === 'ai').length },
    { id: 'trading', name: 'Trading Tools', count: allProjects.filter(p => p.category === 'trading').length },
    { id: 'automation', name: 'Automation', count: allProjects.filter(p => p.category === 'automation').length },
    { id: 'mobile', name: 'Mobile Apps', count: allProjects.filter(p => p.category === 'mobile').length },
    { id: 'web', name: 'Web Apps', count: allProjects.filter(p => p.category === 'web').length }
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

      {/* Interactive Portfolio Section */}
      <InteractivePortfolio />

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              <div className="text-center py-4">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Projects</div>
              </div>
              <div className="text-center py-4">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">25+</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Clients</div>
              </div>
              <div className="text-center py-4">
                <div className="text-2xl sm:text-3xl font-bold text-purple-700">3+</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Years</div>
              </div>
              <div className="text-center py-4">
                <div className="text-2xl sm:text-3xl font-bold text-slate-600">100%</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">Satisfaction</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 mb-4 sm:mb-0">
                <CardContent className="p-4 sm:p-6 text-center space-y-4">
                  <div className={`inline-flex p-4 rounded-full ${service.color} text-white mb-4`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-900 dark:text-white leading-tight">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mb-4 leading-relaxed">{service.description}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {featuredProjects.slice(0, 3).map((project) => (
              <ProjectCard key={project.id} project={project} className="mb-4 sm:mb-0" />
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
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-slate-700 text-white">
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
