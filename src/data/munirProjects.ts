import { Project } from '@/components/portfolio/ProjectCard';

// MunirChat Portfolio Projects
export const munirProjects: Project[] = [
  {
    id: 'munirchat-ios',
    title: 'MunirChat for iOS',
    description: 'Secure messaging app for iPhone & iPad with end-to-end encryption, voice/video calling, and media sharing.',
    longDescription: 'A fully-featured encrypted messaging application built with Swift and optimized for iOS 14+. Features include end-to-end encryption, voice and video calls, group chats up to 1000 members, media sharing with compression, dark mode support, and 6 custom icon themes. The app follows iOS Human Interface Guidelines and uses modern Swift patterns.',
    image: '/images/projects/munirchat-ios.png',
    images: [
      '/images/projects/munirchat-ios-1.png',
      '/images/projects/munirchat-ios-2.png',
      '/images/projects/munirchat-ios-3.png'
    ],
    technologies: ['Swift', 'UIKit', 'SwiftUI', 'Core Data', 'WebRTC', 'iOS', 'Xcode'],
    category: 'mobile',
    liveUrl: 'https://testflight.apple.com/join/DEMO_CODE',
    githubUrl: 'https://github.com/munir/munirchat-ios-portfolio',
    featured: true,
    completedDate: 'Sep 2024',
    client: 'Personal Project',
    downloadOptions: {
      appStore: 'https://testflight.apple.com/join/MUNIRCHAT_IOS',
      testFlight: 'https://testflight.apple.com/join/MUNIRCHAT_IOS',
      qrCode: '/images/projects/munirchat-ios-qr.png',
      minRequirements: 'iOS 14.0+',
      size: '24.7 MB',
      latestVersion: '2.1.0',
      telegramBot: '@MunirChatBot',
      telegramCommand: '/get_ios_app',
      platform: 'iOS'
    },
    keyFeatures: [
      'End-to-end encrypted messaging',
      'Voice & video calls with WebRTC',
      'Group chats up to 1000 members',
      'Media sharing with automatic compression',
      'TestFlight beta access available',
      '255 custom app icons',
      'Apple Watch support',
      'Download via Telegram bot (@MunirChatBot)',
      'Push notifications with rich media'
    ],
    status: 'completed',
    testimonial: {
      text: 'The iOS portfolio app perfectly demonstrates expertise in Swift and iOS Human Interface Guidelines. Exceptional attention to detail!',
      author: 'iOS Developer Community',
      rating: 5
    }
  },
  {
    id: 'munirchat-android',
    title: 'MunirChat for Android',
    description: 'Native Android messaging app with Material Design 3, adaptive icons, and optimized performance.',
    longDescription: 'Native Android implementation supporting Android 6.0+ with Material You dynamic theming, adaptive icon support, background message sync, and multi-device support. Built with Kotlin and Java using modern Android architecture patterns. Features 8 specialized modules for enhanced functionality and maintainability.',
    image: '/images/projects/munirchat-android.png',
    images: [
      '/images/projects/munirchat-android-1.png',
      '/images/projects/munirchat-android-2.png',
      '/images/projects/munirchat-android-3.png'
    ],
    technologies: ['Kotlin', 'Java', 'Android', 'Jetpack Compose', 'Room DB', 'Dagger/Hilt', 'Material Design 3'],
    category: 'mobile',
    liveUrl: 'https://play.google.com/apps/testing/com.munirchat.portfolio',
    githubUrl: 'https://github.com/munir/munirchat-android-portfolio',
    featured: true,
    completedDate: 'Sep 2024',
    client: 'Personal Project',
    downloadOptions: {
      googlePlay: 'https://play.google.com/apps/testing/com.munirchat.portfolio',
      directApk: 'https://munirchat.org/downloads/portfolio-demo.apk',
      qrCode: '/images/projects/munirchat-android-qr.png',
      minRequirements: 'Android 6.0+ (API 24)',
      size: '8.2 MB',
      latestVersion: '1.0.0',
      telegramBot: '@MunirChatBot',
      telegramCommand: '/get_android_app'
    },
    keyFeatures: [
      'Material You dynamic theming',
      'Adaptive icon support for Android 8.0+',
      'Interactive chat demo interface',
      'Sample conversations showcasing UI',
      'Download via Telegram bot (@MunirChatBot)',
      'WebP image optimization',
      '139+ custom app icons',
      'Portfolio showcase in app',
      'Battery optimization'
    ],
    status: 'completed',
    testimonial: {
      text: 'The Android portfolio app perfectly demonstrates Munir's attention to detail and expertise in Material Design. Clean code and smooth performance!',
      author: 'Tech Reviewer',
      rating: 5
    }
  },
  {
    id: 'munirchat-bot',
    title: 'MunirChat AI Assistant',
    description: 'Intelligent chatbot with NLP for customer support and automated user onboarding.',
    longDescription: 'An AI-powered chatbot that provides automated customer support, answers FAQs, and helps users navigate the MunirChat ecosystem. Built with Python and modern NLP techniques, featuring natural language understanding, multi-language support (5 languages), context-aware responses, and integration with Telegram for instant messaging.',
    image: '/images/projects/munirchat-bot.png',
    images: [
      '/images/projects/munirchat-bot-1.png',
      '/images/projects/munirchat-bot-2.png',
      '/images/projects/munirchat-bot-3.png'
    ],
    technologies: ['Python', 'Google Gemini API', 'Python-Telegram-Bot', 'Docker', 'Plugin System', 'Redis', 'Telegram API'],
    category: 'fullstack',
    liveUrl: 'https://t.me/MunirChatBot',
    githubUrl: 'https://github.com/munir/munirchat-bot',
    featured: true,
    completedDate: 'Sep 2024',
    client: 'Personal Project',
    telegramAccess: {
      botUsername: '@MunirChatBot',
      startCommand: '/start',
      demoPrompts: [
        'Tell me about MunirChat',
        'How secure is your messaging?',
        'Can you show me some portfolio examples?',
        'What technologies do you work with?',
        '/help for all commands'
      ],
      liveDemoAvailable: true,
      requiresAuthentication: false,
      responseTime: '< 2 seconds',
      availablePlugins: ['weather', 'translator', 'image-search', 'web-search', 'crypto', 'spotify', 'location']
    },
    keyFeatures: [
      'Natural language understanding with Gemini Pro',
      'Multi-language support (5 languages)',
      'Context-aware conversation flow',
      'Integration with Telegram',
      'Live portfolio showcase via Telegram',
      '24/7 availability',
      'Plugin system with 16 specialized tools',
      'Real-time response generation',
      'Try it now: just message @MunirChatBot on Telegram'
    ],
    status: 'completed',
    testimonial: {
      text: 'The AI assistant has reduced our support workload by 60%. It understands context perfectly and provides accurate responses.',
      author: 'Support Team Lead',
      rating: 5
    }
  },
  {
    id: 'munirchat-web',
    title: 'MunirChat Web Dashboard',
    description: 'Admin dashboard for managing MunirChat ecosystem with real-time analytics and user management.',
    longDescription: 'A comprehensive web-based admin dashboard built with React and TypeScript. Features real-time analytics, user management, content moderation tools, and system monitoring. Integrates with all MunirChat platform services to provide centralized control and insights.',
    image: '/images/projects/munirchat-dashboard.png',
    images: [
      '/images/projects/munirchat-dashboard-1.png',
      '/images/projects/munirchat-dashboard-2.png'
    ],
    technologies: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Chart.js', 'WebSocket', 'REST API'],
    category: 'web',
    liveUrl: 'https://dashboard.munirchat.org',
    githubUrl: 'https://github.com/munir/munirchat-dashboard',
    featured: false,
    completedDate: 'Aug 2024',
    keyFeatures: [
      'Real-time analytics dashboard',
      'User management system',
      'Content moderation tools',
      'System monitoring',
      'Dark/Light theme support',
      'Responsive design',
      'Role-based access control'
    ],
    status: 'in-progress'
  },
  {
    id: 'munirchat-api',
    title: 'MunirChat API Gateway',
    description: 'Scalable API gateway handling all backend services for the MunirChat ecosystem.',
    longDescription: 'A microservices-based API gateway built with Node.js and Express, handling authentication, message routing, media processing, and real-time communications. Implements end-to-end encryption, rate limiting, and horizontal scaling.',
    image: '/images/projects/munirchat-api.png',
    technologies: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'WebSocket'],
    category: 'fullstack',
    githubUrl: 'https://github.com/munir/munirchat-api',
    featured: false,
    completedDate: 'Jul 2024',
    keyFeatures: [
      'Microservices architecture',
      'End-to-end encryption',
      'Real-time message routing',
      'Media processing pipeline',
      'Rate limiting & DDoS protection',
      'Horizontal scaling support',
      'GraphQL and REST endpoints'
    ],
    status: 'completed'
  },
  {
    id: 'portfolio-website',
    title: 'Personal Portfolio Website',
    description: 'Modern portfolio website showcasing projects and technical skills.',
    longDescription: 'A responsive portfolio website built with React and TypeScript, featuring smooth animations, dark mode support, and interactive project showcases. Optimized for performance with lazy loading and code splitting.',
    image: '/images/projects/portfolio.png',
    technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    category: 'web',
    liveUrl: 'https://munir.dev',
    githubUrl: 'https://github.com/munir/portfolio',
    featured: false,
    completedDate: 'Sep 2024',
    keyFeatures: [
      'Responsive design',
      'Dark/Light theme',
      'Smooth animations',
      'SEO optimized',
      'Performance optimized',
      'Accessibility compliant'
    ],
    status: 'completed'
  }
];

// Export function to get featured projects
export const getFeaturedProjects = () => {
  return munirProjects.filter(project => project.featured);
};

// Export function to get projects by category
export const getProjectsByCategory = (category: string) => {
  if (category === 'all') return munirProjects;
  return munirProjects.filter(project => project.category === category);
};

// Export function to get project by ID
export const getProjectById = (id: string) => {
  return munirProjects.find(project => project.id === id);
};

// Project statistics
export const projectStats = {
  totalProjects: munirProjects.length,
  completedProjects: munirProjects.filter(p => p.status === 'completed').length,
  inProgressProjects: munirProjects.filter(p => p.status === 'in-progress').length,
  featuredProjects: munirProjects.filter(p => p.featured).length,
  categories: {
    mobile: munirProjects.filter(p => p.category === 'mobile').length,
    web: munirProjects.filter(p => p.category === 'web').length,
    fullstack: munirProjects.filter(p => p.category === 'fullstack').length,
  },
  totalIcons: 394, // 255 iOS + 139+ Android
  totalModules: 14, // 6 iOS + 8 Android
  technologies: Array.from(new Set(munirProjects.flatMap(p => p.technologies))).length
};
