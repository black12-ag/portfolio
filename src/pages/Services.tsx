import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Palette, 
  Users,
  Database,
  Monitor,
  Cog,
  Server,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  DollarSign,
  MessageSquare,
  Target,
  Briefcase,
  Award,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Main services data
const mainServices = [
  {
    id: 'web-apps',
    icon: Globe,
    title: 'Web Applications',
    description: 'Modern, responsive web applications with complex business logic and real-time features.',
    longDescription: 'I create sophisticated web applications using cutting-edge technologies like React, Next.js, and TypeScript. From simple landing pages to complex enterprise applications, I focus on performance, scalability, and user experience.',
    technologies: ['React', 'Next.js', 'TypeScript', 'Vue.js', 'Tailwind CSS', 'Node.js'],
    features: [
      'Responsive design for all devices',
      'Performance optimization',
      'SEO and accessibility compliance',
      'Modern UI/UX design',
      'Real-time functionality',
      'Progressive Web App (PWA) support'
    ],
    startingPrice: '$2,500',
    timeline: '4-8 weeks',
    color: 'bg-blue-500',
    popular: true
  },
  {
    id: 'mobile-apps',
    icon: Smartphone,
    title: 'Mobile Development',
    description: 'Cross-platform and native mobile applications for iOS and Android platforms.',
    longDescription: 'I develop high-quality mobile applications using React Native and Flutter, ensuring your app works seamlessly across both iOS and Android platforms while maintaining native performance.',
    technologies: ['React Native', 'Flutter', 'Expo', 'iOS', 'Android', 'Firebase'],
    features: [
      'Cross-platform compatibility',
      'Native performance',
      'App Store deployment',
      'Push notifications',
      'Offline functionality',
      'Device integration (camera, GPS, etc.)'
    ],
    startingPrice: '$5,000',
    timeline: '6-12 weeks',
    color: 'bg-green-500',
    popular: false
  },
  {
    id: 'backend-apis',
    icon: Database,
    title: 'Backend & APIs',
    description: 'Robust server architecture, RESTful APIs, database design, and cloud deployment.',
    longDescription: 'I build scalable backend systems and APIs that power your applications. From database design to cloud deployment, I ensure your backend is secure, performant, and maintainable.',
    technologies: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'],
    features: [
      'RESTful API development',
      'Database design and optimization',
      'Authentication and authorization',
      'Cloud deployment and scaling',
      'API documentation',
      'Performance monitoring'
    ],
    startingPrice: '$3,000',
    timeline: '3-6 weeks',
    color: 'bg-purple-500',
    popular: true
  },
  {
    id: 'fullstack',
    icon: Code,
    title: 'Full Stack Solutions',
    description: 'Complete end-to-end solutions combining frontend, backend, and deployment.',
    longDescription: 'I provide comprehensive full-stack development services, handling everything from initial concept to deployment and maintenance. Perfect for businesses needing complete digital solutions.',
    technologies: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS', 'Docker'],
    features: [
      'Complete application development',
      'Frontend and backend integration',
      'Database design and management',
      'Deployment and DevOps',
      'Ongoing maintenance and support',
      'Performance optimization'
    ],
    startingPrice: '$8,000',
    timeline: '8-16 weeks',
    color: 'bg-indigo-500',
    popular: true
  },
  {
    id: 'desktop-apps',
    icon: Monitor,
    title: 'Desktop Applications',
    description: 'Cross-platform desktop applications using Electron and modern web technologies.',
    longDescription: 'I create powerful desktop applications that work across Windows, macOS, and Linux using Electron and modern web technologies, bringing web development skills to desktop environments.',
    technologies: ['Electron', 'React', 'TypeScript', 'Node.js', 'SQLite'],
    features: [
      'Cross-platform compatibility',
      'Native OS integration',
      'Offline functionality',
      'File system access',
      'System notifications',
      'Auto-updates'
    ],
    startingPrice: '$4,000',
    timeline: '6-10 weeks',
    color: 'bg-orange-500',
    popular: false
  },
  {
    id: 'automation',
    icon: Cog,
    title: 'Process Automation',
    description: 'Custom automation tools, scripts, and workflow optimization solutions.',
    longDescription: 'I help businesses automate repetitive tasks and optimize workflows through custom scripts, tools, and integrations, saving time and reducing human error.',
    technologies: ['Python', 'Node.js', 'Automation', 'APIs', 'Webhooks', 'CI/CD'],
    features: [
      'Workflow automation',
      'Data processing and migration',
      'API integrations',
      'Scheduled tasks and jobs',
      'Custom dashboards',
      'Performance monitoring'
    ],
    startingPrice: '$1,500',
    timeline: '2-4 weeks',
    color: 'bg-red-500',
    popular: false
  },
  {
    id: 'ui-ux-design',
    icon: Palette,
    title: 'UI/UX Design',
    description: 'User-centered design with modern interfaces and seamless user experiences.',
    longDescription: 'I create beautiful, intuitive user interfaces and experiences that not only look great but also drive engagement and conversions. From wireframes to final designs.',
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    features: [
      'User research and personas',
      'Wireframing and prototyping',
      'Visual design and branding',
      'Usability testing',
      'Design systems',
      'Responsive design'
    ],
    startingPrice: '$2,000',
    timeline: '3-6 weeks',
    color: 'bg-pink-500',
    popular: false
  }
];

// Additional services
const additionalServices = [
  {
    icon: Shield,
    title: 'Security Audits',
    description: 'Comprehensive security reviews and vulnerability assessments for your applications.',
    price: '$1,000+'
  },
  {
    icon: TrendingUp,
    title: 'Performance Optimization',
    description: 'Speed up your existing applications and improve user experience.',
    price: '$800+'
  },
  {
    icon: Server,
    title: 'DevOps & Deployment',
    description: 'Set up CI/CD pipelines, cloud infrastructure, and monitoring systems.',
    price: '$1,200+'
  },
  {
    icon: Users,
    title: 'Team Training',
    description: 'Train your development team on modern technologies and best practices.',
    price: '$500/day'
  }
];

// Process steps
const processSteps = [
  {
    step: 1,
    title: 'Discovery & Planning',
    description: 'We discuss your project requirements, goals, and timeline to create a detailed plan.',
    icon: MessageSquare
  },
  {
    step: 2,
    title: 'Design & Architecture',
    description: 'I create wireframes, design mockups, and plan the technical architecture.',
    icon: Palette
  },
  {
    step: 3,
    title: 'Development',
    description: 'I build your application using modern technologies and best practices.',
    icon: Code
  },
  {
    step: 4,
    title: 'Testing & Deployment',
    description: 'Thorough testing, optimization, and deployment to your preferred platform.',
    icon: CheckCircle
  },
  {
    step: 5,
    title: 'Support & Maintenance',
    description: 'Ongoing support, updates, and maintenance to keep your application running smoothly.',
    icon: Shield
  }
];

export default function Services() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const popularServices = mainServices.filter(service => service.popular);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Development Services
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Comprehensive development solutions to bring your digital ideas to life. 
              From web applications to mobile apps, I've got you covered.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge className="bg-green-500 text-white px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                100% Client Satisfaction
              </Badge>
              <Badge className="bg-blue-500 text-white px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Fast Delivery
              </Badge>
              <Badge className="bg-purple-500 text-white px-4 py-2">
                <Award className="w-4 h-4 mr-2" />
                Quality Guaranteed
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">Core Services</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              I offer a comprehensive range of development services tailored to your business needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainServices.map((service) => (
                <Card 
                  key={service.id} 
                  className={`hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 cursor-pointer ${
                    service.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                  }`}
                  onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                >
                  <CardHeader className="text-center pb-4">
                    {service.popular && (
                      <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                        Popular
                      </Badge>
                    )}
                    <div className={`inline-flex p-4 rounded-full ${service.color} text-white mb-4`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{service.title}</CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {selectedService === service.id ? (
                      <>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{service.longDescription}</p>
                        
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Key Features:</h4>
                          <ul className="space-y-1">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-green-600 font-semibold">
                              <DollarSign className="w-4 h-4" />
                              {service.startingPrice}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Starting from</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-blue-600 font-semibold">
                              <Clock className="w-4 h-4" />
                              {service.timeline}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Timeline</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {service.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {service.technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{service.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>From {service.startingPrice}</span>
                          <span>{service.timeline}</span>
                        </div>
                        
                        <Button variant="outline" size="sm" className="w-full">
                          Learn More <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Additional Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {additionalServices.map((service, index) => (
                <Card key={index} className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <service.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{service.description}</p>
                    <p className="text-blue-600 font-semibold">{service.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Development Process */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">My Development Process</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              A proven methodology that ensures successful project delivery and client satisfaction.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              {processSteps.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {/* Connector Line */}
                  {index < processSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 dark:bg-gray-600 transform translate-x-4" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {step.step}
                    </div>
                    <step.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Me */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12 text-gray-900 dark:text-white">Why Choose Me?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fast Delivery</h3>
                <p className="text-gray-600 dark:text-gray-300">Quick turnaround times without compromising on quality.</p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Client-Focused</h3>
                <p className="text-gray-600 dark:text-gray-300">Clear communication and collaboration throughout.</p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Quality Assured</h3>
                <p className="text-gray-600 dark:text-gray-300">Clean, maintainable code following best practices.</p>
              </div>
              <div className="text-center">
                <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Results-Driven</h3>
                <p className="text-gray-600 dark:text-gray-300">Focus on solutions that drive business growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Information */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Transparent Pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
              Clear, honest pricing with no hidden fees. Every project is unique, so let's discuss your specific needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {popularServices.map((service) => (
                <Card key={service.id} className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-6 text-center">
                    <service.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{service.description}</p>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{service.startingPrice}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Starting from</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              All projects include free consultation, project planning, and 30 days of post-launch support.
            </p>
            
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => navigate('/contact')}
            >
              Get Custom Quote
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Let's discuss your project requirements and create something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/contact')}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Start Discussion
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              onClick={() => navigate('/projects')}
            >
              <Briefcase className="w-5 h-5 mr-2" />
              View My Work
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
