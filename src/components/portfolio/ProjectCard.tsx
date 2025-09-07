import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { EnhancedVideoPlayer } from '@/components/ui/enhanced-video-player';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Github, 
  Star, 
  Calendar, 
  Code, 
  Smartphone,
  Globe,
  Eye,
  Heart,
  Zap,
  Bot,
  TrendingUp,
  Cpu,
  MessageCircle,
  BarChart3,
  Play,
  Video
} from 'lucide-react';
import TelegramIntegration from './TelegramIntegration';
import { parseVideoUrl, getVideoSizeInfo } from '@/utils/videoUtils';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[];
  videoUrl?: string;  // Supports both local uploads and YouTube/Vimeo URLs
  youtubeUrl?: string;  // Legacy support, now merged with videoUrl
  technologies: string[];
  category: 'web' | 'mobile' | 'fullstack' | 'design' | 'bot' | 'ai' | 'trading' | 'automation' | 'other';
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  completedDate: string;
  client?: string;
  testimonial?: {
    text: string;
    author: string;
    rating: number;
  };
  keyFeatures?: string[];
  status: 'completed' | 'in-progress' | 'coming-soon';
  telegramAccess?: {
    botUsername: string;
    startCommand: string;
    demoPrompts: string[];
    liveDemoAvailable: boolean;
    requiresAuthentication: boolean;
    responseTime: string;
    availablePlugins: string[];
  };
  downloadOptions?: {
    // Android specific
    googlePlay?: string;
    directApk?: string;
    // iOS specific  
    appStore?: string;
    testFlight?: string;
    // Common
    qrCode: string;
    minRequirements: string;
    size: string;
    latestVersion: string;
    telegramBot: string;
    telegramCommand: string;
    platform?: 'iOS' | 'Android';
  };
}

interface ProjectCardProps {
  project: Project;
  className?: string;
  showFullDetails?: boolean;
}

const categoryIcons = {
  web: Globe,
  mobile: Smartphone,
  fullstack: Code,
  design: Heart,
  bot: Bot,
  ai: Cpu,
  trading: TrendingUp,
  automation: Zap,
  other: Star,
};

const categoryColors = {
  web: 'bg-blue-500',
  mobile: 'bg-blue-600',
  fullstack: 'bg-purple-500',
  design: 'bg-purple-600',
  bot: 'bg-purple-700',
  ai: 'bg-blue-700',
  trading: 'bg-slate-600',
  automation: 'bg-slate-500',
  other: 'bg-slate-400',
};

export default function ProjectCard({ project, className = '', showFullDetails = false }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const CategoryIcon = categoryIcons[project.category];
  const categoryColor = categoryColors[project.category];

  // Get the primary video URL (videoUrl takes precedence over legacy youtubeUrl)
  const primaryVideoUrl = project.videoUrl || project.youtubeUrl;
  const videoInfo = primaryVideoUrl ? parseVideoUrl(primaryVideoUrl) : null;
  const hasVideo = Boolean(primaryVideoUrl);

  const handleImageLoad = () => setImageLoaded(true);
  
  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      'React': 'bg-blue-500',
      'TypeScript': 'bg-blue-600',
      'JavaScript': 'bg-blue-700',
      'Node.js': 'bg-purple-600',
      'Python': 'bg-purple-500',
      'Next.js': 'bg-slate-800',
      'Vue.js': 'bg-blue-600',
      'Angular': 'bg-purple-700',
      'React Native': 'bg-blue-500',
      'Flutter': 'bg-blue-400',
      'iOS': 'bg-slate-600',
      'Android': 'bg-blue-700',
      'Tailwind CSS': 'bg-blue-500',
      'CSS': 'bg-blue-400',
      'HTML': 'bg-purple-500',
      'PHP': 'bg-purple-600',
      'Laravel': 'bg-purple-700',
      'WordPress': 'bg-blue-700',
      'MongoDB': 'bg-purple-700',
      'PostgreSQL': 'bg-blue-700',
      'MySQL': 'bg-slate-600',
      'Firebase': 'bg-purple-500',
      'AWS': 'bg-slate-500',
      'Docker': 'bg-blue-600',
    };
    return colors[tech] || 'bg-slate-500';
  };

  return (
    <motion.div
      whileHover={{ 
        y: -8,
        rotateX: 5,
        rotateY: 5,
        scale: 1.02
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      <Card className="group hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white dark:bg-gray-900 hover:bg-gradient-to-br hover:from-white hover:to-blue-50 dark:hover:from-gray-900 dark:hover:to-blue-950 overflow-hidden">
        {/* Animated glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
        {/* Project Media - Image or Video */}
        <div className="relative overflow-hidden">
          {hasVideo && showVideo ? (
            <div className="aspect-video">
              <EnhancedVideoPlayer
                videoUrl={primaryVideoUrl!}
                title={project.title}
                thumbnailUrl={project.image}
                description={project.description}
                className="w-full h-full"
              />
            </div>
          ) : (
            <div className={`aspect-video bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
              <motion.img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
              
              {/* Video Play Button Overlay */}
              {hasVideo && (
                <motion.div
                  className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ opacity: 1 }}
                >
                  <motion.button
                    onClick={() => setShowVideo(true)}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full p-4 transition-all duration-300 hover:scale-110"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-8 h-8 text-white fill-white translate-x-0.5" />
                  </motion.button>
                  
                  {/* Video Info Badge */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    {videoInfo?.type === 'youtube' ? 'YouTube' : 
                     videoInfo?.type === 'vimeo' ? 'Vimeo' : 
                     videoInfo?.type === 'local' ? getVideoSizeInfo(primaryVideoUrl!) : 'Video'}
                  </div>
                </motion.div>
              )}
            </div>
          )}
          
          {/* Overlay with actions */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
          >
            {project.liveUrl && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl border-0 px-4 py-2"
                  onClick={() => window.open(project.liveUrl, '_blank')}
                >
                  🔗 <span className="ml-2">Live Demo</span>
                </Button>
              </motion.div>
            )}
            {project.githubUrl && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900 shadow-lg hover:shadow-xl border-0 px-4 py-2"
                  onClick={() => window.open(project.githubUrl, '_blank')}
                >
                  💻 <span className="ml-2">GitHub Repo</span>
                </Button>
              </motion.div>
            )}
          </motion.div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge 
            variant={project.status === 'completed' ? 'default' : 'secondary'}
            className={`${
              project.status === 'completed' ? 'bg-green-500' : 
              project.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
            } text-white`}
          >
            {project.status.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Featured Badge */}
        {project.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}

        {/* Like Button */}
        <button
          className="absolute bottom-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-200 hover:scale-110"
          onClick={() => setIsLiked(!isLiked)}
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`} 
          />
        </button>
      </div>

      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* Category & Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${categoryColor} text-white`}>
              <CategoryIcon className="w-3 h-3" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {project.category.replace('-', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Calendar className="w-3 h-3" />
            {project.completedDate}
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-3">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight">
            {project.title}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base line-clamp-2 leading-relaxed">
            {project.description}
          </p>
        </div>

        {/* Client */}
        {project.client && (
          <div className="py-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Client: <span className="font-medium text-gray-800 dark:text-gray-200">{project.client}</span>
            </p>
          </div>
        )}

        {/* Video Toggle (if video available) */}
        {hasVideo && (
          <div className="py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Video className="w-4 h-4" />
                <span>
                  {videoInfo?.type === 'youtube' ? 'YouTube Video' : 
                   videoInfo?.type === 'vimeo' ? 'Vimeo Video' : 
                   `Video (${getVideoSizeInfo(primaryVideoUrl!)})`}
                </span>
              </div>
              <Button
                size="sm"
                variant={showVideo ? "default" : "outline"}
                onClick={() => setShowVideo(!showVideo)}
                className="h-8 px-3 text-xs"
              >
                {showVideo ? (
                  <>📷 Show Image</>
                ) : (
                  <>▶️ Show Video</>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 py-2">
          {project.technologies.slice(0, showFullDetails ? undefined : 4).map((tech, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`${getTechColor(tech)} text-white text-xs px-2.5 py-1`}
            >
              {tech}
            </Badge>
          ))}
          {!showFullDetails && project.technologies.length > 4 && (
            <Badge variant="outline" className="text-xs px-2.5 py-1">
              +{project.technologies.length - 4} more
            </Badge>
          )}
        </div>

        {/* Key Features (if showing full details) */}
        {showFullDetails && project.keyFeatures && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Key Features:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              {project.keyFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Testimonial */}
        {project.testimonial && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < project.testimonial!.rating 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm italic text-gray-700 dark:text-gray-300 mb-2">
              "{project.testimonial.text}"
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              - {project.testimonial.author}
            </p>
          </div>
        )}
      </CardContent>

      {/* Telegram Integration */}
      {showFullDetails && (
        <div className="px-6">
          <TelegramIntegration 
            projectId={project.id}
            telegramAccess={project.telegramAccess}
            downloadOptions={project.downloadOptions}
          />
        </div>
      )}

        <CardFooter className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            {project.liveUrl && (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="default"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-0 h-10 sm:h-11"
                  onClick={() => window.open(project.liveUrl, '_blank')}
                >
                  🔗 <span className="ml-2">Live Demo</span>
                </Button>
              </motion.div>
            )}
            {project.githubUrl && (
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold transition-all duration-300 h-10 sm:h-11"
                  onClick={() => window.open(project.githubUrl, '_blank')}
                >
                  💻 <span className="ml-2">GitHub Repo</span>
                </Button>
              </motion.div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
