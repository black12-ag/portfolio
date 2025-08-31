import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import PortfolioHero from '@/components/portfolio/PortfolioHero';
import ProjectCard, { Project } from '@/components/portfolio/ProjectCard';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Palette, 
  ChevronRight,
  Star,
  Award,
  Users,
  Coffee,
  Zap,
  Heart
} from 'lucide-react';

// Featured projects for home page
const featuredProjects: Project[] = [
  {
    id: '1',
    title: 'Hotel Booking Website',
    description: 'Complete hotel booking platform with user authentication, search filters, payment integration, and admin dashboard.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Stripe'],
    category: 'fullstack',
    githubUrl: 'https://github.com/munir-ayub/hotel-booking-website',
    liveUrl: 'https://hotel-booking-demo.netlify.app',
    featured: true,
    completedDate: '2024-12',
    status: 'completed'
  },
  {
    id: '2',
    title: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React, Node.js, and PostgreSQL. Features include user authentication and payment processing.',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    category: 'fullstack',
    githubUrl: 'https://github.com/yourusername/ecommerce-platform',
    featured: true,
    completedDate: '2024-08',
    status: 'completed'
  },
  {
    id: '3',
    title: 'Mobile Fitness App',
    description: 'React Native fitness tracking app with workout plans, progress tracking, and social features.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    technologies: ['React Native', 'TypeScript', 'Firebase'],
    category: 'mobile',
    githubUrl: 'https://github.com/yourusername/fitness-app',
    featured: true,
    completedDate: '2024-07',
    status: 'completed'
  }
];

// Services overview for home page
const services = [
  {
    icon: Globe,
    title: 'Web Development',
    description: 'Modern, responsive web applications built with React, Next.js, and TypeScript.',
    color: 'bg-blue-500'
  },
  {
    icon: Smartphone,
    title: 'Mobile Apps',
    description: 'Cross-platform mobile applications using React Native and Flutter.',
    color: 'bg-green-500'
  },
  {
    icon: Code,
    title: 'Full Stack Solutions',
    description: 'Complete end-to-end solutions with backend APIs, databases, and deployment.',
    color: 'bg-purple-500'
  },
  {
    icon: Palette,
    title: 'UI/UX Design',
    description: 'User-centered design with modern interfaces and seamless experiences.',
    color: 'bg-pink-500'
  }
];

// Why choose me section
const highlights = [
  {
    icon: Zap,
    title: 'Fast Delivery',
    description: 'Quick turnaround times without compromising on quality.',
    color: 'text-yellow-500'
  },
  {
    icon: Users,
    title: 'Client-Focused',
    description: 'Clear communication and collaboration throughout the project.',
    color: 'text-blue-500'
  },
  {
    icon: Award,
    title: 'Quality Assured',
    description: 'Clean, maintainable code following industry best practices.',
    color: 'text-green-500'
  },
  {
    icon: Coffee,
    title: 'Always Available',
    description: 'Responsive support and maintenance for all projects.',
    color: 'text-orange-500'
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      text: "Munir delivered an exceptional booking system that transformed our business operations. The attention to detail and user experience is outstanding.",
      author: "Sarah Johnson",
      position: "CEO, TravelPro",
      rating: 5
    },
    {
      text: "Working with Munir was a pleasure. He understood our requirements perfectly and delivered beyond expectations.",
      author: "Mike Chen", 
      position: "CTO, TechStart",
      rating: 5
    },
    {
      text: "The mobile app Munir built for us has received amazing feedback from our users. Highly recommended!",
      author: "Lisa Rodriguez",
      position: "Product Manager, FitLife",
      rating: 5
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <PortfolioHero />

      {/* Services Overview */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What I Do</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I specialize in creating comprehensive digital solutions that drive business growth.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex p-4 rounded-full ${service.color} text-white mb-4`}>
                    <service.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{service.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Featured Projects</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Check out some of my recent work and the technologies I've used.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" onClick={() => navigate('/portfolio')}>
              View All Projects
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Why Work With Me?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              I bring passion, expertise, and dedication to every project.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4`}>
                  <highlight.icon className={`w-8 h-8 ${highlight.color}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{highlight.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Client Testimonials</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              What my clients say about working with me.
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-yellow-500 fill-yellow-500"
                    />
                  ))}
                </div>
                <blockquote className="text-xl italic text-gray-700 dark:text-gray-300 mb-6">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div className="text-gray-900 dark:text-white">
                  <div className="font-semibold text-lg">{testimonials[currentTestimonial].author}</div>
                  <div className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].position}</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentTestimonial 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss your ideas and create something amazing together.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => navigate('/contact')}
          >
            <Heart className="w-5 h-5 mr-2" />
            Let's Work Together
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
