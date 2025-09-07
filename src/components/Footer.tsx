import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Linkedin, Mail, MessageSquare, Phone, Heart, Code, ExternalLink, Settings } from 'lucide-react';
import { FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string>('/images/profile-photo.jpg');

  // Load profile photo from localStorage
  useEffect(() => {
    const loadProfilePhoto = () => {
      const storedPhoto = localStorage.getItem('profile_photo');
      if (storedPhoto) {
        setProfilePhoto(storedPhoto);
      }
    };

    loadProfilePhoto();

    // Listen for profile photo updates
    const handleProfilePhotoUpdate = (event: CustomEvent) => {
      setProfilePhoto(event.detail);
    };

    window.addEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);

    return () => {
      window.removeEventListener('profilePhotoUpdated', handleProfilePhotoUpdate as EventListener);
    };
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Admin', href: '/admin', icon: Settings },
  ];

  const skills = [
    'React & TypeScript',
    'Node.js & Express',
    'React Native',
    'UI/UX Design',
    'Full Stack Development',
    'Mobile Development'
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/black12-ag', label: 'GitHub' },
    { icon: FaWhatsapp, href: 'https://wa.me/251907806267', label: 'WhatsApp', isComponent: true },
    { icon: FaTelegram, href: 'https://t.me/muay011', label: 'Telegram', isComponent: true },
    { icon: FaXTwitter, href: 'https://x.com/muay01111', label: 'X (Twitter)', isComponent: true },
    { icon: Mail, href: 'mailto:munir.ayub@example.com', label: 'Email' },
  ];

  return (
    <footer className="bg-card dark:bg-gray-900 text-card-foreground dark:text-gray-200 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* About Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <img 
                    src="/images/logo.jpeg" 
                    alt="Munir Ayub Logo" 
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-2xl font-bold text-foreground dark:text-white">Munir Ayub</span>
                </div>
                <p className="text-card-foreground/80 dark:text-gray-300 text-lg leading-relaxed">
                  Full Stack Developer passionate about creating beautiful, functional web and mobile applications.
                  Let's build something amazing together.
                </p>
              </div>
              
              {/* Profile Photo with Animation */}
              <div className="mt-6">
                <div className="relative w-32 h-32 mx-auto lg:mx-0 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <img 
                    src={profilePhoto} 
                    alt="Munir Ayub" 
                    className="relative w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl transform transition-transform group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://ui-avatars.com/api/?name=Munir+Ayub&size=200&background=3b82f6&color=ffffff&format=svg';
                    }}
                  />
                </div>
              </div>

              {/* Newsletter */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground dark:text-white">Stay in Touch</h3>
                <p className="text-card-foreground/80 dark:text-gray-300 mb-4">
                  Get updates on new projects and development insights.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
                      return;
                    }
                    // Simulate newsletter signup
                    setEmail('');
                    toast({ title: 'Subscribed', description: 'Thanks! You are now subscribed to updates.' });
                  }}
                  className="flex space-x-2"
                >
                  <Input 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border text-foreground dark:text-white dark:bg-gray-800 placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                    aria-label="Email address"
                  />
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6">
                    Subscribe
                  </Button>
                </form>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-foreground dark:text-white">Navigation</h3>
                <ul className="space-y-3">
                  {navItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-card-foreground/80 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200 text-sm flex items-center space-x-2 group"
                      >
                        <span className="w-1.5 h-1.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                        {item.icon && <item.icon className="w-3 h-3" />}
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-xl font-semibold mb-6 text-foreground dark:text-white">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-xs rounded-full border border-primary/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact & Social */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-6 text-foreground dark:text-white">Let's Connect</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-card-foreground/80 dark:text-gray-300">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href="https://wa.me/251907806267" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      +251 907 806 267 (WhatsApp)
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-card-foreground/80 dark:text-gray-300">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <a href="https://t.me/muay011" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                      @muay011 (Telegram)
                    </a>
                  </div>
                  <div className="flex items-center space-x-3 text-card-foreground/80 dark:text-gray-300">
                    <Code className="h-5 w-5 text-primary" />
                    <span>Available for freelance projects</span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h4 className="font-semibold text-lg mb-4 text-foreground dark:text-white">Follow Me</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <Button
                        key={social.label}
                        variant="outline"
                        size="sm"
                        className="h-10 w-10 p-0 border-border dark:border-gray-700 text-foreground dark:text-gray-200 hover:text-primary hover:border-primary hover:bg-primary/10"
                        onClick={() => window.open(social.href, '_blank')}
                        aria-label={social.label}
                        title={social.label}
                      >
                        {social.isComponent ? (
                          <Icon className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 dark:from-blue-500/20 dark:to-purple-600/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center space-x-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500" />
                  <h4 className="font-semibold text-foreground dark:text-white">Like my work?</h4>
                </div>
                <p className="text-sm text-card-foreground/80 dark:text-gray-300 mb-4">
                  I'm always excited to work on new projects and collaborate with amazing people.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={() => window.open('https://wa.me/message/XAPGDNH6M4HGB1', '_blank')}
                >
                  <FaWhatsapp className="w-5 h-5 mr-2" />
                  Get In Touch on WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-card-foreground/80 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} Munir Ayub. All rights reserved.
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-card-foreground/60 dark:text-gray-500">Built with</span>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3 text-red-500" />
                <span className="text-card-foreground/80 dark:text-gray-300">and React</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}