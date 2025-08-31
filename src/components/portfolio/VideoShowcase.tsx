import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Download, 
  Maximize, 
  Volume2, 
  VolumeX,
  ExternalLink,
  Calendar,
  Clock,
  Eye,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoProject {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  category: string;
  technologies: string[];
  duration: string;
  fileSize: string;
  completedDate: string;
  featured?: boolean;
  githubUrl?: string;
  liveUrl?: string;
}

interface VideoShowcaseProps {
  project: VideoProject;
  className?: string;
}

export default function VideoShowcase({ project, className }: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    // Check if video exists, otherwise show message
    fetch(project.videoUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          const link = document.createElement('a');
          link.href = project.videoUrl;
          const ext = project.videoUrl.split('.').pop() || 'mp4';
          link.download = `${project.title.replace(/\s+/g, '_')}_demo.${ext}`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert('Video not yet available. Please compress and upload your large source video to a smaller web-friendly format.');
        }
      })
      .catch(() => {
        alert('Video not yet available. Please add your demo video to the public/videos folder.');
      });
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTechColor = (tech: string) => {
    const colors: Record<string, string> = {
      'React': 'bg-blue-500',
      'TypeScript': 'bg-blue-600',
      'Node.js': 'bg-green-600',
      'MongoDB': 'bg-green-700',
      'Stripe': 'bg-purple-600',
      'Tailwind CSS': 'bg-teal-500',
      'Express': 'bg-gray-600',
      'JWT': 'bg-orange-500',
      'Booking System': 'bg-indigo-500',
    };
    return colors[tech] || 'bg-gray-500';
  };

  return (
    <Card className={cn("group hover:shadow-2xl transition-all duration-300", className)}>
      <div className="relative">
        {/* Video Player */}
        <div 
          className="relative aspect-video bg-black rounded-t-lg overflow-hidden cursor-pointer"
          onMouseEnter={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
          onClick={handlePlayPause}
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={project.thumbnailUrl}
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onLoadStart={() => setIsLoading(true)}
            onLoadedData={() => setIsLoading(false)}
          >
            {/* Try to infer the correct MIME type from the file extension */}
            {(() => {
              const ext = project.videoUrl.split('.').pop()?.toLowerCase();
              const mime = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
              return <source src={project.videoUrl} type={mime} />;
            })()}
            Your browser does not support the video tag.
          </video>

          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}

          {/* Play/Pause Overlay */}
          {!isPlaying && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="lg"
                className="bg-white/20 hover:bg-white/30 text-white border-0 rounded-full w-16 h-16"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Video Controls */}
          {showControls && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Progress Bar */}
              <div 
                className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
                onClick={handleSeek}
              >
                <div 
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPause();
                    }}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMuteToggle();
                    }}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>

                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-white/20 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFullscreen();
                    }}
                  >
                    <Maximize className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Featured Badge */}
          {project.featured && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}

          {/* Duration Badge */}
          <div className="absolute top-3 left-3">
            <Badge className="bg-black/70 text-white">
              <Clock className="w-3 h-3 mr-1" />
              {project.duration}
            </Badge>
          </div>
        </div>

        {/* Project Info */}
        <CardContent className="p-6">
          {/* Category & Date */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {project.category}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              {project.completedDate}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1 mb-4">
            {project.technologies.map((tech, index) => (
              <Badge
                key={index}
                variant="secondary"
                className={`${getTechColor(tech)} text-white text-xs px-2 py-1`}
              >
                {tech}
              </Badge>
            ))}
          </div>

          {/* Video Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>Video Demo</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{project.fileSize}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Video
            </Button>
            
            {project.githubUrl && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(project.githubUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Source Code
              </Button>
            )}

            {project.liveUrl && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open(project.liveUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

export type { VideoProject };
