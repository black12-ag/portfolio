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
  Calendar
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType: string;
  budget: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    projectType: '',
    budget: ''
  });

  const contactInfo = [
    {
      icon: Mail,
      label: 'Email',
      value: 'munir.ayub@example.com',
      href: 'mailto:munir.ayub@example.com',
      description: 'Send me an email anytime'
    },
    {
      icon: Phone,
      label: 'WhatsApp',
      value: '+251 907 806 267',
      href: 'https://wa.me/251907806267',
      description: 'Chat with me on WhatsApp'
    },
    {
      icon: MessageSquare,
      label: 'Telegram',
      value: '@muay011',
      href: 'https://t.me/muay011',
      description: 'Message me on Telegram'
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
        subject: '',
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
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
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

      {/* Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Contact Form */}
            <div>
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900 dark:text-white">Send Me a Message</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    Fill out the form below and I'll get back to you as soon as possible.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name *
                        </label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email *
                        </label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="projectType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Project Type
                        </label>
                        <select
                          id="projectType"
                          value={formData.projectType}
                          onChange={(e) => handleInputChange('projectType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select project type</option>
                          {projectTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Budget Range
                        </label>
                        <select
                          id="budget"
                          value={formData.budget}
                          onChange={(e) => handleInputChange('budget', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select budget range</option>
                          {budgetRanges.map((budget) => (
                            <option key={budget} value={budget}>{budget}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell me about your project, goals, and any specific requirements..."
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className="min-h-[120px] bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              
              {/* Contact Details */}
              <Card className="border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 dark:text-white">Get In Touch</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300">
                    I'm always excited to discuss new projects and opportunities.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <info.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">{info.label}</p>
                        {info.href ? (
                          <a 
                            href={info.href}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            target={info.href.startsWith('http') ? '_blank' : undefined}
                            rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {info.value}
                          </a>
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">{info.value}</span>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">{info.description}</p>
                      </div>
                    </div>
                  ))}
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
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
