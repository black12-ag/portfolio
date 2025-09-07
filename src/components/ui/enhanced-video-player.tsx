import * as React from "react";
import { cn } from "@/lib/utils";
import { Play, X, ExternalLink, Youtube } from "lucide-react";
import { parseVideoUrl, VideoInfo } from "@/utils/videoUtils";

interface EnhancedVideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  description?: string;
  aspectRatio?: "16/9" | "4/3" | "1/1";
  autoGenerateThumbnail?: boolean;
}

const EnhancedVideoPlayer = React.forwardRef<HTMLDivElement, EnhancedVideoPlayerProps>(
  (
    {
      className,
      videoUrl,
      title,
      thumbnailUrl,
      description,
      aspectRatio = "16/9",
      autoGenerateThumbnail = true,
      ...props
    },
    ref
  ) => {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [videoInfo, setVideoInfo] = React.useState<VideoInfo | null>(null);
    const [actualThumbnail, setActualThumbnail] = React.useState<string>('');
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Parse video URL and get video info
    React.useEffect(() => {
      if (videoUrl) {
        const info = parseVideoUrl(videoUrl);
        setVideoInfo(info);
        
        // Set thumbnail based on video type
        if (thumbnailUrl) {
          setActualThumbnail(thumbnailUrl);
        } else if (info.thumbnailUrl) {
          setActualThumbnail(info.thumbnailUrl);
        } else if (info.type === 'local' && autoGenerateThumbnail) {
          // For local videos, we'll generate a thumbnail when video loads
          setActualThumbnail('');
        }
      }
    }, [videoUrl, thumbnailUrl, autoGenerateThumbnail]);

    // Generate thumbnail from local video
    const generateThumbnailFromVideo = React.useCallback(() => {
      if (videoRef.current && videoInfo?.type === 'local' && !actualThumbnail) {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          setActualThumbnail(thumbnail);
        }
      }
    }, [videoInfo?.type, actualThumbnail]);

    // Handle escape key for modal
    React.useEffect(() => {
      const handleEsc = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          setIsModalOpen(false);
        }
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
      };
    }, []);

    // Prevent body scroll when modal is open
    React.useEffect(() => {
      if (isModalOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'auto';
      }
      
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, [isModalOpen]);

    if (!videoInfo) {
      return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
          <p className="text-gray-500 dark:text-gray-400">No video available</p>
        </div>
      );
    }

    const renderVideoPlayer = () => {
      if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
        return (
          <iframe
            src={videoInfo.embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full rounded-lg shadow-2xl"
          />
        );
      } else {
        return (
          <video
            ref={videoRef}
            controls
            autoPlay
            className="h-full w-full rounded-lg shadow-2xl"
            onLoadedMetadata={generateThumbnailFromVideo}
          >
            <source src={videoInfo.embedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      }
    };

    const getDisplayThumbnail = () => {
      if (actualThumbnail) {
        return actualThumbnail;
      }
      
      // Fallback placeholder based on video type
      if (videoInfo.type === 'youtube') {
        return `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`;
      }
      
      // Generic video placeholder
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTMwLDc1IDE4MCwxMDUgMTMwLDEzNSIgZmlsbD0iIzY2NiIvPgo8L3N2Zz4K';
    };

    return (
      <>
        <div
          ref={ref}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className
          )}
          style={{ aspectRatio }}
          onClick={() => setIsModalOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
          tabIndex={0}
          aria-label={`Play video: ${title}`}
          {...props}
        >
          {/* Video Type Badge */}
          <div className="absolute top-2 left-2 z-10">
            {videoInfo.type === 'youtube' && (
              <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Youtube className="w-3 h-3" />
                YouTube
              </div>
            )}
            {videoInfo.type === 'vimeo' && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                Vimeo
              </div>
            )}
            {videoInfo.type === 'local' && (
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                Local
              </div>
            )}
          </div>

          {/* Thumbnail Image */}
          <img
            src={getDisplayThumbnail()}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to placeholder if thumbnail fails to load
              e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjMzMzIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTMwLDc1IDE4MCwxMDUgMTMwLDEzNSIgZmlsbD0iIzY2NiIvPgo8L3N2Zz4K';
            }}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30 group-hover:border-white/50">
              <Play className="h-8 w-8 fill-white text-white translate-x-0.5" />
            </div>
          </div>

          {/* External Link Icon for YouTube/Vimeo */}
          {(videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') && (
            <div className="absolute top-2 right-2">
              <div className="bg-black/50 text-white p-1 rounded">
                <ExternalLink className="w-3 h-3" />
              </div>
            </div>
          )}

          {/* Title and Description */}
          <div className="absolute bottom-0 left-0 p-6 right-0">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 line-clamp-2">{title}</h3>
            {description && (
              <p className="text-sm text-white/80 line-clamp-2">{description}</p>
            )}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Video Modal */}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in-0 duration-300"
            aria-modal="true"
            role="dialog"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white transition-all duration-200 hover:bg-white/20 hover:scale-110"
              aria-label="Close video player"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Video Container */}
            <div className="w-full max-w-6xl mx-4">
              <div className="relative aspect-video w-full">
                {renderVideoPlayer()}
              </div>
              
              {/* Video info below */}
              <div className="mt-4 text-center">
                <h2 className="text-white text-xl font-semibold mb-1">{title}</h2>
                {description && (
                  <p className="text-white/80 text-sm">{description}</p>
                )}
                {/* Video source info */}
                <div className="mt-2 flex items-center justify-center gap-4 text-white/60 text-xs">
                  <span className="capitalize">{videoInfo.type} Video</span>
                  {videoInfo.type !== 'local' && (
                    <a
                      href={videoInfo.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Original
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

EnhancedVideoPlayer.displayName = "EnhancedVideoPlayer";

export { EnhancedVideoPlayer };
export type { EnhancedVideoPlayerProps };
