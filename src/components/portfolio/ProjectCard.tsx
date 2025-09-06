import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { 
  ExternalLink, 
  Github, 
  Star, 
  Calendar, 
  Code, 
  Smartphone,
  Globe,
  Eye,
  Heart
} from 'lucide-react';
import TelegramIntegration from './TelegramIntegration';

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  images?: string[];
  technologies: string[];
  category: 'web' | 'mobile' | 'fullstack' | 'design' | 'other';
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
  other: Star,
};

const categoryColors = {
  web: 'bg-blue-500',
  mobile: 'bg-green-500',
  fullstack: 'bg-purple-500',
  design: 'bg-pink-500',
  other: 'bg-gray-500',
};

export default function ProjectCard({ project, className = '', showFullDetails = false }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const CategoryIcon = categoryIcons[project.category];
  const categoryColor = categoryColors[project.category];

  const handleImageLoad = () => setImageLoaded(true);
  
  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      'React': 'bg-blue-500',
      'TypeScript': 'bg-blue-600',
      'JavaScript': 'bg-yellow-500',
      'Node.js': 'bg-green-600',
      'Python': 'bg-green-500',
      'Next.js': 'bg-black',
      'Vue.js': 'bg-green-500',
      'Angular': 'bg-red-500',
      'React Native': 'bg-blue-500',
      'Flutter': 'bg-blue-400',
      'iOS': 'bg-gray-600',
      'Android': 'bg-green-600',
      'Tailwind CSS': 'bg-teal-500',
      'CSS': 'bg-blue-400',
      'HTML': 'bg-orange-500',
      'PHP': 'bg-purple-500',
      'Laravel': 'bg-red-600',
      'WordPress': 'bg-blue-700',
      'MongoDB': 'bg-green-700',
      'PostgreSQL': 'bg-blue-700',
      'MySQL': 'bg-orange-600',
      'Firebase': 'bg-yellow-500',
      'AWS': 'bg-orange-500',
      'Docker': 'bg-blue-600',
    };
    return colors[tech] || 'bg-gray-500';
  };

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      {/* Project Image */}
      <div className="relative overflow-hidden">
        <div className={`aspect-video bg-gray-100 ${!imageLoaded ? 'animate-pulse' : ''}`}>
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onLoad={handleImageLoad}
          />
        </div>
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.liveUrl && (
            <Button
              size="sm"
              className="bg-white text-black hover:bg-gray-100"
              onClick={() => window.open(project.liveUrl, '_blank')}
            >
              <Eye className="w-4 h-4 mr-2" />
              Live Demo
            </Button>
          )}
          {project.githubUrl && (
            <Button
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              <Github className="w-4 h-4 mr-2" />
              Code
            </Button>
          )}
        </div>

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

      <CardContent className="p-6">
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
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
          {project.title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Client */}
        {project.client && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Client: <span className="font-medium text-gray-800 dark:text-gray-200">{project.client}</span>
          </p>
        )}

        {/* Technologies */}
        <div className="flex flex-wrap gap-1 mb-4">
          {project.technologies.slice(0, showFullDetails ? undefined : 4).map((tech, index) => (
            <Badge
              key={index}
              variant="secondary"
              className={`${getTechColor(tech)} text-white text-xs px-2 py-1`}
            >
              {tech}
            </Badge>
          ))}
          {!showFullDetails && project.technologies.length > 4 && (
            <Badge variant="outline" className="text-xs">
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

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex gap-2 w-full">
          {project.liveUrl && (
            <Button
              variant="default"
              className="flex-1"
              onClick={() => window.open(project.liveUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Live Demo
            </Button>
          )}
          {project.githubUrl && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              <Github className="w-4 h-4 mr-2" />
              Source Code
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
