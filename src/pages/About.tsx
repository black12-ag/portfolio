import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Mail, 
  Phone, 
  Globe,
  Download,
  Award,
  BookOpen,
  Briefcase,
  Code2,
  GraduationCap,
  Heart,
  Coffee,
  Zap,
  Users,
  Star,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Experience data
const experience = [
  {
    id: '1',
    title: 'Senior Full Stack Developer',
    company: 'Freelance',
    location: 'Remote',
    period: '2022 - Present',
    description: 'Building custom web and mobile applications for clients worldwide. Specializing in React, Node.js, and modern web technologies.',
    achievements: [
      'Delivered 50+ successful projects',
      'Maintained 100% client satisfaction rate',
      'Reduced client development costs by 30% on average',
      'Built scalable applications serving 10,000+ users'
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'PostgreSQL', 'AWS']
  },
  {
    id: '2',
    title: 'Full Stack Developer',
    company: 'Tech Solutions Inc.',
    location: 'New York, NY',
    period: '2021 - 2022',
    description: 'Developed and maintained web applications for enterprise clients. Collaborated with cross-functional teams to deliver high-quality software solutions.',
    achievements: [
      'Led development of 3 major client projects',
      'Improved application performance by 40%',
      'Mentored 2 junior developers',
      'Implemented CI/CD pipelines reducing deployment time by 60%'
    ],
    technologies: ['React', 'Vue.js', 'Express', 'MySQL', 'Docker', 'Jenkins']
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'StartupX',
    location: 'San Francisco, CA',
    period: '2020 - 2021',
    description: 'Built responsive user interfaces and implemented modern frontend architectures. Worked closely with designers to create pixel-perfect implementations.',
    achievements: [
      'Increased user engagement by 25%',
      'Reduced page load times by 50%',
      'Implemented design system used across 5 products',
      'Led frontend architecture migration to TypeScript'
    ],
    technologies: ['React', 'TypeScript', 'Sass', 'Redux', 'Jest', 'Webpack']
  }
];

// Education data
const education = [
  {
    id: '1',
    degree: 'Bachelor of Science in Computer Science',
    institution: 'University of Technology',
    location: 'California, USA',
    period: '2016 - 2020',
    gpa: '3.8/4.0',
    description: 'Focused on software engineering, algorithms, and database systems. Graduated Magna Cum Laude.',
    courses: [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Software Engineering',
      'Web Development',
      'Mobile App Development',
      'Computer Networks'
    ]
  },
  {
    id: '2',
    degree: 'Full Stack Web Development Bootcamp',
    institution: 'Code Academy Pro',
    location: 'Online',
    period: '2020',
    description: 'Intensive 6-month program covering modern web development technologies and practices.',
    courses: [
      'React & Redux',
      'Node.js & Express',
      'MongoDB & PostgreSQL',
      'REST APIs & GraphQL',
      'DevOps & Deployment',
      'Testing & Quality Assurance'
    ]
  }
];

// Certifications
const certifications = [
  { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' },
  { name: 'React Developer Certification', issuer: 'Meta', year: '2022' },
  { name: 'Node.js Application Developer', issuer: 'OpenJS Foundation', year: '2022' },
  { name: 'Google Analytics Certified', issuer: 'Google', year: '2021' }
];

// Skills categories
const skillCategories = [
  {
    category: 'Frontend',
    skills: [
      { name: 'React/Next.js', level: 95 },
      { name: 'TypeScript', level: 90 },
      { name: 'Vue.js', level: 85 },
      { name: 'HTML/CSS', level: 95 },
      { name: 'Tailwind CSS', level: 90 }
    ]
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Node.js', level: 90 },
      { name: 'Express.js', level: 85 },
      { name: 'Python', level: 75 },
      { name: 'REST APIs', level: 90 },
      { name: 'GraphQL', level: 70 }
    ]
  },
  {
    category: 'Database',
    skills: [
      { name: 'PostgreSQL', level: 85 },
      { name: 'MongoDB', level: 80 },
      { name: 'MySQL', level: 75 },
      { name: 'Redis', level: 70 },
      { name: 'Prisma ORM', level: 80 }
    ]
  },
  {
    category: 'Mobile & Others',
    skills: [
      { name: 'React Native', level: 80 },
      { name: 'Flutter', level: 65 },
      { name: 'AWS/Cloud', level: 75 },
      { name: 'Docker', level: 70 },
      { name: 'Git/GitHub', level: 95 }
    ]
  }
];

export default function About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  const personalInfo = {
    name: 'Munir Ayub',
    title: 'Full Stack Developer & Digital Solutions Expert',
    location: 'San Francisco, CA',
    email: 'munir.ayub@example.com',
    phone: '+1 (555) 123-4567',
    website: 'https://munir-ayub.dev',
    yearsOfExperience: 3,
    projectsCompleted: 50,
    happyClients: 25
  };

  const tabs = [
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code2 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-1">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600">M</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              About {personalInfo.name}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              {personalInfo.title}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin className="w-4 h-4" />
                <span>{personalInfo.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>{personalInfo.yearsOfExperience}+ years experience</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Award className="w-4 h-4" />
                <span>{personalInfo.projectsCompleted}+ projects completed</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/contact')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => window.open('/resume.pdf', '_blank')}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Resume
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Personal Story */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">My Story</h2>
            <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
              <p className="mb-6">
                I'm a passionate full-stack developer with over 3 years of experience creating digital solutions 
                that make a real impact. My journey began with a Computer Science degree, but my love for coding 
                and problem-solving drives me to continuously learn and adapt to new technologies.
              </p>
              <p className="mb-6">
                I specialize in building comprehensive web applications, mobile apps, and automation tools. 
                From e-commerce platforms to booking systems, I enjoy transforming complex business requirements 
                into elegant, scalable solutions that users love.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to open-source projects, 
                or sharing knowledge with the developer community. I believe in continuous learning and staying 
                ahead of industry trends to deliver the best possible solutions for my clients.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">{personalInfo.yearsOfExperience}+</div>
              <div className="text-gray-700 dark:text-gray-300">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">{personalInfo.projectsCompleted}+</div>
              <div className="text-gray-700 dark:text-gray-300">Projects Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">{personalInfo.happyClients}+</div>
              <div className="text-gray-700 dark:text-gray-300">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">100%</div>
              <div className="text-gray-700 dark:text-gray-300">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Sections */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-12">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Tab */}
            {activeTab === 'experience' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Professional Experience</h3>
                {experience.map((exp) => (
                  <Card key={exp.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{exp.title}</h4>
                          <p className="text-lg text-blue-600 font-medium">{exp.company}</p>
                          <p className="text-gray-600 dark:text-gray-400">{exp.location}</p>
                        </div>
                        <Badge variant="outline" className="mt-2 md:mt-0 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          {exp.period}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{exp.description}</p>
                      
                      {/* Achievements */}
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Key Achievements:</h5>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                              <Star className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Technologies */}
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Technologies Used:</h5>
                        <div className="flex flex-wrap gap-2">
                          {exp.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Education Tab */}
            {activeTab === 'education' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Education & Learning</h3>
                {education.map((edu) => (
                  <Card key={edu.id} className="border border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{edu.degree}</h4>
                          <p className="text-lg text-blue-600 font-medium">{edu.institution}</p>
                          <p className="text-gray-600 dark:text-gray-400">{edu.location}</p>
                          {edu.gpa && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">GPA: {edu.gpa}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2 md:mt-0 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600">
                          <Calendar className="w-3 h-3 mr-1" />
                          {edu.period}
                        </Badge>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{edu.description}</p>
                      
                      {/* Relevant Courses */}
                      <div>
                        <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Relevant Courses:</h5>
                        <div className="flex flex-wrap gap-2">
                          {edu.courses.map((course, index) => (
                            <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {course}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Certifications */}
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Certifications</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certifications.map((cert, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Award className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{cert.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{cert.issuer} • {cert.year}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === 'skills' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">Technical Skills</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {skillCategories.map((category, index) => (
                    <Card key={index} className="border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-6">
                        <h4 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">{category.category}</h4>
                        <div className="space-y-4">
                          {category.skills.map((skill, skillIndex) => (
                            <div key={skillIndex} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-900 dark:text-white">{skill.name}</span>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{skill.level}%</span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${skill.level}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personal Interests */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Beyond Coding</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Coffee className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Coffee Enthusiast</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  I believe the best code is written with great coffee. Always exploring new brewing methods and coffee origins.
                </p>
              </div>
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Continuous Learner</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Always learning new technologies and frameworks. Currently exploring AI/ML and Web3 development.
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Community Builder</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Active in developer communities, mentoring junior developers, and contributing to open-source projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            I'm always excited to take on new challenges and help bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/contact')}
            >
              <Mail className="w-5 h-5 mr-2" />
              Contact Me
            </Button>
            <Button 
              size="lg" 
              className="bg-white/10 backdrop-blur-sm border-2 border-white/50 text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              onClick={() => navigate('/portfolio')}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View My Work
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
