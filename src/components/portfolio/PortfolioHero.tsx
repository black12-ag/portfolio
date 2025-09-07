import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, Mail, Download, Eye, Smartphone, Palette, Globe, Briefcase } from 'lucide-react';
import { FaWhatsapp, FaTelegram } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { BackgroundPaths } from '@/components/ui/background-paths';
import { motion } from 'framer-motion';

interface PortfolioHeroProps {
  imageUrls?: string[];
}

interface HeroImage {
  id: string;
  url: string;
  alt: string;
  name: string;
}

interface HeroSettings {
  slideshowInterval: number;
  enableSlideshow: boolean;
}

export default function PortfolioHero({ imageUrls }: PortfolioHeroProps) {
  const navigate = useNavigate();
  
  // State for admin-managed hero images and settings
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    slideshowInterval: 5000,
    enableSlideshow: true
  });
  const [profilePhoto, setProfilePhoto] = useState<string>('/images/profile-photo.jpg');
  
  // Default portfolio background images (fallback)
  const defaultImages = [
    '/images/profile-photo.jpg'
  ];

  const images = useMemo(() => {
    // If admin has set hero images, use those
    if (heroImages.length > 0) {
      return heroImages.map(img => img.url);
    }
    // Otherwise use provided imageUrls or default
    return imageUrls && imageUrls.length > 0 ? imageUrls : defaultImages;
  }, [heroImages, imageUrls]);

  const [current, setCurrent] = useState(0);

  // Load hero images and settings from localStorage
  useEffect(() => {
    const loadHeroData = () => {
      const storedImages = localStorage.getItem('hero_images');
      const storedSettings = localStorage.getItem('hero_settings');
      const storedProfilePhoto = localStorage.getItem('profile_photo');
      
      if (storedImages) {
        setHeroImages(JSON.parse(storedImages));
      }
      
      if (storedSettings) {
        setHeroSettings(JSON.parse(storedSettings));
      }
      
      if (storedProfilePhoto) {
        setProfilePhoto(storedProfilePhoto);
      }
    };
    
    loadHeroData();
    
    // Listen for admin updates
    const handleHeroImagesUpdate = (event: CustomEvent) => {
      setHeroImages(event.detail);
    };
    
    const handleHeroSettingsUpdate = (event: CustomEvent) => {
      setHeroSettings(event.detail);
    };
    
    const handleProfilePhotoUpdate = (event: CustomEvent) => {
      setProfilePhoto(event.detail);
    };
    
    window.addEventListener('heroImagesUpdated', handleHeroImagesUpdate as EventListener);
    window.addEventListener('heroSettingsUpdated', handleHeroSettingsUpdate as EventListener);
    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);
    
    return () => {
      window.removeEventListener('heroImagesUpdated', handleHeroImagesUpdate as EventListener);
      window.removeEventListener('heroSettingsUpdated', handleHeroSettingsUpdate as EventListener);
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);
    };
  }, []);

  // Handle slideshow
  useEffect(() => {
    if (images.length <= 1 || !heroSettings.enableSlideshow) return;
    
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, heroSettings.slideshowInterval);
    
    return () => clearInterval(id);
  }, [images.length, heroSettings.slideshowInterval, heroSettings.enableSlideshow]);

  const skills = [
    { 
      name: 'Web Development', 
      icon: Globe, 
      color: 'bg-gradient-to-r from-blue-500 to-blue-600', 
      hoverColor: 'hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25',
      borderColor: 'hover:ring-2 hover:ring-blue-400/50'
    },
    { 
      name: 'Mobile Apps', 
      icon: Smartphone, 
      color: 'bg-gradient-to-r from-green-500 to-emerald-600', 
      hoverColor: 'hover:from-green-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/25',
      borderColor: 'hover:ring-2 hover:ring-green-400/50'
    },
    { 
      name: 'UI/UX Design', 
      icon: Palette, 
      color: 'bg-gradient-to-r from-purple-500 to-pink-600', 
      hoverColor: 'hover:from-purple-600 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25',
      borderColor: 'hover:ring-2 hover:ring-purple-400/50'
    },
    { 
      name: 'Automation', 
      icon: Briefcase, 
      color: 'bg-gradient-to-r from-orange-500 to-amber-600', 
      hoverColor: 'hover:from-orange-600 hover:to-amber-700 hover:shadow-lg hover:shadow-orange-500/25',
      borderColor: 'hover:ring-2 hover:ring-orange-400/50'
    },
  ];

  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '21+', label: 'Happy Clients' },
    { number: '3+', label: 'Years Experience' },
    { number: '15 hours', label: 'Support Available' },
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-16">
      {/* Dynamic Background Images */}
      {images.length > 0 && (
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <motion.div
              key={`bg-${index}`}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${image})` }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: index === current ? 0.2 : 0,
                scale: index === current ? 1.1 : 1
              }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          ))}
          {/* Overlay */}
          <div className="absolute inset-0 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm" />
        </div>
      )}
      
      {/* Animated Background Paths */}
      <BackgroundPaths>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-6xl mx-auto space-y-12">
            {/* Main Hero Content */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                className="flex-1 text-center lg:text-left space-y-6"
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-neutral-900 dark:text-white leading-tight"
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
                  className="text-xl sm:text-2xl lg:text-3xl font-semibold text-neutral-700 dark:text-neutral-300"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  Full Stack Developer | Apps, Web & Automation
                </motion.h2>
                <motion.p 
                  className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  I build scalable applications that solve real-world problems. From e-commerce platforms to mobile apps, 
                  I transform your ideas into powerful digital solutions.
                </motion.p>
              </motion.div>

              {/* Professional Photo */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
                className="flex-shrink-0"
              >
                <div className="relative">
                  <motion.div 
                    className="w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                      <img 
                        src={profilePhoto}
                        alt="Munir Ayub - Full Stack Developer"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://ui-avatars.com/api/?name=Munir+Ayub&size=400&background=3b82f6&color=ffffff&format=svg';
                        }}
                      />
                    </div>
                  </motion.div>
                  
                  {/* Floating badges around photo */}
                  <motion.div 
                    className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="text-sm font-semibold text-blue-600">3+ Years</span>
                  </motion.div>
                  <motion.div 
                    className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  >
                    <span className="text-sm font-semibold text-green-600">50+ Projects</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Skills Tags */}
            <motion.div 
              className="flex flex-wrap gap-3 justify-center lg:justify-start"
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
                  whileHover={{ 
                    scale: 1.1, 
                    y: -2,
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="cursor-pointer"
                >
                  <Badge 
                    variant="secondary" 
                    className={`
                      ${skill.color} ${skill.hoverColor} ${skill.borderColor}
                      text-white border-0 px-5 py-3 text-sm font-semibold 
                      transition-all duration-300 ease-out
                      backdrop-blur-sm rounded-full
                      transform-gpu will-change-transform
                      hover:-translate-y-1 hover:brightness-110
                      active:scale-95 active:translate-y-0
                      select-none touch-manipulation
                      skill-badge-glow float-animation
                      hover:animate-none
                    `}
                  >
                    <skill.icon className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                    {skill.name}
                  </Badge>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                  onClick={() => navigate('/projects')}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  See Projects
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                  onClick={() => window.open('/resume.pdf', '_blank')}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download CV
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-green-500 text-green-600 hover:bg-green-600 hover:text-white dark:border-green-400 dark:text-green-400 dark:hover:bg-green-600 dark:hover:text-white px-8 py-4 text-lg font-semibold transition-all duration-300"
                  onClick={() => navigate('/contact')}
                >
                  <Briefcase className="w-5 h-5 mr-2" />
                  Hire Me
                </Button>
              </motion.div>
            </motion.div>

            {/* Social Links */}
            <motion.div 
              className="flex gap-4 justify-center lg:justify-start"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.6, duration: 0.8 }}
            >
              {[
                { 
                  icon: Github, 
                  url: 'https://github.com/munir-ayub',
                  brandClass: 'github-hover',
                  label: 'GitHub'
                },
                { 
                  icon: Linkedin, 
                  url: 'https://linkedin.com/in/munir-ayub',
                  brandClass: 'linkedin-hover',
                  label: 'LinkedIn'
                },
                { 
                  icon: Mail, 
                  url: 'mailto:munir.ayub@example.com',
                  brandClass: 'email-hover',
                  label: 'Email'
                },
                { 
                  icon: FaWhatsapp, 
                  url: 'https://wa.me/251907806267',
                  brandClass: 'whatsapp-hover',
                  label: 'WhatsApp',
                  isReactIcon: true
                },
                { 
                  icon: FaTelegram, 
                  url: 'https://t.me/muay011',
                  brandClass: 'telegram-hover',
                  label: 'Telegram',
                  isReactIcon: true
                }
              ].map((social, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ 
                    scale: 1.15, 
                    rotate: [0, -10, 10, 0],
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`
                      p-4 rounded-full border border-neutral-300 dark:border-neutral-600
                      ${social.brandClass}
                      hover:text-white hover:border-transparent
                      transition-all duration-300 ease-out
                      hover:scale-110 active:scale-95
                      backdrop-blur-sm transform-gpu will-change-transform
                      group relative
                    `}
                    onClick={() => window.open(social.url, '_blank')}
                    title={social.label}
                  >
                    <social.icon className="w-5 h-5 transition-transform duration-300 hover:scale-110 social-icon-bounce" />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                      {social.label}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 justify-center"
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
      </BackgroundPaths>

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
    </div>
  );
}
