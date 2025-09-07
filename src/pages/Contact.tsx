import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Clock,
  Globe,
  Github,
  Linkedin,
  Twitter,
  MessageSquare,
  CheckCircle,
  Zap,
  Heart,
  Coffee,
  Calendar,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { FaTelegram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';

interface ContactForm {
  name: string;
  email: string;
  message: string;
  projectType?: string;
  budget?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: '',
    projectType: '',
    budget: ''
  });

  const contactInfo = [
    {
      icon: FaWhatsapp,
      label: 'WhatsApp Business',
      value: '+251 907 806 267',
      href: 'https://wa.me/message/XAPGDNH6M4HGB1',
      description: 'Quick chat via WhatsApp Business',
      isComponent: true,
      primary: true
    },
    {
      icon: FaTelegram,
      label: 'Telegram',
      value: '@muay011',
      href: 'https://t.me/muay011',
      description: 'Message me on Telegram',
      isComponent: true
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'munir.ayub@example.com',
      href: 'mailto:munir.ayub@example.com',
      description: 'Send me an email anytime'
    },
    {
      icon: Clock,
      label: 'Response Time',
      value: '< 24 hours',
      href: null,
      description: 'I respond to all inquiries quickly'
    }
  ];

  const socialLinks = [
    { 
      icon: Github, 
      label: 'GitHub', 
      href: 'https://github.com/black12-ag',
      username: '@black12-ag',
      description: 'Check out my code'
    },
    { 
      icon: Linkedin, 
      label: 'LinkedIn', 
      href: 'https://linkedin.com/in/munir-ayub',
      username: '/in/munir-ayub',
      description: 'Professional network'
    },
    { 
      icon: Twitter, 
      label: 'Twitter/X', 
      href: 'https://x.com/muay01111',
      username: '@muay01111',
      description: 'Follow for updates'
    }
  ];

  const projectTypes = [
    'Web Application',
    'Mobile App',
    'E-commerce Platform',
    'Booking System',
    'Dashboard/Admin Panel',
    'API Development',
    'UI/UX Design',
    'Consulting',
    'Other'
  ];

  const budgetRanges = [
    'Under $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000+',
    'Hourly Rate',
    'Let\'s Discuss'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Message Sent Successfully!',
        description: 'Thank you for reaching out. I\'ll get back to you within 24 hours.',
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        message: '',
        projectType: '',
        budget: ''
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 via-purple-50 to-slate-100 dark:from-gray-900 via-gray-850 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Let's Work Together
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Have a project in mind? I'd love to hear about it. Let's discuss how we can bring your ideas to life.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Badge className="bg-green-500 text-white px-4 py-2">
                <CheckCircle className="w-4 h-4 mr-2" />
                Available for Projects
              </Badge>
              <Badge className="bg-blue-500 text-white px-4 py-2">
                <Zap className="w-4 h-4 mr-2" />
                Quick Response
              </Badge>
              <Badge className="bg-purple-500 text-white px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                Dedicated Support
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Quick Contact Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp Contact */}
              <Card className="border-2 border-green-200 dark:border-green-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => window.open('https://wa.me/message/XAPGDNH6M4HGB1', '_blank')}>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaWhatsapp className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">WhatsApp Business</h3>
                  <p className="text-green-700 dark:text-green-300 font-medium mb-2">+251 907 806 267</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Quick response • Business hours • File sharing
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <FaWhatsapp className="w-4 h-4 mr-2" />
                    Chat Now
                  </Button>
                </CardContent>
              </Card>
              
              {/* Telegram Contact */}
              <Card className="border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    onClick={() => window.open('https://t.me/muay011', '_blank')}>
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaTelegram className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Telegram</h3>
                  <p className="text-blue-700 dark:text-blue-300 font-medium mb-2">@muay011</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                    Instant messaging • 24/7 availability • Secure
                  </p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <FaTelegram className="w-4 h-4 mr-2" />
                    Message Me
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <Card className="border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-6 h-6 text-blue-600" />
                    Send Direct Message
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Fill out this simple form and I'll get back to you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Core Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Name *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="h-12 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell me about your project, goals, timeline, budget, and any specific requirements..."
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="min-h-[140px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                        required
                      />
                    </div>

                    {/* Optional Project Details - Collapsible */}
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        <span className="inline-flex items-center gap-2">
                          <span>Project Details (Optional)</span>
                          <span className="text-xs text-gray-500 group-open:hidden">Click to expand</span>
                        </span>
                      </summary>
                      <div className="mt-4 space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Project Type
                            </label>
                            <select
                              id="projectType"
                              value={formData.projectType}
                              onChange={(e) => handleInputChange('projectType', e.target.value)}
                              className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select project type</option>
                              {projectTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Budget Range
                            </label>
                            <select
                              id="budget"
                              value={formData.budget}
                              onChange={(e) => handleInputChange('budget', e.target.value)}
                              className="w-full h-12 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select budget range</option>
                              {budgetRanges.map((budget) => (
                                <option key={budget} value={budget}>{budget}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </details>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all duration-300 hover:shadow-lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      I'll respond within 24 hours • All information is confidential
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Alternative Contact Methods */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Other Ways to Reach Me</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose your preferred communication method.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => {
                    const Icon = info.icon;
                    return (
                      <div key={index} className={`flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border ${info.primary ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600'}`}>
                        <div className={`p-3 ${info.primary ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'} rounded-lg`}>
                          {info.isComponent ? (
                            <Icon className={`w-6 h-6 ${info.primary ? 'text-green-600' : 'text-blue-600'}`} />
                          ) : (
                            <Icon className={`w-6 h-6 ${info.primary ? 'text-green-600' : 'text-blue-600'}`} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{info.label}</p>
                          {info.href ? (
                            <a 
                              href={info.href}
                              className={`${info.primary ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'} transition-colors font-medium`}
                              target={info.href.startsWith('http') ? '_blank' : undefined}
                              rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            >
                              {info.value}
                            </a>
                          ) : (
                            <span className="text-gray-700 dark:text-gray-300 font-medium">{info.value}</span>
                          )}
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{info.description}</p>
                        </div>
                        {info.href && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(info.href!, '_blank')}
                            className={`${info.primary ? 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-400' : 'border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-400'}`}
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Open
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* WhatsApp QR Code */}
              <Card className="border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Quick Connect via WhatsApp
                  </CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Scan the QR code to start chatting instantly!
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <img 
                      src="/images/whatsapp-qr.png" 
                      alt="WhatsApp QR Code" 
                      className="w-48 h-48 object-contain"
                      onError={(e) => {
                        // If QR image doesn't exist, show placeholder
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const placeholder = document.getElementById('qr-placeholder');
                        if (placeholder) placeholder.style.display = 'flex';
                      }}
                    />
                    <div 
                      id="qr-placeholder" 
                      className="w-48 h-48 hidden flex-col items-center justify-center bg-gray-100 rounded-lg"
                      style={{ display: 'none' }}
                    >
                      <QrCode className="w-16 h-16 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">QR Code<br/>Coming Soon</p>
                    </div>
                  </div>
                  <Button
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open('https://wa.me/message/XAPGDNH6M4HGB1', '_blank')}
                  >
                    <FaWhatsapp className="w-5 h-5 mr-2" />
                    Open WhatsApp Business
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Or click the button to open WhatsApp directly
                  </p>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Follow Me</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect with me on social media for updates and insights.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialLinks.map((social, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <social.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{social.label}</p>
                        <a 
                          href={social.href}
                          className="text-blue-600 hover:text-blue-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {social.username}
                        </a>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{social.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(social.href, '_blank')}
                        className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        Visit
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Availability */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-900 dark:text-white font-medium">Currently Available</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      I'm accepting new projects and collaborations. Typical project start time is 1-2 weeks.
                    </p>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900 dark:text-blue-300">Free Consultation</span>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        I offer a free 30-minute consultation to discuss your project requirements and provide initial recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">What's your typical project timeline?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Project timelines vary based on complexity, but most web applications take 4-8 weeks, while mobile apps take 6-12 weeks. 
                    I provide detailed timelines during our initial consultation.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Do you work with existing teams?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Absolutely! I can integrate with your existing development team or work independently. 
                    I'm experienced with various collaboration tools and methodologies.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">What technologies do you specialize in?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    I specialize in React, TypeScript, Node.js, and modern web technologies. For mobile development, 
                    I use React Native and Flutter. I'm also experienced with cloud platforms like AWS.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Do you provide ongoing support?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Yes! I offer maintenance and support packages to keep your applications running smoothly. 
                    This includes bug fixes, updates, and feature enhancements.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 via-purple-600 to-slate-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <Coffee className="w-16 h-16 mx-auto mb-6 text-white/80" />
          <h2 className="text-3xl font-bold mb-4">Ready to Start Something Great?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you need a quick consultation or want to start a full project, I'm here to help.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Start the Conversation
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
