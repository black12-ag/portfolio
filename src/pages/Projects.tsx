import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProjectCard, { Project } from '@/components/portfolio/ProjectCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  Code,
  ExternalLink,
  Github,
  Star,
  Clock,
  User
} from 'lucide-react';

// All project data - expanded from Portfolio.tsx
const allProjects: Project[] = [
  {
    id: '1',
    title: 'Hotel Booking Website',
    description: 'Complete hotel booking platform with user authentication, advanced search filters, real-time availability, payment integration (Stripe), and comprehensive admin dashboard. Features include booking management, user profiles, review system, and multi-language support.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe', 'JWT', 'Express', 'Tailwind CSS'],
    category: 'fullstack',
    liveUrl: 'https://hotel-booking-demo.netlify.app',
    githubUrl: 'https://github.com/munir-ayub/hotel-booking-website',
    featured: true,
    completedDate: '2024-12',
    client: 'Tourism Business',
    status: 'completed',
    testimonial: {
      text: 'Outstanding booking system that streamlined our entire reservation process. Customer satisfaction increased significantly!',
      author: 'Ahmed Hassan, Hotel Manager',
      rating: 5
    },
    keyFeatures: [
      'Real-time booking system',
      'Payment processing with Stripe',
      'Advanced search and filtering',
      'Admin dashboard and analytics',
      'Multi-language support',
      'Review and rating system'
    ]
  },
  {
    id: '2',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include user authentication, payment processing, inventory management, and comprehensive admin dashboard.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
    category: 'fullstack',
    githubUrl: 'https://github.com/yourusername/ecommerce-platform',
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
    id: '3',
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
    id: '4',
    title: 'Portfolio Website Design',
    description: 'Modern portfolio website design for a creative agency with animations and responsive layout.',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
    technologies: ['Figma', 'HTML', 'CSS', 'JavaScript', 'GSAP'],
    category: 'design',
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
    id: '5',
    title: 'Task Management Dashboard',
    description: 'Web-based task management system with team collaboration features and real-time updates.',
    image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
    technologies: ['Vue.js', 'Node.js', 'Socket.io', 'MongoDB'],
    category: 'web',
    githubUrl: 'https://github.com/yourusername/task-manager',
    completedDate: '2024-05',
    status: 'completed'
  },
  {
    id: '6',
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
    id: '7',
    title: 'Restaurant Booking System',
    description: 'Complete restaurant management system with online reservations, menu management, and POS integration.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
    category: 'fullstack',
    completedDate: '2024-12',
    status: 'coming-soon'
  },
  {
    id: '8',
    title: 'Real Estate Platform',
    description: 'Property listing platform with advanced search, virtual tours, and agent dashboard.',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Express', 'MongoDB', 'Mapbox'],
    category: 'fullstack',
    githubUrl: 'https://github.com/yourusername/real-estate-platform',
    completedDate: '2024-04',
    status: 'completed'
  },
  {
    id: '9',
    title: 'Learning Management System',
    description: 'Educational platform with course management, video streaming, and progress tracking.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop',
    technologies: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'Stripe'],
    category: 'web',
    completedDate: '2024-03',
    status: 'completed'
  },
  {
    id: '10',
    title: 'Cryptocurrency Dashboard',
    description: 'Real-time crypto tracking dashboard with portfolio management and trading insights.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Chart.js', 'WebSocket', 'CoinGecko API'],
    category: 'web',
    githubUrl: 'https://github.com/yourusername/crypto-dashboard',
    completedDate: '2024-02',
    status: 'completed'
  }
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(allProjects);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(allProjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = [
    { id: 'all', name: 'All Projects', count: allProjects.length },
    { id: 'fullstack', name: 'Full Stack', count: allProjects.filter(p => p.category === 'fullstack').length },
    { id: 'web', name: 'Web Apps', count: allProjects.filter(p => p.category === 'web').length },
    { id: 'mobile', name: 'Mobile Apps', count: allProjects.filter(p => p.category === 'mobile').length },
    { id: 'design', name: 'Design', count: allProjects.filter(p => p.category === 'design').length }
  ];

  const statuses = [
    { id: 'all', name: 'All Status' },
    { id: 'completed', name: 'Completed' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'coming-soon', name: 'Coming Soon' }
  ];

  // Filter and sort projects
  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    // Apply status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(project => project.status === selectedStatus);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.completedDate || '0');
        const dateB = new Date(b.completedDate || '0');
        return sortOrder === 'desc' ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      } else {
        return sortOrder === 'desc' ? b.title.localeCompare(a.title) : a.title.localeCompare(b.title);
      }
    });

    setFilteredProjects(filtered);
  }, [searchTerm, selectedCategory, selectedStatus, sortBy, sortOrder, projects]);

  const handleSortToggle = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              My Projects
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Explore my portfolio of web applications, mobile apps, and digital solutions. 
              Each project showcases different technologies and problem-solving approaches.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge className="bg-green-500 text-white px-4 py-2">
                <Code className="w-4 h-4 mr-2" />
                {allProjects.length} Total Projects
              </Badge>
              <Badge className="bg-blue-500 text-white px-4 py-2">
                <Star className="w-4 h-4 mr-2" />
                {allProjects.filter(p => p.featured).length} Featured
              </Badge>
              <Badge className="bg-purple-500 text-white px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                Latest: {allProjects.sort((a, b) => new Date(b.completedDate || '0').getTime() - new Date(a.completedDate || '0').getTime())[0]?.completedDate}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Search Bar */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search projects, technologies, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-10"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-10"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-8"
                  >
                    {category.name} ({category.count})
                  </Button>
                ))}
              </div>

              {/* Status and Sort Controls */}
              <div className="flex items-center gap-4">
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  {statuses.map((status) => (
                    <option key={status.id} value={status.id}>{status.name}</option>
                  ))}
                </select>

                {/* Sort Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                  </select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSortToggle}
                    className="h-8 w-8 p-0"
                  >
                    {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid/List */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-600 dark:text-gray-300">
                Showing {filteredProjects.length} of {allProjects.length} projects
                {searchTerm && (
                  <span className="ml-2">
                    for "<span className="font-medium text-gray-900 dark:text-white">{searchTerm}</span>"
                  </span>
                )}
              </p>
              
              {/* Clear Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Projects Display */}
            {filteredProjects.length > 0 ? (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" 
                : "space-y-6"
              }>
                {filteredProjects.map((project) => (
                  viewMode === 'grid' ? (
                    <ProjectCard key={project.id} project={project} />
                  ) : (
                    <ProjectCard key={project.id} project={project} showFullDetails={true} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Filter className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No Projects Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  No projects match your current filters. Try adjusting your search terms or filters.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Project Stats */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Project Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-blue-600 mb-2">{allProjects.length}</div>
                <div className="text-gray-700 dark:text-gray-300">Total Projects</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {allProjects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-gray-700 dark:text-gray-300">Completed</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {[...new Set(allProjects.flatMap(p => p.technologies))].length}
                </div>
                <div className="text-gray-700 dark:text-gray-300">Technologies</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {allProjects.filter(p => p.testimonial).length}
                </div>
                <div className="text-gray-700 dark:text-gray-300">Happy Clients</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Like What You See?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            I'm always working on new projects and would love to discuss your ideas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/contact'}
            >
              Start Your Project
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              onClick={() => window.open('https://github.com/munir-ayub', '_blank')}
            >
              <Github className="w-5 h-5 mr-2" />
              View All Code
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
