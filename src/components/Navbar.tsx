import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sun, Moon, Github, Linkedin, Mail, Code, User, FileText, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className }: NavbarProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { name: 'Home', href: '/', icon: User },
    { name: 'Projects', href: '/projects', icon: Code },
    { name: 'Services', href: '/services', icon: Cog },
    { name: 'About', href: '/about', icon: User },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const socialLinks = [
    { icon: Github, href: 'https://github.com/munir-ayub', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/in/munir-ayub', label: 'LinkedIn' },
    { icon: Mail, href: 'mailto:munir.ayub@example.com', label: 'Email' },
  ];

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50",
      "transition-all duration-300",
      className
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-foreground dark:text-white group-hover:text-primary transition-colors">
              Munir Ayub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-all duration-200 relative group",
                    isActiveRoute(item.href)
                      ? "text-primary dark:text-primary"
                      : "text-foreground dark:text-gray-200 hover:text-primary dark:hover:text-primary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  {isActiveRoute(item.href) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full" />
                  )}
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Social Links */}
            <div className="flex items-center space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.label}
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-foreground dark:text-gray-200 hover:text-primary hover:bg-primary/10"
                    onClick={() => window.open(social.href, '_blank')}
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0 text-foreground dark:text-gray-200 hover:text-primary hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Download CV Button */}
            <Button
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
onClick={() => window.open(`${import.meta.env.BASE_URL}resume.pdf`, '_blank')}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download CV
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="h-9 w-9 p-0 text-foreground dark:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-foreground dark:text-gray-200">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">M</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg text-foreground">Munir Ayub</p>
                      <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <div className="space-y-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                            isActiveRoute(item.href)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted hover:text-primary"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Mobile Social Links */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground px-4">Connect</p>
                    <div className="flex items-center justify-center space-x-4">
                      {socialLinks.map((social) => {
                        const Icon = social.icon;
                        return (
                          <Button
                            key={social.label}
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => {
                              window.open(social.href, '_blank');
                              setIsOpen(false);
                            }}
                            aria-label={social.label}
                          >
                            <Icon className="h-4 w-4" />
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Download CV */}
                  <div className="pt-4 border-t border-border">
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      onClick={() => {
window.open(`${import.meta.env.BASE_URL}resume.pdf`, '_blank');
                        setIsOpen(false);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Download CV
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
