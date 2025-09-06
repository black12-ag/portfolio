import React from 'react';
import { motion } from 'framer-motion';
import { 
  AnimatedBackground, 
  TypewriterEffect, 
  FadeInView 
} from '../animations';
import StaticElement from '../animations/StaticElement';

const EnhancedPortfolioDemo: React.FC = () => {
  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '25+', label: 'Happy Clients' },
    { number: '3+', label: 'Years Experience' },
    { number: '24/7', label: 'Support Available' },
  ];

  const skills = [
    'Full Stack Development',
    'Mobile Apps',
    'UI/UX Design',
    'Booking Systems'
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Background */}
      <AnimatedBackground 
        variant="waves" 
        intensity="medium"
        colors={['#3B82F6', '#8B5CF6', '#06D6A0']}
      />
      
      {/* Hero Section */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center text-white">
          
          {/* Profile Circle */}
          <FadeInView direction="down" delay={0.2}>
            <StaticElement direction="scale" delay={0.2}>
              <div className="mx-auto mb-8 w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-2xl font-bold animate-static-glow">
                M
              </div>
            </StaticElement>
          </FadeInView>

          {/* Name with Typewriter */}
          <FadeInView direction="up" delay={0.4}>
            <h1 className="text-4xl md:text-7xl font-bold mb-6">
              Hi, I'm{' '}
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                <TypewriterEffect 
                  text="Munir Ayub" 
                  speed={100}
                  delay={800}
                />
              </span>
            </h1>
          </FadeInView>

          {/* Subtitle */}
          <FadeInView direction="up" delay={0.6}>
            <StaticElement direction="up" delay={0.6}>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                Full Stack Developer & Digital Solutions Expert
              </p>
            </StaticElement>
          </FadeInView>

          {/* Description */}
          <FadeInView direction="up" delay={0.8}>
            <p className="text-lg text-gray-400 mb-12 max-w-4xl mx-auto leading-relaxed">
              I create comprehensive digital solutions including web applications, mobile apps,
              desktop software, and automation tools. From e-commerce platforms to booking
              systems, I transform complex business requirements into elegant, scalable solutions.
            </p>
          </FadeInView>

          {/* Animated Skill Badges */}
          <FadeInView direction="up" delay={1.0}>
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {skills.map((skill, index) => (
                <StaticElement key={skill} delay={1.0 + index * 0.1} direction="scale">
                  <motion.span 
                    className="px-6 py-3 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 hover-only-glow hover-only-lift cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {skill}
                  </motion.span>
                </StaticElement>
              ))}
            </div>
          </FadeInView>

          {/* Action Buttons */}
          <FadeInView direction="up" delay={1.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <motion.button
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all animate-static-glow hover-only-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center justify-center gap-2">
                  👨‍💻 View My Work
                </span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold transition-all hover-only-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center justify-center gap-2">
                  📧 Get In Touch
                </span>
              </motion.button>
              
              <motion.button
                className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-all hover-only-lift"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center justify-center gap-2">
                  📄 Download CV
                </span>
              </motion.button>
            </div>
          </FadeInView>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <FadeInView 
                key={stat.label}
                direction="up" 
                delay={1.4 + index * 0.2}
              >
                <StaticElement delay={1.4 + index * 0.2} direction="up">
                  <motion.div 
                    className="text-center hover-only-lift cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl md:text-4xl font-bold text-blue-400 animate-static-glow mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 text-sm md:text-base">
                      {stat.label}
                    </div>
                  </motion.div>
                </StaticElement>
              </FadeInView>
            ))}
          </div>
        </div>
      </div>

      {/* Social Links - Bottom */}
      <FadeInView direction="up" delay={2.0}>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex gap-6">
            {['GitHub', 'LinkedIn', 'Email'].map((social, index) => (
              <StaticElement key={social} delay={2.0 + index * 0.1} direction="up">
                <motion.div
                  className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover-only-glow cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-white text-xl">
                    {social === 'GitHub' ? '⚡' : social === 'LinkedIn' ? '💼' : '📧'}
                  </span>
                </motion.div>
              </StaticElement>
            ))}
          </div>
        </div>
      </FadeInView>
    </div>
  );
};

export default EnhancedPortfolioDemo;
