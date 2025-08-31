import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, Download, ExternalLink, Code, Smartphone, Palette, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PortfolioHeroProps {
  imageUrls?: string[];
}

export default function PortfolioHero({ imageUrls }: PortfolioHeroProps) {
  const navigate = useNavigate();
  
  // Default portfolio background images (you can replace these with your own)
  const defaultImages = [
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop', // Coding
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1920&h=1080&fit=crop', // Mobile dev
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=1080&fit=crop', // Design
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&h=1080&fit=crop', // Development
  ];

  const images = useMemo(
    () => imageUrls && imageUrls.length > 0 ? imageUrls : defaultImages,
    [imageUrls]
  );

  const [current, setCurrent] = useState(0);
  const [intervalMs, setIntervalMs] = useState(5000);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  const skills = [
    { name: 'Full Stack Development', icon: Code, color: 'bg-blue-500' },
    { name: 'Mobile Apps', icon: Smartphone, color: 'bg-green-500' },
    { name: 'UI/UX Design', icon: Palette, color: 'bg-purple-500' },
    { name: 'Booking Systems', icon: Globe, color: 'bg-orange-500' },
  ];

  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '25+', label: 'Happy Clients' },
    { number: '3+', label: 'Years Experience' },
    { number: '24/7', label: 'Support Available' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        {images.map((src, idx) => (
          <img
            key={`${src}-${idx}`}
            src={src}
            alt="Portfolio background"
            className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-700 ${
              idx === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 dark:bg-white/20 rounded-full animate-float hidden lg:block"></div>
      <div className="absolute bottom-32 right-16 w-16 h-16 bg-blue-500/20 rounded-full animate-float animation-delay-1000 hidden lg:block"></div>
      <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-purple-500/20 rounded-full animate-float animation-delay-2000 hidden lg:block"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Text */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white dark:text-white leading-tight">
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Munir Ayub
              </span>
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white/90">
              Full Stack Developer & Digital Solutions Expert
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              I create comprehensive digital solutions including web applications, mobile apps, desktop software, 
              and automation tools. From e-commerce platforms to booking systems, I transform complex business 
              requirements into elegant, scalable solutions.
            </p>
          </div>

          {/* Skills Tags */}
          <div className="flex flex-wrap gap-3 justify-center animate-slide-up animation-delay-300">
            {skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className={`${skill.color} text-white border-0 px-4 py-2 text-sm font-medium hover:scale-105 transition-transform`}
              >
                <skill.icon className="w-4 h-4 mr-2" />
                {skill.name}
              </Badge>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up animation-delay-500">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              onClick={() => navigate('/portfolio')}
            >
              <Code className="w-5 h-5 mr-2" />
              View My Work
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg transition-all duration-300"
              onClick={() => navigate('/contact')}
            >
              <Mail className="w-5 h-5 mr-2" />
              Get In Touch
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-gray-900 px-8 py-3 text-lg transition-all duration-300"
              onClick={() => window.open('/resume.pdf', '_blank')}
            >
              <Download className="w-5 h-5 mr-2" />
              Download CV
            </Button>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 justify-center animate-slide-up animation-delay-700">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-3"
              onClick={() => window.open('https://github.com/munir-ayub', '_blank')}
            >
              <Github className="w-6 h-6" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-3"
              onClick={() => window.open('https://linkedin.com/in/munir-ayub', '_blank')}
            >
              <Linkedin className="w-6 h-6" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-3"
              onClick={() => window.open('mailto:munir.ayub@example.com', '_blank')}
            >
              <Mail className="w-6 h-6" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 animate-slide-up animation-delay-1000">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center cursor-pointer"
             onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}
