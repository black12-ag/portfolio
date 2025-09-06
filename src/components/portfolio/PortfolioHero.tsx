import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, Download, ExternalLink, Code, Smartphone, Palette, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { motion } from 'framer-motion';

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
    <BackgroundPaths>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Text with Letter Animation */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white leading-tight"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Munir Ayub
              </span>
            </motion.h1>
            <motion.h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-neutral-700 dark:text-neutral-300"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Full Stack Developer & Digital Solutions Expert
            </motion.h2>
            <motion.p 
              className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              I create comprehensive digital solutions including web applications, mobile apps, desktop software, 
              and automation tools. From e-commerce platforms to booking systems, I transform complex business 
              requirements into elegant, scalable solutions.
            </motion.p>
          </motion.div>

          {/* Skills Tags */}
          <motion.div 
            className="flex flex-wrap gap-3 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            {skills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <Badge 
                  variant="secondary" 
                  className={`${skill.color} text-white border-0 px-4 py-2 text-sm font-medium hover:scale-105 transition-all duration-300 backdrop-blur-sm`}
                >
                  <skill.icon className="w-4 h-4 mr-2" />
                  {skill.name}
                </Badge>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/portfolio')}
              >
                <Code className="w-5 h-5 mr-2" />
                View My Work
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-8 py-3 text-lg transition-all duration-300"
                onClick={() => navigate('/contact')}
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 px-8 py-3 text-lg transition-all duration-300"
                onClick={() => window.open('/resume.pdf', '_blank')}
              >
                <Download className="w-5 h-5 mr-2" />
                Download CV
              </Button>
            </motion.div>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            className="flex gap-4 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
          >
            {[
              { icon: Github, url: 'https://github.com/munir-ayub' },
              { icon: Linkedin, url: 'https://linkedin.com/in/munir-ayub' },
              { icon: Mail, url: 'mailto:munir.ayub@example.com' }
            ].map((social, index) => (
              <motion.div 
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-300"
                  onClick={() => window.open(social.url, '_blank')}
                >
                  <social.icon className="w-6 h-6" />
                </Button>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-neutral-400 dark:border-neutral-600 rounded-full flex justify-center cursor-pointer hover:border-blue-500 transition-colors duration-300"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-1 h-3 bg-neutral-600 dark:bg-neutral-400 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </BackgroundPaths>
  );
}
