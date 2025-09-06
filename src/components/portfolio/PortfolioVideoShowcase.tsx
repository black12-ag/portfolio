import { VideoPlayer } from '@/components/ui/video-thumbnail-player';
import { motion } from 'framer-motion';

export default function PortfolioVideoShowcase() {
  const projectVideos = [
    {
      title: "Hotel Booking System",
      description: "Complete hotel reservation platform with real-time availability, payment integration, and admin dashboard.",
      thumbnailUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["React", "Node.js", "MongoDB", "Stripe"]
    },
    {
      title: "E-Commerce Platform",
      description: "Full-stack e-commerce solution with product management, shopping cart, and secure payment processing.",
      thumbnailUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["React", "TypeScript", "PostgreSQL", "Tailwind"]
    },
    {
      title: "Mobile Fitness App",
      description: "React Native fitness tracking app with workout plans, progress tracking, and social features.",
      thumbnailUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["React Native", "Firebase", "TypeScript", "Expo"]
    },
    {
      title: "Real Estate Dashboard",
      description: "Property management dashboard with analytics, listings management, and client communication tools.",
      thumbnailUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["Next.js", "Prisma", "Chart.js", "AWS"]
    },
    {
      title: "Task Management System",
      description: "Collaborative project management tool with team features, time tracking, and progress analytics.",
      thumbnailUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["Vue.js", "Express", "Socket.io", "Redis"]
    },
    {
      title: "AI Chat Interface",
      description: "Modern chat application with AI integration, real-time messaging, and smart suggestions.",
      thumbnailUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&crop=center",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1", // Replace with your actual video URL
      tags: ["React", "OpenAI", "WebSocket", "Python"]
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-neutral-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
            Project Demos
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Watch live demonstrations of my projects in action. See the features, functionality, and user experience firsthand.
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectVideos.map((video, index) => (
            <motion.div
              key={video.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <VideoPlayer
                thumbnailUrl={video.thumbnailUrl}
                videoUrl={video.videoUrl}
                title={video.title}
                description={video.description}
                className="mb-4 transform transition-all duration-300 group-hover:-translate-y-2"
                aspectRatio="16/9"
              />
              
              {/* Technology Tags */}
              <div className="flex flex-wrap gap-2 justify-center">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full border border-neutral-200 dark:border-neutral-700 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-200 dark:hover:border-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
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
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-2xl p-8 border border-blue-100 dark:border-blue-900/30">
            <h3 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
              Want to see more?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-2xl mx-auto">
              These are just a few examples of my work. I'd love to discuss your project and show you how I can help bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/contact'}
              >
                Get In Touch
              </motion.button>
              <motion.button
                className="border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/portfolio'}
              >
                View All Projects
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
