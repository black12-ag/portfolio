import { GlareCard } from '@/components/ui/glare-card';
import { Code, Smartphone, Palette, Globe, Database, Server, Cloud, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PortfolioGlareCards() {
  const skills = [
    {
      title: "Full Stack Development",
      description: "End-to-end web applications with modern frameworks and robust backend systems.",
      icon: Code,
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=1000&fit=crop&crop=center",
      technologies: ["React", "Node.js", "TypeScript", "PostgreSQL"]
    },
    {
      title: "Mobile App Development", 
      description: "Cross-platform mobile applications with native performance and beautiful UX.",
      icon: Smartphone,
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=1000&fit=crop&crop=center",
      technologies: ["React Native", "Flutter", "iOS", "Android"]
    },
    {
      title: "UI/UX Design",
      description: "User-centered design solutions that combine aesthetics with exceptional usability.",
      icon: Palette,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=1000&fit=crop&crop=center",
      technologies: ["Figma", "Adobe XD", "Tailwind", "Framer"]
    },
    {
      title: "Booking Systems",
      description: "Comprehensive reservation and booking platforms for hotels, services, and events.",
      icon: Globe,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=1000&fit=crop&crop=center",
      technologies: ["Stripe", "Calendar APIs", "Real-time", "Analytics"]
    },
    {
      title: "Database Architecture",
      description: "Scalable database design and optimization for high-performance applications.",
      icon: Database,
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=1000&fit=crop&crop=center",
      technologies: ["PostgreSQL", "MongoDB", "Redis", "Prisma"]
    },
    {
      title: "Cloud Infrastructure",
      description: "Modern cloud deployments with CI/CD pipelines and scalable architecture.",
      icon: Cloud,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=1000&fit=crop&crop=center",
      technologies: ["AWS", "Docker", "Kubernetes", "Vercel"]
    }
  ];

  return (
    <section className="py-20 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
            My Expertise
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Specialized skills and technologies I use to create exceptional digital solutions
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <GlareCard className="flex flex-col items-start justify-between p-6 relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={skill.image}
                    alt={skill.title}
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-slate-950/40" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  {/* Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <skill.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">
                      {skill.title}
                    </h3>
                    <p className="text-neutral-200 text-sm leading-relaxed mb-6">
                      {skill.description}
                    </p>
                  </div>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2">
                    {skill.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-white/10 backdrop-blur-sm rounded text-xs text-white border border-white/20"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </GlareCard>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-neutral-600 dark:text-neutral-300 mb-4">
            Ready to bring your ideas to life?
          </p>
          <motion.button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
          >
            Let's Work Together
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
