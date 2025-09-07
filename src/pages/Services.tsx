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
  TrendingUp,
  Bot,
  Cpu,
  Laptop,
  Settings2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Main services data - redesigned with cleaner structure
const mainServices = [
  {
    id: 'web-apps',
    icon: '💻',
    lucideIcon: Laptop,
    title: 'Web Apps',
    shortDescription: 'Modern responsive websites and web applications.',
    description: 'Custom web applications built with React, Next.js, and modern technologies for optimal performance and user experience.',
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    startingPrice: '$2,500',
    timeline: '4-8 weeks',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    popular: true
  },
  {
    id: 'mobile-apps',
    icon: '📱',
    lucideIcon: Smartphone,
    title: 'Mobile Apps',
    shortDescription: 'Cross-platform iOS and Android applications.',
    description: 'Native-quality mobile apps using React Native and Flutter that work seamlessly across all platforms.',
    technologies: ['React Native', 'Flutter', 'Expo', 'Firebase'],
    startingPrice: '$5,000',
    timeline: '6-12 weeks',
    color: 'from-blue-600 to-blue-700',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50',
    popular: false
  },
  {
    id: 'automation',
    icon: '⚡',
    lucideIcon: Zap,
    title: 'Automation',
    shortDescription: 'Streamline workflows and automate repetitive tasks.',
    description: 'Custom automation solutions to boost productivity and eliminate manual processes using modern tools and APIs.',
    technologies: ['Python', 'Node.js', 'APIs', 'Webhooks'],
    startingPrice: '$1,500',
    timeline: '2-4 weeks',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    popular: true
  },
  {
    id: 'bots',
    icon: '🤖',
    lucideIcon: Bot,
    title: 'Bots',
    shortDescription: 'Intelligent chatbots and automated assistants.',
    description: 'AI-powered bots for customer support, lead generation, and task automation across multiple platforms.',
    technologies: ['OpenAI', 'Telegram API', 'Discord.js', 'NLP'],
    startingPrice: '$2,000',
    timeline: '3-6 weeks',
    color: 'from-purple-600 to-purple-700',
    borderColor: 'border-purple-300',
    bgColor: 'bg-purple-50',
    popular: true
  },
  {
    id: 'backend-apis',
    icon: '🔧',
    lucideIcon: Settings2,
    title: 'Backend & APIs',
    shortDescription: 'Robust server infrastructure and API development.',
    description: 'Scalable backend systems with secure APIs, database optimization, and cloud deployment solutions.',
    technologies: ['Node.js', 'PostgreSQL', 'MongoDB', 'AWS'],
    startingPrice: '$3,000',
    timeline: '3-6 weeks',
    color: 'from-slate-500 to-slate-600',
    borderColor: 'border-slate-200',
    bgColor: 'bg-slate-50',
    popular: false
  },
  {
    id: 'ai-tools',
    icon: '✨',
    lucideIcon: Sparkles,
    title: 'AI Tools',
    shortDescription: 'Custom AI solutions and intelligent applications.',
    description: 'Leverage AI and machine learning to build smart tools that enhance productivity and user experience.',
    technologies: ['OpenAI', 'TensorFlow', 'Python', 'LangChain'],
    startingPrice: '$4,000',
    timeline: '4-8 weeks',
    color: 'from-blue-700 to-purple-600',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    popular: true
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
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-100 dark:from-gray-900 via-gray-850 dark:to-gray-800">
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
              Comprehensive development services to bring your ideas to life
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mainServices.map((service) => {
                const LucideIcon = service.lucideIcon;
                return (
                  <Card 
                    key={service.id} 
                    className={`group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden ${
                      service.popular 
                        ? 'ring-2 ring-blue-400 ring-opacity-50 border-blue-200 dark:border-blue-700' 
                        : `${service.borderColor} dark:border-gray-700 border`
                    }`}
                    onClick={() => setSelectedService(selectedService === service.id ? null : service.id)}
                  >
                    {service.popular && (
                      <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-500 to-blue-600 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                        Popular
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        {/* Emoji Icon with Gradient Background */}
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${service.color} text-white text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          {service.icon}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {service.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                          {service.shortDescription}
                        </p>
                      </div>
                      
                      {selectedService === service.id ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                            {service.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-2">
                            {service.technologies.map((tech, index) => (
                              <Badge key={index} variant="secondary" className="text-xs px-2 py-1">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">
                                {service.startingPrice}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Starting from</p>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {service.timeline}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Timeline</p>
                            </div>
                          </div>
                          
                          <Button 
                            className={`w-full bg-gradient-to-r ${service.color} text-white hover:shadow-lg transition-all duration-300`}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/contact');
                            }}
                          >
                            Get Started
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {service.technologies.slice(0, 3).map((tech, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {service.technologies.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{service.technologies.length - 3}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{service.startingPrice}</span>
                            <span>{service.timeline}</span>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full group-hover:bg-gray-50 dark:group-hover:bg-gray-800 transition-colors"
                          >
                            View Details <ArrowRight className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
              {popularServices.map((service) => {
                const LucideIcon = service.lucideIcon;
                return (
                  <Card key={service.id} className={`border-2 ${service.borderColor} ${service.bgColor} dark:bg-opacity-20 hover:shadow-lg transition-shadow`}>
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} text-white text-xl mb-4`}>
                        {service.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{service.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{service.shortDescription}</p>
                      <div className="text-2xl font-bold text-green-600 mb-2">{service.startingPrice}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Starting from</p>
                    </CardContent>
                  </Card>
                );
              })}
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
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-slate-700 text-white">
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
